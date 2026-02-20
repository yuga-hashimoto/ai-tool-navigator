import { NextRequest, NextResponse } from 'next/server';
import { searchTools } from '@/lib/search/query';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const category = searchParams.get('category') || undefined;
  const pricing = searchParams.get('pricing') || undefined;
  const sessionId = searchParams.get('sessionId') || undefined;

  // Allow searching by category/pricing without query
  if (!query && !category && !pricing) {
    return NextResponse.json({ hits: [], total: 0 });
  }

  try {
    const result = await searchTools(query || '', sessionId, {
      category,
      pricing,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json({ error: 'Search service unavailable' }, { status: 500 });
  }
}
