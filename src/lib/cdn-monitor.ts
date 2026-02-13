/**
 * CDN Performance Monitor
 * 
 * Monitors CDN performance metrics including:
 * - Latency measurements
 * - Cache hit rates
 * - Error rates
 * 
 * Usage:
 *   import { trackCDNPerformance, getCDNMetrics } from '@/lib/cdn-monitor';
 *   
 *   // Track a CDN request
 *   await trackCDNPerformance('/_next/static/chunks/main.js', 'https://cdn.example.com/_next/static/chunks/main.js');
 *   
 *   // Get aggregated metrics
 *   const metrics = getCDNMetrics();
 */

import { getCDNConfig, type CDNPerformanceMetrics } from './cdn';

// In-memory metrics store (use Redis for production)
const metricsStore: CDNPerformanceMetrics[] = [];
const MAX_STORE_SIZE = 1000;

// Track a CDN performance metric
export async function trackCDNPerformance(
  assetPath: string,
  cdnUrl: string
): Promise<CDNPerformanceMetrics | null> {
  const config = getCDNConfig();
  
  if (!config.enabled) {
    return null;
  }

  const startTime = performance.now();
  
  try {
    const response = await fetch(cdnUrl, {
      method: 'HEAD',
      cache: 'no-store',
    });
    
    const latency = performance.now() - startTime;
    
    const metric: CDNPerformanceMetrics = {
      timestamp: Date.now(),
      latency,
      statusCode: response.status,
      assetPath,
      cdnUrl,
      cached: response.headers.get('cf-cache-status') !== null,
    };
    
    // Store metric
    metricsStore.push(metric);
    
    // Keep only recent metrics
    if (metricsStore.length > MAX_STORE_SIZE) {
      metricsStore.shift();
    }
    
    return metric;
  } catch (error) {
    // Track error
    const metric: CDNPerformanceMetrics = {
      timestamp: Date.now(),
      latency: performance.now() - startTime,
      statusCode: 0,
      assetPath,
      cdnUrl,
      cached: false,
    };
    
    metricsStore.push(metric);
    
    return metric;
  }
}

// Get aggregated CDN metrics
export function getCDNMetrics(): {
  totalRequests: number;
  averageLatency: number;
  cacheHitRate: number;
  errorRate: number;
  recentLatencies: number[];
} {
  if (metricsStore.length === 0) {
    return {
      totalRequests: 0,
      averageLatency: 0,
      cacheHitRate: 0,
      errorRate: 0,
      recentLatencies: [],
    };
  }

  const totalRequests = metricsStore.length;
  const successfulRequests = metricsStore.filter(m => m.statusCode > 0);
  const errorRequests = metricsStore.filter(m => m.statusCode === 0);
  const cachedRequests = metricsStore.filter(m => m.cached);
  
  const averageLatency = successfulRequests.reduce((sum, m) => sum + m.latency, 0) / successfulRequests.length;
  const cacheHitRate = (cachedRequests.length / totalRequests) * 100;
  const errorRate = (errorRequests.length / totalRequests) * 100;

  // Get recent latencies (last 10)
  const recentLatencies = metricsStore
    .slice(-10)
    .map(m => m.latency);

  return {
    totalRequests,
    averageLatency: Math.round(averageLatency * 100) / 100,
    cacheHitRate: Math.round(cacheHitRate * 10) / 10,
    errorRate: Math.round(errorRate * 10) / 10,
    recentLatencies: recentLatencies.map(l => Math.round(l * 100) / 100),
  };
}

// Clear metrics store
export function clearCDNMetrics(): void {
  metricsStore.length = 0;
}

// Get all stored metrics
export function getAllMetrics(): CDNPerformanceMetrics[] {
  return [...metricsStore];
}

// Middleware/utility to measure response time
export function measureCDNLatency(
  originalFetch: typeof fetch,
  cdnUrl: string
): Promise<Response> {
  const startTime = performance.now();
  
  return originalFetch(cdnUrl).then(response => {
    const latency = performance.now() - startTime;
    
    // Add timing header for debugging
    const newHeaders = new Headers(response.headers);
    newHeaders.set('x-cdn-latency', `${Math.round(latency)}ms`);
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  });
}
