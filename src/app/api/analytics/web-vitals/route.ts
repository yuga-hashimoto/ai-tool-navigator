import { NextRequest, NextResponse } from "next/server";
import { WebVitalsMetrics } from "@/hooks/useWebVitals";
import { checkRateLimit } from "@/lib/security/rate-limiter";
import { getClientIP } from "@/lib/security/bot-detection";
import { ENDPOINT_CONFIGS } from "@/lib/security/rate-limit-config-v2";

// In-memory storage for demo purposes
// In production, use a database like Redis, PostgreSQL, or Upstash
const metricsStore: {
  metrics: WebVitalsMetrics[];
  alerts: Array<{
    timestamp: number;
    metric: WebVitalsMetrics;
    level: "warning" | "critical";
  }>;
} = {
  metrics: [],
  alerts: [],
};

const MAX_STORE_SIZE = 1000;
const MAX_ALERTS_SIZE = 100;

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  
  try {
    // Check rate limit
    const config = ENDPOINT_CONFIGS['/api/analytics/web-vitals'];
    const rateLimit = await checkRateLimit(
      `analytics:web-vitals:${ip}`,
      config?.limit || 100,
      config?.windowSeconds || 60
    );
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many metric submissions", message: "Please try again later" },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)),
          }
        }
      );
    }
    
    const metric: WebVitalsMetrics = await request.json();

    // Validate required fields
    if (!metric.id || !metric.name || typeof metric.value !== "number") {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Add to metrics store
    metricsStore.metrics.push(metric);

    // Trim old metrics if store is too large
    if (metricsStore.metrics.length > MAX_STORE_SIZE) {
      metricsStore.metrics = metricsStore.metrics.slice(-MAX_STORE_SIZE);
    }

    // Check for alerts and store them
    const alertThreshold = getAlertThreshold(metric.name);
    if (alertThreshold) {
      const isCritical = metric.value >= alertThreshold.critical;
      const isWarning = metric.value >= alertThreshold.warning;

      if (isCritical || isWarning) {
        const level = isCritical ? "critical" : "warning";
        metricsStore.alerts.push({
          timestamp: Date.now(),
          metric,
          level,
        });

        // Trim old alerts if store is too large
        if (metricsStore.alerts.length > MAX_ALERTS_SIZE) {
          metricsStore.alerts = metricsStore.alerts.slice(-MAX_ALERTS_SIZE);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Metric received",
      metricId: metric.id,
      remaining: rateLimit.remaining,
    });
  } catch (error) {
    console.error("[Web Vitals API] Error:", error);
    return NextResponse.json(
      { error: "Failed to process metric" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page");
  const metricName = searchParams.get("metric");
  const limit = parseInt(searchParams.get("limit") || "100");

  let filteredMetrics = [...metricsStore.metrics];

  // Filter by page
  if (page) {
    filteredMetrics = filteredMetrics.filter((m) => m.page === page);
  }

  // Filter by metric name
  if (metricName) {
    filteredMetrics = filteredMetrics.filter((m) => m.name === metricName);
  }

  // Get latest metrics
  const latestMetrics = filteredMetrics.slice(-limit);

  // Calculate statistics per metric type
  const stats = calculateStats(filteredMetrics);

  return NextResponse.json({
    metrics: latestMetrics,
    total: filteredMetrics.length,
    alerts: metricsStore.alerts.slice(-50),
    stats,
    thresholds: DEFAULT_ALERT_THRESHOLDS,
  });
}

function getAlertThreshold(metricName: string) {
  return DEFAULT_ALERT_THRESHOLDS.find((t) => t.metric === metricName);
}

function calculateStats(metrics: WebVitalsMetrics[]) {
  const statsByMetric: Record<string, {
    count: number;
    avg: number;
    min: number;
    max: number;
    p50: number;
    p75: number;
    p90: number;
    p95: number;
    goodRate: number;
    needsImprovementRate: number;
    poorRate: number;
  }> = {};

  metrics.forEach((m) => {
    if (!statsByMetric[m.name]) {
      statsByMetric[m.name] = {
        count: 0,
        avg: 0,
        min: Infinity,
        max: -Infinity,
        p50: 0,
        p75: 0,
        p90: 0,
        p95: 0,
        goodRate: 0,
        needsImprovementRate: 0,
        poorRate: 0,
      };
    }

    const stat = statsByMetric[m.name];
    stat.count++;
    stat.avg = (stat.avg * (stat.count - 1) + m.value) / stat.count;
    stat.min = Math.min(stat.min, m.value);
    stat.max = Math.max(stat.max, m.value);

    if (m.rating === "good") stat.goodRate++;
    else if (m.rating === "needs-improvement") stat.needsImprovementRate++;
    else if (m.rating === "poor") stat.poorRate++;
  });

  // Calculate percentiles and rates
  Object.keys(statsByMetric).forEach((metricName) => {
    const stat = statsByMetric[metricName];
    const metricValues = metrics
      .filter((m) => m.name === metricName)
      .map((m) => m.value)
      .sort((a, b) => a - b);

    if (metricValues.length > 0) {
      stat.p50 = metricValues[Math.floor(metricValues.length * 0.5)];
      stat.p75 = metricValues[Math.floor(metricValues.length * 0.75)];
      stat.p90 = metricValues[Math.floor(metricValues.length * 0.9)];
      stat.p95 = metricValues[Math.floor(metricValues.length * 0.95)];
    }

    stat.goodRate = (stat.goodRate / stat.count) * 100;
    stat.needsImprovementRate = (stat.needsImprovementRate / stat.count) * 100;
    stat.poorRate = (stat.poorRate / stat.count) * 100;
  });

  return statsByMetric;
}

const DEFAULT_ALERT_THRESHOLDS = [
  { metric: "LCP", warning: 2500, critical: 4000 },
  { metric: "FCP", warning: 1800, critical: 3000 },
  { metric: "CLS", warning: 0.1, critical: 0.25 },
  { metric: "FID", warning: 100, critical: 300 },
  { metric: "TTI", warning: 3800, critical: 7300 },
  { metric: "TBT", warning: 300, critical: 600 },
  { metric: "TTFB", warning: 800, critical: 1800 },
];
