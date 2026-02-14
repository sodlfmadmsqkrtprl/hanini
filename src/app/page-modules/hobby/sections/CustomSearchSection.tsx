import { Alert, Card, Empty, Input, Skeleton, Space } from 'antd';
import { ContentItemList } from '../components/ContentItemList';
import type { DiscoveryItem } from '../types/discovery';

type CustomSearchSectionProps = {
  query: string;
  items: DiscoveryItem[];
  loading: boolean;
  error: string | null;
  searched: boolean;
  onChangeQuery: (value: string) => void;
  onSearch: (value: string) => void;
};

export function CustomSearchSection({
  query,
  items,
  loading,
  error,
  searched,
  onChangeQuery,
  onSearch,
}: CustomSearchSectionProps) {
  return (
    <section aria-label="커스텀 검색 패널">
      <Card title="커스텀 YouTube 검색" variant="borderless">
        <Space orientation="vertical" size={12} className="w-full">
          <Input.Search
            placeholder="검색어를 입력하세요. 예) 코바늘 초보"
            value={query}
            onChange={(event) => onChangeQuery(event.target.value)}
            onSearch={onSearch}
            enterButton="검색"
            allowClear
          />
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
    </section>
  );
}
