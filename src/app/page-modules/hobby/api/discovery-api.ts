import { HOBBY_CATEGORIES } from '../constants/categories';
import {
  normalizeGoogleItems,
  normalizeYoutubeItems,
  normalizeYoutubeQueryItems,
} from '../utils/discovery-normalizers';
import type { DiscoveryEnv, DiscoveryItem, DiscoveryResult } from '../types/discovery';
import type { PanelSortOrder } from '../types/panel';

export class DiscoveryConfigError extends Error {
  readonly missing: string[];

  constructor(missing: string[]) {
    super(`Missing discovery API keys: ${missing.join(', ')}`);
    this.name = 'DiscoveryConfigError';
    this.missing = missing;
  }
}

type FetchLike = typeof fetch;

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

function resolveEnv(env?: DiscoveryEnv): Required<DiscoveryEnv> {
  return {
    googleApiKey: env?.googleApiKey ?? process.env.NEXT_PUBLIC_GOOGLE_API_KEY ?? '',
    googleCseId: env?.googleCseId ?? process.env.NEXT_PUBLIC_GOOGLE_CSE_ID ?? '',
    youtubeApiKey: env?.youtubeApiKey ?? process.env.NEXT_PUBLIC_YOUTUBE_API_KEY ?? '',
  };
}

function validateYoutubeEnv(env: Required<DiscoveryEnv>) {
  const missing: string[] = [];
  if (!env.youtubeApiKey) missing.push('NEXT_PUBLIC_YOUTUBE_API_KEY');
  if (missing.length > 0) {
    throw new DiscoveryConfigError(missing);
  }
}

async function fetchJson<T>(fetchImpl: FetchLike, url: string): Promise<T> {
  const response = await fetchImpl(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
  }
  return (await response.json()) as T;
}

export async function fetchDiscoveryByCategories(options?: {
  env?: DiscoveryEnv;
  fetchImpl?: FetchLike;
  limitPerSource?: number;
}): Promise<DiscoveryResult> {
  const fetchImpl = options?.fetchImpl ?? fetch;
  const env = resolveEnv(options?.env);
  validateYoutubeEnv(env);
  const limit = Math.max(1, Math.min(5, options?.limitPerSource ?? 3));
  const warnings = new Set<string>();
  const useGoogle = Boolean(env.googleApiKey && env.googleCseId);

  const categories = await Promise.all(
    HOBBY_CATEGORIES.map(async (category) => {
      let googleItems: DiscoveryItem[] = [];
      if (useGoogle) {
        const googleUrl =
          `https://www.googleapis.com/customsearch/v1` +
          `?key=${encodeURIComponent(env.googleApiKey)}` +
          `&cx=${encodeURIComponent(env.googleCseId)}` +
          `&num=${limit}` +
          `&q=${encodeURIComponent(category.query)}`;

        try {
          const googlePayload = await fetchJson<GoogleSearchResponse>(fetchImpl, googleUrl);
          googleItems = normalizeGoogleItems(category.key, googlePayload);
        } catch {
          warnings.add('Google 검색 연동에 실패해 YouTube 결과만 표시합니다.');
        }
      } else {
        warnings.add(
          'Google API 키 또는 CSE ID가 없어 YouTube 결과만 표시합니다. (.env.local 설정 필요)',
        );
      }

      const youtubeUrl =
        `https://www.googleapis.com/youtube/v3/search` +
        `?key=${encodeURIComponent(env.youtubeApiKey)}` +
        `&part=snippet` +
        `&type=video` +
        `&maxResults=${limit}` +
        `&q=${encodeURIComponent(category.query)}`;

      const youtubePayload = await fetchJson<YoutubeSearchResponse>(fetchImpl, youtubeUrl);
      const items = [...googleItems, ...normalizeYoutubeItems(category.key, youtubePayload)];

      return {
        ...category,
        items,
      };
    }),
  );

  return { categories, warnings: Array.from(warnings) };
}

export async function searchYoutubeByQuery(options: {
  query: string;
  order?: PanelSortOrder;
  env?: DiscoveryEnv;
  fetchImpl?: FetchLike;
  limit?: number;
}): Promise<DiscoveryItem[]> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const env = resolveEnv(options.env);
  validateYoutubeEnv(env);

  const query = options.query.trim();
  if (!query) {
    return [];
  }

  const limit = Math.max(1, Math.min(5, options.limit ?? 5));
  const order: PanelSortOrder = options.order ?? 'relevance';
  const youtubeUrl =
    `https://www.googleapis.com/youtube/v3/search` +
    `?key=${encodeURIComponent(env.youtubeApiKey)}` +
    `&part=snippet` +
    `&type=video` +
    `&maxResults=${limit}` +
    `&order=${encodeURIComponent(order)}` +
    `&q=${encodeURIComponent(query)}`;

  const youtubePayload = await fetchJson<YoutubeSearchResponse>(fetchImpl, youtubeUrl);
  return normalizeYoutubeQueryItems(query, youtubePayload);
}
