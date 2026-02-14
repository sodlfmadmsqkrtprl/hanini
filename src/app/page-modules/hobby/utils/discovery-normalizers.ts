import type { DiscoveryItem, HobbyKey } from '../types/discovery';

type GoogleSearchResponse = {
  items?: Array<{
    title?: string;
    link?: string;
    snippet?: string;
    pagemap?: {
      cse_image?: Array<{ src?: string }>;
    };
  }>;
};

type YoutubeSearchResponse = {
  items?: Array<{
    id?: { videoId?: string };
    snippet?: {
      title?: string;
      description?: string;
      publishedAt?: string;
      thumbnails?: {
        medium?: { url?: string };
        high?: { url?: string };
        default?: { url?: string };
      };
    };
  }>;
};

export function normalizeGoogleItems(
  categoryKey: HobbyKey,
  payload: GoogleSearchResponse,
): DiscoveryItem[] {
  return (payload.items ?? [])
    .filter((item) => item.title && item.link)
    .map((item, index) => ({
      id: `google-${categoryKey}-${index}`,
      title: item.title as string,
      url: item.link as string,
      source: 'google' as const,
      description: item.snippet,
      thumbnailUrl: item.pagemap?.cse_image?.[0]?.src,
    }));
}

export function normalizeYoutubeItems(
  categoryKey: HobbyKey,
  payload: YoutubeSearchResponse,
): DiscoveryItem[] {
  return (payload.items ?? [])
    .filter((item) => item.id?.videoId && item.snippet?.title)
    .map((item, index) => {
      const videoId = item.id?.videoId as string;
      const snippet = item.snippet;
      return {
        id: `youtube-${categoryKey}-${videoId}-${index}`,
        videoId,
        title: snippet?.title as string,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        source: 'youtube' as const,
        description: snippet?.description,
        thumbnailUrl:
          snippet?.thumbnails?.high?.url ??
          snippet?.thumbnails?.medium?.url ??
          snippet?.thumbnails?.default?.url,
        publishedAt: snippet?.publishedAt,
      };
    });
}

export function normalizeYoutubeQueryItems(
  query: string,
  payload: YoutubeSearchResponse,
): DiscoveryItem[] {
  const q = query.trim().toLowerCase().replace(/\s+/g, '-');
  return (payload.items ?? [])
    .filter((item) => item.id?.videoId && item.snippet?.title)
    .map((item, index) => {
      const videoId = item.id?.videoId as string;
      const snippet = item.snippet;
      return {
        id: `youtube-query-${q}-${videoId}-${index}`,
        videoId,
        title: snippet?.title as string,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        source: 'youtube' as const,
        description: snippet?.description,
        thumbnailUrl:
          snippet?.thumbnails?.high?.url ??
          snippet?.thumbnails?.medium?.url ??
          snippet?.thumbnails?.default?.url,
        publishedAt: snippet?.publishedAt,
      };
    });
}
