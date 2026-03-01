import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis/cloudflare';

const DEFAULT_CONFIG = {
  rateLimiting: {
    enabled: true,
    globalLimit: 100,
    windowMs: 60000,
  },
  botDetection: {
    enabled: true,
    sensitivity: 'medium',
    blockSevere: true,
  },
  ids: {
    enabled: true,
    blockOnCritical: true,
  },
  dlp: {
    enabled: true,
    maskPII: true,
  },
};

const getRedisClient = () => {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
};

export async function GET(request: NextRequest) {
  const redis = getRedisClient();
  if (!redis) return NextResponse.json(DEFAULT_CONFIG);

  try {
    const config = await redis.get('security:config');
    return NextResponse.json(config || DEFAULT_CONFIG);
  } catch (error) {
    console.error('Failed to fetch security config from Redis:', error);
    return NextResponse.json(DEFAULT_CONFIG);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const redis = getRedisClient();

    if (redis) {
      const currentConfig = (await redis.get('security:config')) || DEFAULT_CONFIG;
      const newConfig = { ...currentConfig as object, ...body };
      await redis.set('security:config', newConfig);
      return NextResponse.json(newConfig);
    }

    return NextResponse.json({ error: 'Redis not configured' }, { status: 500 });
  } catch (error) {
    console.error('Failed to save security config:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
