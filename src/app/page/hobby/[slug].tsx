'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Alert, Button, Empty, Layout, Space, Tag, Typography } from 'antd';
import { HOBBY_CATEGORIES } from '@/app/page-modules/hobby/constants/categories';
import {
  DiscoveryConfigError,
  fetchDiscoveryByCategories,
} from '@/app/page-modules/hobby/api/discovery-api';
import type {
  DiscoveryCategoryResult,
  DiscoveryResult,
  HobbyKey,
} from '@/app/page-modules/hobby/types/discovery';
import { ContentItemList } from '@/app/page-modules/hobby/components/ContentItemList';

type HobbySlugPageProps = {
  slug: HobbyKey;
};

export function HobbySlugPage({ slug }: HobbySlugPageProps) {
  const targetCategory = useMemo(
    () => HOBBY_CATEGORIES.find((category) => category.key === slug),
    [slug],
  );

  const [data, setData] = useState<DiscoveryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const loadDiscovery = useCallback(async () => {
    setLoading(true);
    setError(null);
    setWarnings([]);

    try {
      const result = await fetchDiscoveryByCategories({ limitPerSource: 3 });
      setData(result);
      setWarnings(result.warnings ?? []);
    } catch (err) {
      if (err instanceof DiscoveryConfigError) {
        setError('API 키가 필요합니다. NEXT_PUBLIC_YOUTUBE_API_KEY를 설정해주세요.');
      } else {
        setError('콘텐츠를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
      }
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDiscovery();
  }, [loadDiscovery]);

  if (!targetCategory) {
    return (
      <Layout className="min-h-screen bg-slate-100 px-4 py-8 sm:px-8">
        <main className="mx-auto w-full max-w-3xl">
          <Empty description="존재하지 않는 카테고리입니다." />
        </main>
      </Layout>
    );
  }

  const categoryData: DiscoveryCategoryResult = data?.categories.find(
    (category) => category.key === slug,
  ) ?? { ...targetCategory, items: [] };

  return (
    <Layout className="min-h-screen bg-slate-100 px-4 py-8 sm:px-8">
      <main className="mx-auto w-full max-w-3xl">
        <Space orientation="vertical" size={20} className="w-full">
          <section>
            <Typography.Title level={2} className="!mb-2">
              {targetCategory.title}
            </Typography.Title>
            <Typography.Paragraph type="secondary" className="!mb-2">
              {targetCategory.summary}
            </Typography.Paragraph>
            <Space size={[8, 8]} wrap>
              {targetCategory.tags.map((tag) => (
                <Tag key={tag} color="blue">
                  {tag}
                </Tag>
              ))}
            </Space>
            <div className="mt-3">
              <Link href="/">홈으로 돌아가기</Link>
            </div>
          </section>

          {error ? (
            <Alert
              type="error"
              showIcon
              title="콘텐츠 연동 오류"
              description={
                <Space orientation="vertical" size={8}>
                  <span>{error}</span>
                  <Button onClick={() => void loadDiscovery()} size="small">
                    다시 시도
                  </Button>
                </Space>
              }
            />
          ) : null}

          {!error && warnings.length > 0 ? (
            <Alert
              type="warning"
              showIcon
              title="일부 연동 제한"
              description={warnings.join(' ')}
            />
          ) : null}

          {loading ? (
            <Typography.Paragraph>불러오는 중...</Typography.Paragraph>
          ) : categoryData.items.length === 0 ? (
            <Empty description="표시할 콘텐츠가 없습니다." />
          ) : (
            <ContentItemList items={categoryData.items} />
          )}
        </Space>
      </main>
    </Layout>
  );
}
