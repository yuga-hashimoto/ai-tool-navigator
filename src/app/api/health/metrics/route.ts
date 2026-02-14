import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import os from 'os';

export const dynamic = 'force-dynamic';

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

  // Calculate error counts for the last 24 hours
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  let errorCounts = {
    total: 0,
    high: 0,
    medium: 0,
    low: 0,
    critical: 0
  };

  try {
    const counts = await prisma.errorLog.groupBy({
      by: ['severity'],
      where: {
        createdAt: {
          gte: oneDayAgo
        }
      },
      _count: {
        severity: true
      }
    });

    counts.forEach(group => {
        const count = group._count.severity;
        const sev = group.severity.toUpperCase();
        errorCounts.total += count;
        if (sev === 'HIGH') errorCounts.high = count;
        else if (sev === 'MEDIUM') errorCounts.medium = count;
        else if (sev === 'LOW') errorCounts.low = count;
        else if (sev === 'CRITICAL') errorCounts.critical = count;
    });

  } catch (e) {
    console.error('Failed to fetch error counts:', e);
  }

  // Fetch recent critical errors
  let recentErrors: any[] = [];
  try {
      recentErrors = await prisma.errorLog.findMany({
          where: {
              severity: {
                  in: ['HIGH', 'CRITICAL']
              }
          },
          orderBy: {
              createdAt: 'desc'
          },
          take: 5
      });
  } catch (e) {
      console.error('Failed to fetch recent errors:', e);
  }

  const memoryUsage = process.memoryUsage();
  const memoryInfo = {
    rss: Math.round(memoryUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
  };

  // Determine system status
  let systemStatus = 'healthy';
  if (dbStatus !== 'connected' || errorCounts.critical > 0) {
      systemStatus = 'critical';
  } else if (errorCounts.high > 5 || dbLatency > 500) {
      systemStatus = 'degraded';
  }

  const healthData = {
    status: systemStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      status: dbStatus,
      latency: dbLatency,
    },
    memory: memoryInfo,
    errorCounts,
    recentErrors
  };

  return NextResponse.json(healthData);
}
