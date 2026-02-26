import { NextRequest, NextResponse } from 'next/server';
import { getCartRecommendations, getRecommendations } from '@/lib/recommendations';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const slug = searchParams.get('slug');
  const cart = searchParams.get('cart');
  const locale = searchParams.get('locale') || 'en';
  const limit = parseInt(searchParams.get('limit') || '3', 10);

  const sessionId = request.cookies.get('affiliate_session')?.value || 'anonymous';

  try {
    if (cart) {
      const slugs = cart.split(',').filter(Boolean);
      const recs = await getCartRecommendations(slugs, limit, locale);
      return NextResponse.json(recs);
    }

    if (slug) {
      const recs = await getRecommendations(sessionId, slug, limit, locale);
      return NextResponse.json(recs);
    }

    return NextResponse.json({ error: 'Missing slug or cart parameter' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
