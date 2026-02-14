'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Alert, Button, Card, Empty, Input, Layout, Space, Typography } from 'antd';
import {
  DiscoveryConfigError,
  searchYoutubeByQuery,
} from '@/app/page-modules/hobby/api/discovery-api';
import type { DiscoveryItem } from '@/app/page-modules/hobby/types/discovery';
import type { PanelSearchMode, PanelSortOrder } from '@/app/page-modules/hobby/types/panel';
import { DraggablePanelCard } from '@/app/page-modules/hobby/components/DraggablePanelCard';
import {
  DEFAULT_PANEL_SEARCH_MODE,
  DEFAULT_PANEL_SORT_ORDER,
} from '@/app/page-modules/hobby/constants/panel';

type StoredPanel = {
  id: string;
  title: string;
  searchTerms: string[];
  activeTerm: string;
  sortOrder: PanelSortOrder;
  searchMode: PanelSearchMode;
};

type LegacyStoredPanel = Partial<StoredPanel> & {
  id?: string;
  title?: string;
  query?: string;
};

type PanelState = StoredPanel & {
  items: DiscoveryItem[];
  loading: boolean;
  error: string | null;
  searched: boolean;
};

const STORAGE_KEY = 'hobby_custom_panels_v1';

function getStorage(): Storage | null {
  const storage = globalThis.localStorage;
  if (!storage) {
    return null;
  }
  if (typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function') {
    return null;
  }
  return storage;
}

function parseStoredPanels(storage: Storage | null): PanelState[] {
  if (!storage) {
    return [];
  }

  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as LegacyStoredPanel[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((panel): panel is LegacyStoredPanel & { id: string; title: string } =>
        Boolean(panel.id && panel.title),
      )
      .map((panel) => {
        const rawTerms = Array.isArray(panel.searchTerms)
          ? panel.searchTerms
          : panel.query
            ? [panel.query]
            : [];
        const searchTerms = Array.from(
          new Set(rawTerms.map((term) => term.trim()).filter((term) => term.length > 0)),
        );
        const activeTerm =
          panel.activeTerm && searchTerms.includes(panel.activeTerm)
            ? panel.activeTerm
            : (searchTerms[0] ?? '');
        const sortOrder =
          panel.sortOrder === 'date' ||
          panel.sortOrder === 'viewCount' ||
          panel.sortOrder === 'relevance'
            ? panel.sortOrder
            : DEFAULT_PANEL_SORT_ORDER;
        const searchMode =
          panel.searchMode === 'labelOnly' || panel.searchMode === 'categoryPlusLabel'
            ? panel.searchMode
            : DEFAULT_PANEL_SEARCH_MODE;

        return {
          id: panel.id,
          title: panel.title,
          searchTerms,
          activeTerm,
          sortOrder,
          searchMode,
          items: [],
          loading: false,
          error: null,
          searched: false,
        };
      });
  } catch {
    storage.removeItem(STORAGE_KEY);
    return [];
  }
}

function toStoredPanels(panels: PanelState[]): StoredPanel[] {
  return panels.map(({ id, title, searchTerms, activeTerm, sortOrder, searchMode }) => ({
    id,
    title,
    searchTerms,
    activeTerm,
    sortOrder,
    searchMode,
  }));
}

function toPanelState(panel: StoredPanel): PanelState {
  return {
    ...panel,
    items: [],
    loading: false,
    error: null,
    searched: false,
  };
}

function createPanelId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `panel-${Date.now()}`;
}

function resolveSearchQuery(title: string, term: string, searchMode: PanelSearchMode): string {
  const normalizedTerm = term.trim();
  if (!normalizedTerm) {
    return '';
  }
  if (searchMode === 'labelOnly') {
    return normalizedTerm;
  }

  const normalizedTitle = title.trim();
  return normalizedTitle ? `${normalizedTitle} ${normalizedTerm}` : normalizedTerm;
}

