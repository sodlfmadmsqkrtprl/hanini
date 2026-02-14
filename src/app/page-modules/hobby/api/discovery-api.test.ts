import {
  DiscoveryConfigError,
  fetchDiscoveryByCategories,
  searchYoutubeByQuery,
} from './discovery-api';

function createMockFetch() {
  const fn = vi.fn(async (input: string | URL | Request) => {
    const url = typeof input === 'string' ? input : input.toString();

    if (url.includes('customsearch')) {
      return {
        ok: true,
        json: async () => ({
          items: [
            {
              title: '구글 게시글 제목',
              link: 'https://example.com/post-1',
              snippet: '설명',
              pagemap: { cse_image: [{ src: 'https://example.com/thumb.jpg' }] },
            },
          ],
        }),
      } as Response;
    }

    if (url.includes('youtube')) {
      return {
        ok: true,
        json: async () => ({
          items: [
            {
              id: { videoId: 'abc123' },
              snippet: {
                title: '유튜브 영상 제목',
                description: '영상 설명',
                publishedAt: '2026-02-14T00:00:00Z',
                thumbnails: { medium: { url: 'https://example.com/yt.jpg' } },
              },
            },
          ],
        }),
      } as Response;
    }

    return {
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({}),
    } as Response;
  });

  return fn;
}

describe('fetchDiscoveryByCategories', () => {
  it('returns category results with google and youtube items', async () => {
    const mockFetch = createMockFetch();

    const result = await fetchDiscoveryByCategories({
      fetchImpl: mockFetch as unknown as typeof fetch,
      env: {
        googleApiKey: 'google-key',
        googleCseId: 'google-cse',
        youtubeApiKey: 'youtube-key',
      },
      limitPerSource: 1,
    });

    expect(result.categories).toHaveLength(3);
    expect(result.categories[0].items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: 'google', title: '구글 게시글 제목' }),
        expect.objectContaining({ source: 'youtube', title: '유튜브 영상 제목' }),
      ]),
    );
    expect(mockFetch).toHaveBeenCalled();
  });

  it('throws when required env values are missing', async () => {
    await expect(
      fetchDiscoveryByCategories({
        env: {
          googleApiKey: '',
          googleCseId: '',
          youtubeApiKey: '',
        },
      }),
    ).rejects.toBeInstanceOf(DiscoveryConfigError);
  });

  it('returns youtube items with warnings when google fails', async () => {
    const mockFetch = vi.fn(async (input: string | URL | Request) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.includes('customsearch')) {
        return {
          ok: false,
          status: 403,
          statusText: 'Forbidden',
          json: async () => ({}),
        } as Response;
      }

      return {
        ok: true,
        json: async () => ({
          items: [
            {
              id: { videoId: 'xyz789' },
              snippet: {
                title: '유튜브만 성공',
                thumbnails: { medium: { url: 'https://example.com/yt2.jpg' } },
              },
            },
          ],
        }),
      } as Response;
    });

    const result = await fetchDiscoveryByCategories({
      fetchImpl: mockFetch as unknown as typeof fetch,
      env: {
        googleApiKey: 'google-key',
        googleCseId: 'google-cse',
        youtubeApiKey: 'youtube-key',
      },
    });

    expect(result.categories[0].items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: 'youtube', title: '유튜브만 성공' }),
      ]),
    );
    expect(result.warnings).toEqual(
      expect.arrayContaining([expect.stringContaining('Google 검색 연동에 실패')]),
    );
  });

  it('searches youtube by custom query', async () => {
    const mockFetch = vi.fn(async () => {
      return {
        ok: true,
        json: async () => ({
          items: [
            {
              id: { videoId: 'custom1' },
              snippet: {
                title: '커스텀 검색 결과',
                description: '설명',
                thumbnails: { medium: { url: 'https://example.com/custom.jpg' } },
              },
            },
          ],
        }),
      } as Response;
    });

    const items = await searchYoutubeByQuery({
      query: '홈트 루틴',
      order: 'date',
      fetchImpl: mockFetch as unknown as typeof fetch,
      env: { youtubeApiKey: 'youtube-key' },
    });

    expect(items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: 'youtube',
          title: '커스텀 검색 결과',
          videoId: 'custom1',
        }),
      ]),
    );
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('order=date'));
  });

  it('passes viewCount order to youtube search api', async () => {
    const mockFetch = vi.fn(async () => {
      return {
        ok: true,
        json: async () => ({
          items: [
            {
              id: { videoId: 'v1' },
              snippet: {
                title: '인기순 결과',
                thumbnails: { medium: { url: 'https://example.com/a.jpg' } },
              },
            },
          ],
        }),
      } as Response;
    });

    await searchYoutubeByQuery({
      query: '운동화',
      order: 'viewCount',
      fetchImpl: mockFetch as unknown as typeof fetch,
      env: { youtubeApiKey: 'youtube-key' },
    });

    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('order=viewCount'));
  });
});
