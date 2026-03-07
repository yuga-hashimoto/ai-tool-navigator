import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import {routing} from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

function normalizeJapaneseAlias(pathname: string): string | null {
  if (pathname === '/jp') {
    return '/ja';
  }

  if (pathname.startsWith('/jp/')) {
    return `/ja${pathname.slice(3)}`;
  }

  return null;
}

export default function middleware(request: NextRequest) {
  const aliasPath = normalizeJapaneseAlias(request.nextUrl.pathname);

  if (aliasPath) {
    const url = request.nextUrl.clone();
    url.pathname = aliasPath;
    return NextResponse.redirect(url, 308);
  }

  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  // - … the blog route (which is not localized)
  matcher: ['/((?!api|_next|_vercel|.*\\..*|blog).*)']
};
