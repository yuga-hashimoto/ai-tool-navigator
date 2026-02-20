import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/elasticsearch';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const q = searchParams.get('q');
    const locale = searchParams.get('locale') || 'en';

    // Handle array parameters (can be repeated in query string: ?category=A&category=B)
    const categories = searchParams.getAll('category');
    const pricing = searchParams.getAll('pricing');
    const rating = searchParams.get('rating');
    const years = searchParams.getAll('year');
    const platforms = searchParams.getAll('platform');
    const sort = searchParams.get('sort') || 'popularity';

    const must: any[] = [];
    const filter: any[] = [
      { term: { locale } }
    ];

    if (q) {
      must.push({
        multi_match: {
          query: q,
          fields: ['title^3', 'description', 'tags^2', 'category'],
          fuzziness: 'AUTO'
        }
      });
    } else {
      must.push({ match_all: {} });
    }

    if (categories.length > 0) {
      filter.push({ terms: { category: categories } });
    }

    if (pricing.length > 0) {
      // Map 'free', 'freemium', 'paid' to the values in index
      filter.push({ terms: { pricing: pricing } });
    }

    if (rating) {
      const minRating = parseFloat(rating);
      if (!isNaN(minRating)) {
        filter.push({ range: { rating: { gte: minRating } } });
      }
    }

    if (years.length > 0) {
      filter.push({ terms: { year: years } });
    }

    if (platforms.length > 0) {
      filter.push({ terms: { platform: platforms } });
    }

    let sortOption: any[] = [];
    if (sort === 'rating') {
      sortOption = [{ rating: 'desc' }];
    } else if (sort === 'recent') {
      // Assuming last_updated is sortable (keyword or date)
      // If not mapped as date, keyword sort might be lexical, which works for ISO dates
      sortOption = [{ 'last_updated': 'desc' }];
    } else if (sort === 'name') {
        sortOption = [{ 'title.keyword': 'asc' }];
    } else {
        // default popularity: featured, sponsored, then rating
        sortOption = [
            { featured: 'desc' },
            { sponsored: 'desc' },
            { rating: 'desc' },
            { _score: 'desc' }
        ];
    }

    const result = await client.search({
      index: 'tools',
      query: {
        bool: {
          must,
          filter
        }
      },
      sort: sortOption,
      size: 50 // Limit results
    });

    const hits = result.hits.hits.map((hit: any) => hit._source);
    // Cast total to any because it can be number or object depending on version/config
    const total = (typeof result.hits.total === 'number')
        ? result.hits.total
        : (result.hits.total as any)?.value || 0;

    return NextResponse.json({
        hits,
        total
    });
  } catch (error) {
    console.error('Elasticsearch search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
