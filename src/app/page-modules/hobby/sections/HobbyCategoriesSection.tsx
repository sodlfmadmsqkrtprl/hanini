import Link from 'next/link';
import { Card, Col, Empty, Row, Skeleton, Space, Tag, Typography } from 'antd';
import type { DiscoveryCategoryResult } from '../types/discovery';
import { ContentItemList } from '../components/ContentItemList';

type HobbyCategoriesSectionProps = {
  categories: DiscoveryCategoryResult[];
  loading: boolean;
};

export function HobbyCategoriesSection({ categories, loading }: HobbyCategoriesSectionProps) {
  return (
    <section aria-label="취미 카테고리 콘텐츠">
      <Row gutter={[16, 16]}>
        {categories.map((category) => (
          <Col key={category.key} xs={24} lg={8}>
            <Card
              title={<Link href={`/hobby/${category.key}`}>{category.title}</Link>}
              variant="borderless"
              className="h-full"
            >
              <Space orientation="vertical" size={10} className="w-full">
                <Typography.Paragraph className="!mb-0">{category.summary}</Typography.Paragraph>
                <Space size={[8, 8]} wrap>
                  {category.tags.map((tag) => (
                    <Tag key={tag} color="blue">
                      {tag}
                    </Tag>
                  ))}
                </Space>

                {loading ? (
                  <Skeleton active paragraph={{ rows: 3 }} title={false} />
                ) : category.items.length === 0 ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="표시할 콘텐츠가 없습니다."
                  />
                ) : (
                  <ContentItemList items={category.items} />
                )}
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </section>
  );
}
