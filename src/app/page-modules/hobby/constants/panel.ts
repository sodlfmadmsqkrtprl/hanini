import type { PanelSearchMode, PanelSortOrder } from '../types/panel';

export const DEFAULT_PANEL_SORT_ORDER: PanelSortOrder = 'relevance';
export const DEFAULT_PANEL_SEARCH_MODE: PanelSearchMode = 'categoryPlusLabel';

export const PANEL_SORT_OPTIONS: Array<{ label: string; value: PanelSortOrder }> = [
  { label: '관련도순', value: 'relevance' },
  { label: '최신순', value: 'date' },
  { label: '인기순', value: 'viewCount' },
];
