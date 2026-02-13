/**
 * Tool of the Week Metrics API Route
 * 
 * GET /api/tool-of-the-week/metrics - Get performance metrics
 * POST /api/tool-of-the-week/metrics - Track a metric
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  trackView,
  trackClick,
  trackConversion,
  trackSocialShare,
  getAllMetrics,
  getAggregatedMetrics,
  generatePerformanceReport,
} from '@/lib/scheduler/performance-tracker';

interface MetricPayload {
  toolSlug: string;
  metric: 'view' | 'click' | 'conversion' | 'social_share';
  platform?: 'twitter' | 'facebook' | 'linkedin' | 'reddit';
  data?: Record<string, unknown>;
}

/**
 * GET /api/tool-of-the-week/metrics
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const format = searchParams.get('format') || 'json';
  const toolSlug = searchParams.get('tool');
  
  try {
    if (toolSlug) {
      const metrics = getAllMetrics().find(m => m.toolSlug === toolSlug);
      
      if (!metrics) {
        return NextResponse.json(
          { error: 'Tool not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(metrics);
    }
    
    const aggregated = getAggregatedMetrics();
    
    if (format === 'report') {
      const report = generatePerformanceReport();
      return new NextResponse(report, {
        headers: {
          'Content-Type': 'text/markdown',
        },
      });
    }
    
    return NextResponse.json(aggregated);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tool-of-the-week/metrics
 * 
 * Body:
 * {
 *   toolSlug: string,
 *   metric: 'view' | 'click' | 'conversion' | 'social_share',
 *   platform?: string (for social_share),
 *   data?: Record<string, unknown>
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body: MetricPayload = await request.json();
    const { toolSlug, metric, platform } = body;
    
    if (!toolSlug || !metric) {
      return NextResponse.json(
        { error: 'toolSlug and metric are required' },
        { status: 400 }
      );
    }
    
    switch (metric) {
      case 'view':
        trackView(toolSlug);
        break;
      case 'click':
        trackClick(toolSlug);
        break;
      case 'conversion':
        trackConversion(toolSlug);
        break;
      case 'social_share':
        if (platform && ['twitter', 'facebook', 'linkedin', 'reddit'].includes(platform)) {
          trackSocialShare(toolSlug, platform as 'twitter' | 'facebook' | 'linkedin' | 'reddit');
        } else {
          return NextResponse.json(
            { error: 'platform is required for social_share metric' },
            { status: 400 }
          );
        }
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid metric type' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      message: `Tracked ${metric} for ${toolSlug}`,
    });
  } catch (error) {
    console.error('Error tracking metric:', error);
    return NextResponse.json(
      { error: 'Failed to track metric' },
      { status: 500 }
    );
  }
}
