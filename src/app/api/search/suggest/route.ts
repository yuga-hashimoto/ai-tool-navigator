import { NextRequest, NextResponse } from 'next/server';
import { suggestTools } from '@/lib/search/query';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json([]);
  }

  try {
    const suggestions = await suggestTools(query);
    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('Suggest API Error:', error);
    return NextResponse.json({ error: 'Search service unavailable' }, { status: 500 });
  }
}
