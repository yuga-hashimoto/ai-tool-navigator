import { NextRequest, NextResponse } from 'next/server';
import { getSecurityStats } from '@/lib/security/audit-log';
import { getBlockedIPs } from '@/lib/security/ip-reputation';
import { checkRateLimit, getRateLimitStatus } from '@/lib/security/rate-limiter';
import { RATE_LIMITS } from '@/lib/security/rate-limit-config';

// Simple admin key check (in production, use proper auth)
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'dev-key-change-in-production';

const verifyAdmin = (request: NextRequest): boolean => {
  const apiKey = request.headers.get('x-api-key');
  return apiKey === ADMIN_API_KEY;
};

export async function GET(request: NextRequest) {
  // Check admin authorization
  if (!verifyAdmin(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const period = parseInt(searchParams.get('period') || '24');
  const type = searchParams.get('type') || 'stats';

  try {
    switch (type) {
      case 'stats': {
        const stats = await getSecurityStats(period);
        return NextResponse.json(stats);
      }

      case 'blocked': {
        const blockedIPs = getBlockedIPs();
        return NextResponse.json({ blockedIPs });
      }

      case 'rate-limit': {
        const ip = searchParams.get('ip');
        if (!ip) {
          return NextResponse.json(
            { error: 'IP parameter required' },
            { status: 400 }
          );
        }
        
        const status = await getRateLimitStatus(
          `global:${ip}`,
          RATE_LIMITS.IP.requests,
          RATE_LIMITS.IP.windowSeconds
        );
        
        return NextResponse.json(status);
      }

      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
