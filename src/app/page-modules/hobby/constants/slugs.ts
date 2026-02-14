import { HOBBY_CATEGORIES } from './categories';

export const HOBBY_SLUGS = HOBBY_CATEGORIES.map((category) => category.key);

export function isHobbySlug(slug: string): slug is (typeof HOBBY_SLUGS)[number] {
  return HOBBY_SLUGS.includes(slug as (typeof HOBBY_SLUGS)[number]);
}
