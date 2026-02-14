export type HobbyKey = 'knitting' | 'bracelet' | 'fitness';

export type HobbyCategory = {
  key: HobbyKey;
  title: string;
  summary: string;
  tags: string[];
  query: string;
};

export type ContentSource = 'google' | 'youtube';

export type DiscoveryItem = {
  id: string;
  title: string;
  url: string;
  source: ContentSource;
  videoId?: string;
  viewCount?: number;
  thumbnailUrl?: string;
  publishedAt?: string;
  description?: string;
};

export type DiscoveryCategoryResult = HobbyCategory & {
  items: DiscoveryItem[];
};

export type DiscoveryResult = {
  categories: DiscoveryCategoryResult[];
  warnings?: string[];
};

export type DiscoveryEnv = {
  googleApiKey?: string;
  googleCseId?: string;
  youtubeApiKey?: string;
};
