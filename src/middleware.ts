import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import { securityCheck } from '@/lib/security/security-middleware';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  // 1. Run security check for sensitive routes or all routes
  const pathname = request.nextUrl.pathname;

  // Skip security check for static assets and internal next paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.includes('.')
  ) {
    return intlMiddleware(request);
  }

  try {
    // Run security check
    const securityResult = await securityCheck(request);

    if (!securityResult.allowed) {
      // If it's an API route, return JSON
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Security Block', message: securityResult.reason },
          { status: 403 }
        );
      }

      // For page routes, we could redirect to a "blocked" page or just return 403
      return new NextResponse('Access Denied', { status: 403 });
    }
  } catch (error) {
    // Fail safe: allow the request if security check fails unexpectedly
    console.error('Security middleware error:', error);
  }

  // 2. Run i18n middleware for non-API routes
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  // - … the blog route (which is not localized)
  matcher: ['/((?!_next|_vercel|.*\\..*|blog).*)']
};
