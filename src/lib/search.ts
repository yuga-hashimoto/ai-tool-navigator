import { getElasticClient } from './elasticsearch';
import { AggregationsAggregate } from '@elastic/elasticsearch/lib/api/types';

export interface SearchFilters {
  category?: string[];
  price?: string; // 'free', 'freemium', 'paid'
  platform?: string[];
  rating?: number;
}

export interface SearchOptions {
  q?: string;
  filters?: SearchFilters;
  sort?: 'relevance' | 'rating' | 'date';
  page?: number;
  limit?: number;
}

export interface SearchResult<T> {
  hits: T[];
  total: number;
  facets: {
    categories: { key: string; doc_count: number }[];
    prices: { key: string; doc_count: number }[];
    platforms: { key: string; doc_count: number }[];
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function searchTools(options: SearchOptions): Promise<SearchResult<any>> {
  const client = getElasticClient();
  if (!client) {
    console.warn('Elasticsearch client not available. Returning empty results.');
    return {
      hits: [],
      total: 0,
      facets: { categories: [], prices: [], platforms: [] }
    };
  }

  const { q, filters, sort = 'relevance', page = 1, limit = 12 } = options;
  const from = (page - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const must: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: any[] = [];

  // Full-text search with relevance boosting
  if (q) {
    must.push({
      multi_match: {
        query: q,
        fields: [
          'title^3',
          'tags^2',
          'description^1.5',
          'content'
        ],
        fuzziness: 'AUTO'
      }
    });
  } else {
    must.push({ match_all: {} });
  }

  // Filters
  if (filters?.category && filters.category.length > 0) {
    filter.push({ terms: { category: filters.category } });
  }

  if (filters?.price && filters.price !== 'all') {
    filter.push({ term: { pricing: filters.price } });
  }

  if (filters?.platform && filters.platform.length > 0) {
    filter.push({ terms: { platform: filters.platform } });
  }

  if (filters?.rating) {
    filter.push({ range: { rating: { gte: filters.rating } } });
  }

  // Sorting
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let sortQuery: any[] = [];
  if (sort === 'rating') {
    sortQuery = [{ rating: { order: 'desc' } }];
  } else if (sort === 'date') {
    sortQuery = [{ last_updated: { order: 'desc' } }];
  } else {
    // Relevance default
    sortQuery = ['_score'];
  }

  // Aggregations for Discovery
  const aggs = {
    categories: {
      terms: { field: 'category', size: 20 }
    },
    prices: {
      terms: { field: 'pricing', size: 10 }
    },
    platforms: {
      terms: { field: 'platform', size: 10 }
    }
  };

  try {
    const response = await client.search({
      index: 'tools',
      body: {
        query: {
          bool: {
            must,
            filter
          }
        },
        sort: sortQuery,
        from,
        size: limit,
        aggs
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hits = response.hits.hits.map((hit: any) => ({
      ...hit._source,
      score: hit._score
    }));

    // Helper to safely extract buckets
    const getBuckets = (agg: AggregationsAggregate | undefined) => {
        if (!agg || !('buckets' in agg)) return [];
        return Array.isArray(agg.buckets) ? agg.buckets : [];
    };

    const facets = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      categories: getBuckets((response.aggregations?.categories as any)),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prices: getBuckets((response.aggregations?.prices as any)),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      platforms: getBuckets((response.aggregations?.platforms as any))
    };

    // Track analytics
    if (q) {
        const total = typeof response.hits.total === 'number' ? response.hits.total : response.hits.total?.value || 0;
        await trackSearch(q, total);
    }

    const totalHits = typeof response.hits.total === 'number' ? response.hits.total : response.hits.total?.value || 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const typedFacets = facets as any;

    return {
      hits,
      total: totalHits,
      facets: typedFacets
    };

  } catch (error) {
    console.error('Elasticsearch search failed:', error);
    // Return empty results on error to prevent crashing
    return {
      hits: [],
      total: 0,
      facets: { categories: [], prices: [], platforms: [] }
    };
  }
}

export async function trackSearch(query: string, resultsCount: number) {
  const client = getElasticClient();
  if (!client || !query) return;

  // Fire and forget
  client.index({
    index: 'search_logs',
    document: {
      query,
      results_count: resultsCount,
      timestamp: new Date()
    }
  }).catch(err => console.error('Failed to log search:', err));
}