export function HobbyHomePage() {
  const searchCacheRef = useRef<Map<string, DiscoveryItem[]>>(new Map());
  const [panels, setPanels] = useState<PanelState[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [newPanelTitle, setNewPanelTitle] = useState('');
  const [newPanelQuery, setNewPanelQuery] = useState('');
  const [newPanelError, setNewPanelError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    const restored = parseStoredPanels(getStorage());
    // Hydration mismatch 방지를 위해 mount 이후에만 클라이언트 저장값을 반영한다.
    queueMicrotask(() => {
      setPanels(restored);
      setStorageReady(true);
    });
  }, []);

  useEffect(() => {
    if (!storageReady) {
      return;
    }
    const storage = getStorage();
    if (!storage) {
      return;
    }
    storage.setItem(STORAGE_KEY, JSON.stringify(toStoredPanels(panels)));
  }, [panels, storageReady]);

  const panelCountText = useMemo(() => `패널 ${panels.length}개`, [panels.length]);

  const updatePanel = useCallback((id: string, updater: (panel: PanelState) => PanelState) => {
    setPanels((prev) => prev.map((panel) => (panel.id === id ? updater(panel) : panel)));
  }, []);

  const handleRemovePanel = useCallback((id: string) => {
    setPanels((prev) => prev.filter((panel) => panel.id !== id));
  }, []);

  const handleSearchPanel = useCallback(
    async (
      id: string,
      panelTitle: string,
      rawTerm: string,
      sortOrder: PanelSortOrder,
      searchMode: PanelSearchMode,
    ) => {
      const searchTerm = rawTerm.trim();
      const query = resolveSearchQuery(panelTitle, searchTerm, searchMode);
      const cacheKey = `${query.toLowerCase()}|${sortOrder}`;

      updatePanel(id, (panel) => ({
        ...panel,
        activeTerm: searchTerm,
        searchMode,
        searched: true,
        error: null,
        loading: Boolean(query),
        ...(searchTerm ? {} : { items: [] }),
      }));

      if (!searchTerm) {
        updatePanel(id, (panel) => ({ ...panel, error: '검색어 라벨을 선택해주세요.' }));
        return;
      }

      const cached = searchCacheRef.current.get(cacheKey);
      if (cached) {
        updatePanel(id, (panel) => ({
          ...panel,
          items: cached,
          loading: false,
          error: null,
        }));
        return;
      }

      try {
        const items = await searchYoutubeByQuery({ query, order: sortOrder, limit: 5 });
        searchCacheRef.current.set(cacheKey, items);
        updatePanel(id, (panel) => ({
          ...panel,
          items,
          loading: false,
          error: null,
        }));
      } catch (err) {
        const message =
          err instanceof DiscoveryConfigError
            ? 'YouTube API 키가 필요합니다. NEXT_PUBLIC_YOUTUBE_API_KEY를 확인해주세요.'
            : '검색 결과를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.';

        updatePanel(id, (panel) => ({
          ...panel,
          items: [],
          loading: false,
          error: message,
        }));
      }
    },
    [updatePanel],
  );

  const handleAddPanel = useCallback(() => {
    const title = newPanelTitle.trim();
    const initialTerms = Array.from(
      new Set(
        newPanelQuery
          .split(',')
          .map((term) => term.trim())
          .filter((term) => term.length > 0),
      ),
    );
    const firstTerm = initialTerms[0] ?? '';

    if (!title) {
      setNewPanelError('패널 이름을 입력해주세요.');
      return;
    }

    const normalizedTitle = title.toLowerCase();
    const hasDuplicateTitle = panels.some(
      (panel) => panel.title.trim().toLowerCase() === normalizedTitle,
    );
    if (hasDuplicateTitle) {
      setNewPanelError('같은 이름의 패널이 이미 있습니다.');
      return;
    }

    const id = createPanelId();
    setNewPanelError(null);
    setPanels((prev) => [
      ...prev,
      toPanelState({
        id,
        title,
        searchTerms: initialTerms,
        activeTerm: firstTerm,
        sortOrder: DEFAULT_PANEL_SORT_ORDER,
        searchMode: DEFAULT_PANEL_SEARCH_MODE,
      }),
    ]);
    setNewPanelTitle('');
    setNewPanelQuery('');

    if (firstTerm) {
      void handleSearchPanel(
        id,
        title,
        firstTerm,
        DEFAULT_PANEL_SORT_ORDER,
        DEFAULT_PANEL_SEARCH_MODE,
      );
    }
  }, [handleSearchPanel, newPanelQuery, newPanelTitle, panels]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    setPanels((prev) => {
      const oldIndex = prev.findIndex((panel) => panel.id === active.id);
      const newIndex = prev.findIndex((panel) => panel.id === over.id);
      if (oldIndex < 0 || newIndex < 0) {
        return prev;
      }
      return arrayMove(prev, oldIndex, newIndex);
    });
  }, []);

  useEffect(() => {
    if (!storageReady) {
      return;
    }

    panels
      .filter((panel) => panel.activeTerm.trim() && !panel.searched)
      .forEach((panel) => {
        void handleSearchPanel(
          panel.id,
          panel.title,
          panel.activeTerm,
          panel.sortOrder,
          panel.searchMode,
        );
      });
  }, [handleSearchPanel, panels, storageReady]);

  return (
    <Layout className="min-h-screen bg-slate-100 px-4 py-8 sm:px-8">
      <main className="mx-auto w-full max-w-5xl">
        <Space orientation="vertical" size={20} className="w-full">
          <section>
            <Typography.Title level={2} className="!mb-2">
              취미 모음 프로젝트
            </Typography.Title>
            <Typography.Paragraph type="secondary" className="!mb-0">
              기본 카테고리 대신, 원하는 커스텀 패널을 추가해 YouTube 콘텐츠를 저장/검색합니다.
            </Typography.Paragraph>
          </section>

          <section aria-label="커스텀 패널 추가">
            <Card title={`커스텀 패널 관리 · ${panelCountText}`} variant="borderless">
              <Space orientation="vertical" size={12} className="w-full">
                <Input
                  placeholder="패널 이름 (예: 러닝화 리뷰 모음)"
                  value={newPanelTitle}
                  onChange={(event) => setNewPanelTitle(event.target.value)}
                />
                <Input
                  placeholder="초기 검색어 라벨 (선택, 쉼표로 여러 개)"
                  value={newPanelQuery}
                  onChange={(event) => setNewPanelQuery(event.target.value)}
                />
                {newPanelError ? <Alert type="error" showIcon title={newPanelError} /> : null}
                <Space>
                  <Button type="primary" onClick={handleAddPanel} disabled={!storageReady}>
                    패널 추가
                  </Button>
                </Space>
              </Space>
            </Card>
          </section>

          <section aria-label="커스텀 패널 목록">
            {!storageReady ? (
              <Typography.Paragraph type="secondary">패널 불러오는 중...</Typography.Paragraph>
            ) : panels.length === 0 ? (
              <Empty description="아직 패널이 없습니다. 위에서 원하는 패널을 추가해보세요." />
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={panels.map((panel) => panel.id)}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {panels.map((panel) => (
                      <DraggablePanelCard
                        key={panel.id}
                        id={panel.id}
                        title={panel.title}
                        searchTerms={panel.searchTerms}
                        activeTerm={panel.activeTerm}
                        sortOrder={panel.sortOrder}
                        searchMode={panel.searchMode}
                        items={panel.items}
                        loading={panel.loading}
                        error={panel.error}
                        searched={panel.searched}
                        onRemove={() => handleRemovePanel(panel.id)}
                        onAddSearchTerm={(value) => {
                          const nextTerm = value.trim();
                          if (!nextTerm) {
                            updatePanel(panel.id, (current) => ({
                              ...current,
                              error: '추가할 검색어를 입력해주세요.',
                            }));
                            return false;
                          }

                          if (
                            panel.searchTerms.some(
                              (term) => term.trim().toLowerCase() === nextTerm.toLowerCase(),
                            )
                          ) {
                            updatePanel(panel.id, (current) => ({
                              ...current,
                              error: '이미 등록된 검색어 라벨입니다.',
                            }));
                            return false;
                          }

                          updatePanel(panel.id, (current) => ({
                            ...current,
                            searchTerms: [...current.searchTerms, nextTerm],
                            activeTerm: nextTerm,
                            error: null,
                          }));
                          void handleSearchPanel(
                            panel.id,
                            panel.title,
                            nextTerm,
                            panel.sortOrder,
                            panel.searchMode,
                          );
                          return true;
                        }}
                        onSelectSearchTerm={(term) => {
                          updatePanel(panel.id, (current) => ({
                            ...current,
                            activeTerm: term,
                            error: null,
                          }));
                          void handleSearchPanel(
                            panel.id,
                            panel.title,
                            term,
                            panel.sortOrder,
                            panel.searchMode,
                          );
                        }}
                        onRemoveSearchTerm={(term) => {
                          const nextTerms = panel.searchTerms.filter((item) => item !== term);
                          const nextActive =
                            panel.activeTerm === term ? (nextTerms[0] ?? '') : panel.activeTerm;

                          updatePanel(panel.id, (current) => ({
                            ...current,
                            searchTerms: nextTerms,
                            activeTerm: nextActive,
                            error: null,
                            ...(nextActive
                              ? {}
                              : {
                                  items: [],
                                  searched: false,
                                }),
                          }));

                          if (nextActive) {
                            void handleSearchPanel(
                              panel.id,
                              panel.title,
                              nextActive,
                              panel.sortOrder,
                              panel.searchMode,
                            );
                          }
                        }}
                        onChangeSortOrder={(sortOrder) => {
                          updatePanel(panel.id, (current) => ({
                            ...current,
                            sortOrder,
                            error: null,
                          }));
                          if (panel.activeTerm.trim()) {
                            void handleSearchPanel(
                              panel.id,
                              panel.title,
                              panel.activeTerm,
                              sortOrder,
                              panel.searchMode,
                            );
                          }
                        }}
                        onChangeSearchMode={(searchMode) => {
                          updatePanel(panel.id, (current) => ({
                            ...current,
                            searchMode,
                            error: null,
                          }));
                          if (panel.activeTerm.trim()) {
                            void handleSearchPanel(
                              panel.id,
                              panel.title,
                              panel.activeTerm,
                              panel.sortOrder,
                              searchMode,
                            );
                          }
                        }}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </section>
        </Space>
      </main>
    </Layout>
  );
}
