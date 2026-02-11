import { CATEGORY_MAPPINGS } from './categories';

export function getCategorySlug(categoryName: string): string | undefined {
  for (const [slug, categories] of Object.entries(CATEGORY_MAPPINGS)) {
    if (categories.includes(categoryName)) {
      return slug;
    }
  }
  return undefined;
}
