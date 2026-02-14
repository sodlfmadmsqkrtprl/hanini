import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import Page from './page';

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

async function waitForAddButtonReady() {
  const addButton = await screen.findByRole('button', { name: '패널 추가' });
  await waitFor(() => {
    expect(addButton).toBeEnabled();
  });
  return addButton;
}

it('renders custom panel manager', async () => {
  render(<Page />);
  await waitForAddButtonReady();

  expect(screen.getByRole('heading', { name: '취미 모음 프로젝트' })).toBeInTheDocument();
  expect(screen.getByText(/커스텀 패널 관리/)).toBeInTheDocument();
  expect(screen.getByText('패널 추가')).toBeInTheDocument();
});

it('adds panel and persists to localStorage', async () => {
  vi.stubEnv('NEXT_PUBLIC_YOUTUBE_API_KEY', 'youtube-key');
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: [] }),
    }),
  );

  render(<Page />);
  const addButton = await waitForAddButtonReady();

  fireEvent.change(screen.getByPlaceholderText('패널 이름 (예: 러닝화 리뷰 모음)'), {
    target: { value: '아디다스 패널' },
  });
  fireEvent.change(screen.getByPlaceholderText('초기 검색어 라벨 (선택, 쉼표로 여러 개)'), {
    target: { value: '아디다스, 나이키' },
  });
  fireEvent.click(addButton);

  expect(screen.getByText('아디다스 패널')).toBeInTheDocument();

  await waitFor(() => {
    const stored = window.localStorage.getItem('hobby_custom_panels_v1');
    expect(stored).not.toBeNull();
    expect(stored).toContain('아디다스 패널');
    expect(stored).toContain('아디다스');
    expect(stored).toContain('나이키');
  });
});

it('removes panel when delete button is clicked', async () => {
  vi.stubEnv('NEXT_PUBLIC_YOUTUBE_API_KEY', 'youtube-key');
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: [] }),
    }),
  );

  render(<Page />);
  const addButton = await waitForAddButtonReady();

  fireEvent.change(screen.getByPlaceholderText('패널 이름 (예: 러닝화 리뷰 모음)'), {
    target: { value: '삭제 테스트 패널' },
  });
  fireEvent.click(addButton);

  const panelTitle = screen.getByText('삭제 테스트 패널');
  expect(panelTitle).toBeInTheDocument();
  const panelCard = panelTitle.closest('.ant-card');
  expect(panelCard).not.toBeNull();

  fireEvent.click(within(panelCard as HTMLElement).getByRole('button', { name: '삭제' }));

  await waitFor(() => {
    expect(screen.queryByText('삭제 테스트 패널')).not.toBeInTheDocument();
  });
});

it('searches automatically when panel has initial search label', async () => {
  vi.stubEnv('NEXT_PUBLIC_YOUTUBE_API_KEY', 'youtube-key');
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      items: [
        {
          id: { videoId: 'v1' },
          snippet: {
            title: '자동 검색 결과',
            thumbnails: { medium: { url: 'https://example.com' } },
          },
        },
      ],
    }),
  });
  vi.stubGlobal('fetch', fetchMock);

  render(<Page />);
  const addButton = await waitForAddButtonReady();

  fireEvent.change(screen.getByPlaceholderText('패널 이름 (예: 러닝화 리뷰 모음)'), {
    target: { value: '자동검색 패널' },
  });
  fireEvent.change(screen.getByPlaceholderText('초기 검색어 라벨 (선택, 쉼표로 여러 개)'), {
    target: { value: '아디다스' },
  });
  fireEvent.click(addButton);

  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

it('prevents duplicate panel title', async () => {
  render(<Page />);
  const addButton = await waitForAddButtonReady();

  fireEvent.change(screen.getByPlaceholderText('패널 이름 (예: 러닝화 리뷰 모음)'), {
    target: { value: '중복패널' },
  });
  fireEvent.click(addButton);
  expect(screen.getByText('중복패널')).toBeInTheDocument();

  fireEvent.change(screen.getByPlaceholderText('패널 이름 (예: 러닝화 리뷰 모음)'), {
    target: { value: '  중복패널  ' },
  });
  fireEvent.click(addButton);

  await waitFor(() => {
    expect(screen.getByText('같은 이름의 패널이 이미 있습니다.')).toBeInTheDocument();
  });
});

it('rehydrates panel query from localStorage and auto-searches on entry', async () => {
  window.localStorage.setItem(
    'hobby_custom_panels_v1',
    JSON.stringify([
      {
        id: 'p1',
        title: '저장된 패널',
        searchTerms: ['나이키'],
        activeTerm: '나이키',
        sortOrder: 'relevance',
        searchMode: 'categoryPlusLabel',
      },
    ]),
  );

  vi.stubEnv('NEXT_PUBLIC_YOUTUBE_API_KEY', 'youtube-key');
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      items: [
        {
          id: { videoId: 'v2' },
          snippet: {
            title: '저장된 검색 결과',
            thumbnails: { medium: { url: 'https://example.com' } },
          },
        },
      ],
    }),
  });
  vi.stubGlobal('fetch', fetchMock);

  render(<Page />);

  expect(await screen.findByText('저장된 패널')).toBeInTheDocument();
  expect(await screen.findByText('나이키')).toBeInTheDocument();

  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

it('adds/removes label and requests selected label with sort order', async () => {
  vi.stubEnv('NEXT_PUBLIC_YOUTUBE_API_KEY', 'youtube-key');
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ items: [] }),
  });
  vi.stubGlobal('fetch', fetchMock);

  render(<Page />);
  const addButton = await waitForAddButtonReady();

  fireEvent.change(screen.getByPlaceholderText('패널 이름 (예: 러닝화 리뷰 모음)'), {
    target: { value: '운동화 패널' },
  });
  fireEvent.change(screen.getByPlaceholderText('초기 검색어 라벨 (선택, 쉼표로 여러 개)'), {
    target: { value: '나이키' },
  });
  fireEvent.click(addButton);

  const panelTitle = await screen.findByText('운동화 패널');
  const panelCard = panelTitle.closest('.ant-card');
  expect(panelCard).not.toBeNull();

  fireEvent.change(
    within(panelCard as HTMLElement).getByPlaceholderText('검색어 라벨 추가 (예: 나이키)'),
    {
      target: { value: '아디다스' },
    },
  );
  fireEvent.click(within(panelCard as HTMLElement).getByRole('button', { name: '라벨 추가' }));

  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  fireEvent.click(within(panelCard as HTMLElement).getByText('나이키'));

  const combinedQuery = encodeURIComponent('운동화 패널 나이키');
  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining(`q=${combinedQuery}`));
  });

  fireEvent.click(within(panelCard as HTMLElement).getByRole('switch', { name: '라벨만 검색' }));
  const labelOnlyQuery = encodeURIComponent('나이키');
  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining(`q=${labelOnlyQuery}`));
  });

  fireEvent.click(within(panelCard as HTMLElement).getAllByLabelText('Close')[1]);
  await waitFor(() => {
    expect(screen.queryByText('아디다스')).not.toBeInTheDocument();
  });
});
