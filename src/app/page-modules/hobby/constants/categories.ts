import type { HobbyCategory } from '../types/discovery';

export const HOBBY_CATEGORIES: readonly HobbyCategory[] = [
  {
    key: 'knitting',
    title: '코바느질',
    summary: '천천히 손으로 뜨개를 하며 집중력을 높이는 취미',
    tags: ['초보 가능', '집중', '핸드메이드'],
    query: '코바늘 뜨개질 기초',
  },
  {
    key: 'bracelet',
    title: '팔찌만들기',
    summary: '비즈와 실을 활용해 나만의 액세서리를 만드는 취미',
    tags: ['창작', '선물', '컬러 조합'],
    query: '비즈 팔찌 만들기',
  },
  {
    key: 'fitness',
    title: '헬스',
    summary: '근력과 체력을 함께 관리하는 꾸준한 운동 습관',
    tags: ['건강', '루틴', '기록'],
    query: '헬스 초보 루틴',
  },
] as const;
