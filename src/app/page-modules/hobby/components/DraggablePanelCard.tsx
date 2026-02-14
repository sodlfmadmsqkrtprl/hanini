'use client';

import { useState } from 'react';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { Alert, Button, Card, Empty, Input, Select, Skeleton, Space, Switch, Tag } from 'antd';
import { ContentItemList } from './ContentItemList';
import type { DiscoveryItem } from '../types/discovery';
import type { PanelSearchMode, PanelSortOrder } from '../types/panel';
import { PANEL_SORT_OPTIONS } from '../constants/panel';

type DraggablePanelCardProps = {
  id: string;
  title: string;
  searchTerms: string[];
  activeTerm: string;
  sortOrder: PanelSortOrder;
  searchMode: PanelSearchMode;
  items: DiscoveryItem[];
  loading: boolean;
  error: string | null;
  searched: boolean;
  onRemove: () => void;
  onAddSearchTerm: (value: string) => boolean;
  onSelectSearchTerm: (value: string) => void;
  onRemoveSearchTerm: (value: string) => void;
  onChangeSortOrder: (value: PanelSortOrder) => void;
  onChangeSearchMode: (value: PanelSearchMode) => void;
};

export function DraggablePanelCard({
  id,
  title,
  searchTerms,
  activeTerm,
  sortOrder,
  searchMode,
  items,
  loading,
  error,
  searched,
  onRemove,
  onAddSearchTerm,
  onSelectSearchTerm,
  onRemoveSearchTerm,
  onChangeSortOrder,
  onChangeSearchMode,
}: DraggablePanelCardProps) {
  const [newSearchTerm, setNewSearchTerm] = useState('');
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.75 : 1,
  };

  function handleAddSearchTerm() {
    const created = onAddSearchTerm(newSearchTerm);
    if (created) {
      setNewSearchTerm('');
    }
  }

  return (
    <div ref={setNodeRef} style={style} className="h-full">
      <Card
        title={title}
        variant="borderless"
        className="h-full"
        extra={
          <Space>
            <Button size="small" {...attributes} {...listeners}>
              이동
            </Button>
            <Button size="small" danger onClick={onRemove}>
              삭제
            </Button>
          </Space>
        }
      >
        <Space orientation="vertical" size={12} className="w-full">
          <Select
            className="w-full"
            value={sortOrder}
            onChange={onChangeSortOrder}
            options={PANEL_SORT_OPTIONS}
            aria-label="정렬 기준"
          />
          <Space align="center">
            <Switch
              checked={searchMode === 'labelOnly'}
              onChange={(checked) =>
                onChangeSearchMode(checked ? 'labelOnly' : 'categoryPlusLabel')
              }
              aria-label="라벨만 검색"
            />
            <span className="text-sm text-slate-600">라벨만 검색</span>
          </Space>

          <Input
            placeholder="검색어 라벨 추가 (예: 나이키)"
            value={newSearchTerm}
            onChange={(event) => setNewSearchTerm(event.target.value)}
            onPressEnter={handleAddSearchTerm}
            allowClear
          />
          <Button onClick={handleAddSearchTerm}>라벨 추가</Button>

          <Space size={[8, 8]} wrap>
            {searchTerms.map((term) => (
              <Tag
                key={term}
                color={activeTerm === term ? 'blue' : undefined}
                className="cursor-pointer"
                closable
                onClick={() => onSelectSearchTerm(term)}
                onClose={(event) => {
                  event.preventDefault();
                  onRemoveSearchTerm(term);
                }}
              >
                {term}
              </Tag>
            ))}
          </Space>

          {error ? <Alert type="error" showIcon title={error} /> : null}
          {loading ? <Skeleton active paragraph={{ rows: 4 }} title={false} /> : null}

          {!loading && searched && !error && items.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="검색 결과가 없습니다. 다른 키워드로 시도해보세요."
            />
          ) : null}

          {!loading && items.length > 0 ? <ContentItemList items={items} youtubeOnly /> : null}
        </Space>
      </Card>
    </div>
  );
}
