import { Space, Tag, Typography } from 'antd';
import type { DiscoveryItem } from '../types/discovery';

type ContentItemListProps = {
  items: DiscoveryItem[];
  youtubeOnly?: boolean;
};

function toYoutubeEmbedUrl(item: DiscoveryItem): string | null {
  if (item.source !== 'youtube') {
    return null;
  }

  if (item.videoId) {
    return `https://www.youtube.com/embed/${item.videoId}`;
  }

  try {
    const url = new URL(item.url);
    const videoId = url.searchParams.get('v');
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  } catch {
    return null;
  }

  return null;
}

function formatViewCount(value: number): string {
  return new Intl.NumberFormat('ko-KR').format(value);
}

export function ContentItemList({ items, youtubeOnly = false }: ContentItemListProps) {
  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const embedUrl = toYoutubeEmbedUrl(item);

        return (
          <li
            key={item.id}
            className={youtubeOnly ? 'rounded-lg border border-slate-200 p-3' : undefined}
          >
            <Space orientation="vertical" size={4} className="w-full">
              <Space size={8} wrap>
                <Tag color={item.source === 'youtube' ? 'red' : 'geekblue'}>
                  {item.source === 'youtube' ? 'YouTube' : 'Google'}
                </Tag>
                {typeof item.viewCount === 'number' ? (
                  <Tag>{`조회수 ${formatViewCount(item.viewCount)}`}</Tag>
                ) : null}
                {item.publishedAt ? (
                  <Tag>{new Date(item.publishedAt).toLocaleDateString('ko-KR')}</Tag>
                ) : null}
              </Space>
              <Typography.Text strong>{item.title}</Typography.Text>
              {embedUrl ? (
                <div className="overflow-hidden rounded-md border border-slate-200">
                  <iframe
                    className="h-56 w-full md:h-64"
                    src={embedUrl}
                    title={item.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              ) : (
                <Typography.Link href={item.url} target="_blank" rel="noreferrer">
                  원문 보기
                </Typography.Link>
              )}
              {item.description ? (
                <Typography.Paragraph type="secondary" className="!mb-0">
                  {item.description}
                </Typography.Paragraph>
              ) : null}
            </Space>
          </li>
        );
      })}
    </ul>
  );
}
