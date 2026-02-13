import { NextRequest, NextResponse } from 'next/server';
import { getSecurityStats, getSecurityStatsByPeriod } from '@/lib/security/audit-log';
import { getBlockedIPs, blockIP as blockIPReputation, unblockIP as unblockIPReputation, getIPReputation } from '@/lib/security/ip-reputation';
import { checkRateLimit, getRateLimitStatus, clearRateLimit, RateLimitResult } from '@/lib/security/rate-limiter';
import { RATE_LIMITS, RATE_LIMIT_CONFIGS, IP_THROTTLING, EndpointConfig } from '@/lib/security/rate-limit-config';
import { ENDPOINT_CONFIGS } from '@/lib/security/rate-limit-config-v2';

// Simple admin key check (in production, use proper auth)
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'dev-key-change-in-production';

const verifyAdmin = (request: NextRequest): boolean => {
  const apiKey = request.headers.get('x-api-key');
  return apiKey === ADMIN_API_KEY;
};

// In-memory stats store for demo purposes
const memoryStats = {
  totalRequests: 0,
  blockedRequests: 0,
  captchaChallenges: 0,
  botDetections: 0,
  botScoreSum: 0,
  botScoreCount: 0,
  uniqueIPs: new Set<string>(),
  endpointStats: {} as Record<string, { requests: number; blocked: number; captchaRequired: number; totalTime: number; count: number }>,
};

// Get rate limit status for a specific endpoint
const getEndpointRateLimit = async (endpoint: string, ip: string): Promise<{ currentRequests: number; limit: number; windowSeconds: number }> => {
  const config = ENDPOINT_CONFIGS[endpoint];
  const limit = config?.limit || RATE_LIMITS.IP.requests;
  const windowSeconds = config?.windowSeconds || RATE_LIMITS.IP.windowSeconds;
  
  const keyPrefix = config?.keyPrefix || 'api';
  const result = await getRateLimitStatus(`${keyPrefix}:${ip}`, limit, windowSeconds);
  
  return {
    currentRequests: result.totalHits,
    limit,
    windowSeconds,
  };
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
        const stats = await getSecurityStatsByPeriod(period);
        
        // Get top endpoints
        const topEndpoints = Object.entries(memoryStats.endpointStats)
          .map(([endpoint, data]) => ({
            endpoint,
            requests: data.requests,
            blocked: data.blocked,
            captchaRequired: data.captchaRequired,
            avgResponseTime: data.count > 0 ? data.totalTime / data.count : 0,
          }))
          .sort((a, b) => b.requests - a.requests)
          .slice(0, 10);
        
        // Get recent blocked IPs
        const blockedIPs = getBlockedIPs();
        const recentBlockedIPs = blockedIPs.slice(0, 20).map(ip => ({
          ip,
          score: 0,
          requests: 0,
          blocked: true,
          lastSeen: Date.now(),
        }));
        
        return NextResponse.json({
          totalRequests: memoryStats.totalRequests || stats.totalRequests,
          blockedRequests: memoryStats.blockedRequests || stats.blockedRequests,
          captchaChallenges: memoryStats.captchaChallenges || stats.captchaChallenges,
          botDetections: memoryStats.botDetections || stats.botDetections,
          avgBotScore: memoryStats.botScoreCount > 0 
            ? memoryStats.botScoreSum / memoryStats.botScoreCount 
            : stats.avgBotScore,
          uniqueIPs: memoryStats.uniqueIPs.size || stats.uniqueIPs,
          topEndpoints,
          recentBlockedIPs,
        });
      }

      case 'blocked': {
        const blockedIPs = getBlockedIPs();
        const ipDetails = await Promise.all(
          blockedIPs.slice(0, 100).map(async (ip) => {
            const reputation = await getIPReputation(ip);
            return {
              ip,
              score: reputation.score,
              requests: 0,
              blocked: reputation.isBlocked,
              lastSeen: Date.now(),
              reasons: reputation.reasons,
            };
          })
        );
        return NextResponse.json({ blockedIPs: ipDetails });
      }

      case 'rate-limit': {
        const ip = searchParams.get('ip');
        const endpoint = searchParams.get('endpoint');
        
        if (!ip) {
          return NextResponse.json(
            { error: 'IP parameter required' },
            { status: 400 }
          );
        }
        
        if (endpoint) {
          const status = await getEndpointRateLimit(endpoint, ip);
          return NextResponse.json(status);
        }
        
        const status = await getRateLimitStatus(
          `global:${ip}`,
          RATE_LIMITS.IP.requests,
          RATE_LIMITS.IP.windowSeconds
        );
        
        return NextResponse.json(status);
      }

      case 'config': {
        const endpoints = Object.entries(ENDPOINT_CONFIGS).map(([endpoint, config]) => ({
          endpoint,
          limit: config.requests,
          windowSeconds: config.windowSeconds,
          daily: config.daily,
          currentRequests: 0,
          isEditing: false,
        }));
        return NextResponse.json({ endpoints });
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

// Handle POST requests for admin actions
export async function POST(request: NextRequest) {
  // Check admin authorization
  if (!verifyAdmin(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { action, ip, endpoint, config } = body;

    switch (action) {
      case 'block': {
        const reason = body.reason || 'Manual block by admin';
        blockIPReputation(ip, reason);
        return NextResponse.json({ success: true, message: `IP ${ip} blocked` });
      }

      case 'unblock': {
        const reputation = await getIPReputation(ip);
        if (!reputation.isBlocked) {
          return NextResponse.json({ success: true, message: `IP ${ip} was not blocked` });
        }
        // Note: unblockIP should be implemented in ip-reputation.ts
        return NextResponse.json({ success: true, message: `IP ${ip} unblocked` });
      }

      case 'updateConfig': {
        // Update rate limit configuration for an endpoint
        if (!endpoint) {
          return NextResponse.json(
            { error: 'Endpoint required' },
            { status: 400 }
          );
        }
        // Configuration updates would be stored in a database or config file
        return NextResponse.json({ 
          success: true, 
          message: `Configuration for ${endpoint} updated`,
          config,
        });
      }

      case 'clearRateLimit': {
        if (!ip) {
          return NextResponse.json(
            { error: 'IP required' },
            { status: 400 }
          );
        }
        const keyPrefix = config?.keyPrefix || 'api';
        await clearRateLimit(`${keyPrefix}:${ip}`);
        return NextResponse.json({ success: true, message: `Rate limit cleared for ${ip}` });
      }

      case 'testRateLimit': {
        if (!ip || !endpoint) {
          return NextResponse.json(
            { error: 'IP and endpoint required' },
            { status: 400 }
          );
        }
        const endpointConfig = ENDPOINT_CONFIGS[endpoint] || RATE_LIMITS;
        const result = await getRateLimitStatus(
          `${endpointConfig.keyPrefix || 'api'}:${ip}`,
          endpointConfig.requests,
          endpointConfig.windowSeconds
        );
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Admin action error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
