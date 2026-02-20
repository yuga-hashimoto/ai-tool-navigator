import { NextRequest, NextResponse } from 'next/server';
import { searchTools, SearchOptions } from '@/lib/search';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get('q') || '';
  const category = searchParams.getAll('category'); // Expects ?category=foo&category=bar

  // Also support comma separated values for convenience
  const categoryParam = searchParams.get('category');
  const categories = category.length > 0
    ? category
    : (categoryParam ? categoryParam.split(',') : undefined);

  const price = searchParams.get('price');

  const platform = searchParams.getAll('platform');
  const platformParam = searchParams.get('platform');
  const platforms = platform.length > 0
    ? platform
    : (platformParam ? platformParam.split(',') : undefined);

  const rating = searchParams.get('rating');
  const sort = searchParams.get('sort') as SearchOptions['sort'];
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');

  const options: SearchOptions = {
    q,
    filters: {
      category: categories,
      price: price || undefined,
      platform: platforms,
      rating: rating ? parseFloat(rating) : undefined,
    },
    sort,
    page,
    limit,
  };

  try {
    const results = await searchTools(options);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
