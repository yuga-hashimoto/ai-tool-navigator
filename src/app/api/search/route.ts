import { NextRequest, NextResponse } from 'next/server';
import { elasticClient, INDEX_NAME } from '@/lib/elasticsearch';

export async function GET(request: NextRequest) {
  if (!elasticClient) {
    return NextResponse.json(
      { error: 'Elasticsearch is not configured' },
      { status: 503 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category');
  const rating = searchParams.get('rating');
  const price = searchParams.get('price');
  const locale = searchParams.get('locale') || 'en';
  const type = searchParams.get('type') || 'tool';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const size = 12;
  const from = (page - 1) * size;

  const body: any = {
    from,
    size,
    query: {
      bool: {
        must: [],
        filter: [],
      },
    },
    aggs: {
      categories: {
        terms: { field: 'category', size: 50 },
      },
      ratings: {
         stats: { field: 'rating' }
      },
      prices: {
          terms: { field: 'pricing' }
      }
    },
    highlight: {
        fields: {
            content: {},
            description: {}
        }
    }
  };

  // Text search
  if (q) {
    body.query.bool.must.push({
      multi_match: {
        query: q,
        fields: ['title^3', 'description^2', 'content', 'tags^2', 'category'],
        fuzziness: 'AUTO',
      },
    });
  } else {
    body.query.bool.must.push({ match_all: {} });
  }

  // Filters
  body.query.bool.filter.push({ term: { locale } });

  if (type !== 'all') {
      body.query.bool.filter.push({ term: { type } });
  }

  if (category) {
    const categories = category.split(',');
    body.query.bool.filter.push({
      terms: { category: categories },
    });
  }

  if (rating) {
    body.query.bool.filter.push({
      range: { rating: { gte: parseFloat(rating) } },
    });
  }

  if (price && price !== 'all') {
     if (price === 'free') {
         body.query.bool.filter.push({ term: { pricing: 'free' } });
     } else if (price === 'paid') {
         body.query.bool.filter.push({ terms: { pricing: ['paid', 'contact'] } });
     } else if (price === 'freemium') {
         body.query.bool.filter.push({ term: { pricing: 'freemium' } });
     }
  }

  try {
    const result = await elasticClient.search({
      index: INDEX_NAME,
      body,
    });

    const hits = result.hits.hits.map((hit: any) => ({
      ...hit._source,
      highlight: hit.highlight,
    }));

    return NextResponse.json({
      results: hits,
      total: typeof result.hits.total === 'number' ? result.hits.total : result.hits.total?.value,
      aggregations: result.aggregations,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
