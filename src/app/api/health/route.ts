import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import os from 'os';

export async function GET() {
  const start = Date.now();
  let dbStatus = 'disconnected';
  let dbLatency = 0;

  try {
    // Check database connection by running a simple query
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
    dbLatency = Date.now() - start;
  } catch (e) {
    dbStatus = 'disconnected';
    console.error('Health check failed - Database unreachable:', e);
  }

  const memoryUsage = process.memoryUsage();
  const memoryInfo = {
    rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB',
    heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
    heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
  };

  const healthData = {
    status: dbStatus === 'connected' ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    system: {
      memory: memoryInfo,
      loadAverage: os.loadavg(),
      cpus: os.cpus().length,
      platform: os.platform(),
    },
    database: {
      status: dbStatus,
      latency: dbLatency + 'ms',
    },
    version: process.env.npm_package_version || 'unknown',
  };

  return NextResponse.json(healthData, {
    status: healthData.status === 'healthy' ? 200 : 503,
  });
}
