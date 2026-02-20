import { elasticClient } from './client';
import { logSearch } from './analytics';

const INDEX_NAME = 'tools';

export interface SearchResult {
  slug: string;
  title: string;
  description: string;
  category: string;
  rating: number;
  image?: string;
  pricing?: string;
  platform?: string[];
  sponsored?: boolean;
  featured?: boolean;
  discount?: string;
  affiliate_link?: string;
}

export interface SearchResponse {
  hits: SearchResult[];
  total: number;
  aggregations?: {
    categories: { key: string; doc_count: number }[];
    pricing: { key: string; doc_count: number }[];
    platforms: { key: string; doc_count: number }[];
  };
}

export async function searchTools(query: string, sessionId?: string, filters?: { category?: string; pricing?: string }): Promise<SearchResponse> {
  if (!query && (!filters?.category && !filters?.pricing)) return { hits: [], total: 0 };

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const must: any[] = [];

    if (query) {
      must.push({
        multi_match: {
          query: query,
          fields: ['title^3', 'description', 'category^2', 'tags'],
          fuzziness: 'AUTO',
        },
      });
    }

    if (filters?.category && filters.category !== 'All') {
      must.push({ term: { category: filters.category } });
    }

    if (filters?.pricing && filters.pricing !== 'All') {
      must.push({ term: { pricing: filters.pricing } });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: any = {
      query: {
        bool: {
          must,
        },
      },
      aggs: {
        categories: {
          terms: { field: 'category' },
        },
        pricing: {
          terms: { field: 'pricing' },
        },
        platforms: {
          terms: { field: 'platform' },
        },
      },
      size: 50,
    };

    const result = await elasticClient.search({
      index: INDEX_NAME,
      body,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hits = result.hits.hits.map((hit: any) => ({
      slug: hit._source.slug,
      title: hit._source.title,
      description: hit._source.description,
      category: hit._source.category,
      rating: hit._source.rating,
      image: hit._source.image,
      pricing: hit._source.pricing,
      platform: hit._source.platform,
      sponsored: hit._source.sponsored,
      featured: hit._source.featured,
      discount: hit._source.discount,
      affiliate_link: hit._source.affiliate_link,
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const aggregations: any = {
      categories: (result.aggregations as any)?.categories.buckets,
      pricing: (result.aggregations as any)?.pricing.buckets,
      platforms: (result.aggregations as any)?.platforms.buckets,
    };

    // Log the search asynchronously
    const total = typeof result.hits.total === 'number' ? result.hits.total : result.hits.total?.value || 0;

    logSearch(query, total, sessionId).catch(console.error);

    return {
      hits,
      total,
      aggregations,
    };
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
}

export async function suggestTools(query: string): Promise<string[]> {
  if (!query) return [];

  try {
    const result = await elasticClient.search({
      index: INDEX_NAME,
      body: {
        query: {
          match: {
            title: {
              query: query,
              analyzer: 'autocomplete_search', // Search with lowercase only
            },
          },
        },
        _source: ['title'],
        size: 5,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result.hits.hits.map((hit: any) => hit._source.title);
  } catch (error) {
    console.error('Suggest error:', error);
    throw error;
  }
}
