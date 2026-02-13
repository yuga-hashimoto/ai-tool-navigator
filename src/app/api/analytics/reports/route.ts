import { NextRequest, NextResponse } from "next/server";

// In-memory storage (same as web-vitals route for simplicity)
const metricsStore: {
  metrics: Array<{
    id: string;
    name: string;
    value: number;
    rating: string;
    page: string;
    timestamp: number;
  }>;
} = {
  metrics: [],
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "7d"; // 24h, 7d, 30d
  const format = searchParams.get("format") || "json";

  // Calculate time range
  const now = Date.now();
  const periodMs: Record<string, number> = {
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
    "30d": 30 * 24 * 60 * 60 * 1000,
  };
  const cutoff = now - (periodMs[period] || periodMs["7d"]);

  // Filter metrics by time period
  const filteredMetrics = metricsStore.metrics.filter((m) => m.timestamp > cutoff);

  // Generate report
  const report = generateReport(filteredMetrics, period);

  if (format === "json") {
    return NextResponse.json(report);
  }

  // Return as CSV
  if (format === "csv") {
    const csv = generateCSV(report);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="performance-report-${period}.csv"`,
      },
    });
  }

  return NextResponse.json(report);
}

function generateReport(metrics: typeof metricsStore.metrics, period: string) {
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

  const pageStats: Record<string, Record<string, {
    count: number;
    avg: number;
    p75: number;
    goodRate: number;
  }>> = {};

  // Process metrics
  metrics.forEach((m) => {
    // By metric type
    if (!statsByMetric[m.name]) {
      statsByMetric[m.name] = {
        count: 0, avg: 0, min: Infinity, max: -Infinity,
        p50: 0, p75: 0, p90: 0, p95: 0,
        goodRate: 0, needsImprovementRate: 0, poorRate: 0,
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

    // By page
    const pageType = getPageType(m.page);
    if (!pageStats[pageType]) pageStats[pageType] = {};
    if (!pageStats[pageType][m.name]) {
      pageStats[pageType][m.name] = {
        count: 0, avg: 0, p75: 0, goodRate: 0,
      };
    }
    const pageStat = pageStats[pageType][m.name];
    pageStat.count++;
    pageStat.avg = (pageStat.avg * (pageStat.count - 1) + m.value) / pageStat.count;
    if (m.rating === "good") pageStat.goodRate++;
  });

  // Calculate percentiles and rates
  Object.keys(statsByMetric).forEach((metricName) => {
    const stat = statsByMetric[metricName];
    const values = metrics
      .filter((m) => m.name === metricName)
      .map((m) => m.value)
      .sort((a, b) => a - b);
    if (values.length > 0) {
      stat.p50 = values[Math.floor(values.length * 0.5)];
      stat.p75 = values[Math.floor(values.length * 0.75)];
      stat.p90 = values[Math.floor(values.length * 0.9)];
      stat.p95 = values[Math.floor(values.length * 0.95)];
    }
    stat.goodRate = (stat.goodRate / stat.count) * 100;
    stat.needsImprovementRate = (stat.needsImprovementRate / stat.count) * 100;
    stat.poorRate = (stat.poorRate / stat.count) * 100;
  });

  // Calculate overall health score
  const healthScore = calculateHealthScore(statsByMetric);

  return {
    period,
    generatedAt: new Date().toISOString(),
    summary: {
      totalMetrics: metrics.length,
      healthScore,
      overallRating: getOverallRating(healthScore),
    },
    metrics: statsByMetric,
    pages: pageStats,
    recommendations: generateRecommendations(statsByMetric),
  };
}

function getPageType(page: string): string {
  if (page === "/") return "Homepage";
  if (page.startsWith("/tools/")) return "Tool Detail";
  if (page.startsWith("/blog/")) return "Blog Post";
  if (page.startsWith("/category/")) return "Category";
  return "Other";
}

function calculateHealthScore(stats: Record<string, { goodRate: number; p75: number }>): number {
  const weights: Record<string, number> = {
    LCP: 0.35,
    FCP: 0.15,
    CLS: 0.25,
    FID: 0.15,
    TTFB: 0.10,
  };

  let weightedScore = 0;
  let totalWeight = 0;

  Object.entries(weights).forEach(([metric, weight]) => {
    const stat = stats[metric];
    if (stat) {
      // Score based on good rate (60%) and p75 threshold (40%)
      const goodScore = Math.min(stat.goodRate / 85, 1) * 60; // 85% good = full points
      const thresholdScore = stat.p75 <= getThreshold(metric, "good") ? 40 :
                            stat.p75 <= getThreshold(metric, "warning") ? 20 : 0;
      weightedScore += (goodScore + thresholdScore) * weight;
      totalWeight += weight;
    }
  });

  return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
}

function getThreshold(metric: string, level: string): number {
  const thresholds: Record<string, Record<string, number>> = {
    LCP: { good: 2500, warning: 4000 },
    FCP: { good: 1800, warning: 3000 },
    CLS: { good: 0.1, warning: 0.25 },
    FID: { good: 100, warning: 300 },
    TTFB: { good: 800, warning: 1800 },
  };
  return thresholds[metric]?.[level] || 0;
}

function getOverallRating(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Needs Improvement";
  return "Poor";
}

function generateRecommendations(stats: Record<string, { p75: number; goodRate: number }>): string[] {
  const recommendations: string[] = [];

  if (stats.LCP?.p75 > 2500) {
    recommendations.push("LCP is above 2.5s. Consider optimizing images, using lazy loading, or upgrading hosting.");
  }
  if (stats.CLS?.p75 > 0.1) {
    recommendations.push("CLS is above 0.1. Ensure images have dimensions and avoid dynamic content injection.");
  }
  if (stats.FID?.p75 > 100) {
    recommendations.push("FID is above 100ms. Reduce JavaScript execution time and break up long tasks.");
  }
  if (stats.TTFB?.p75 > 800) {
    recommendations.push("TTFB is above 800ms. Consider caching strategies, CDN usage, or server upgrades.");
  }

  if (recommendations.length === 0) {
    recommendations.push("All Core Web Vitals are within acceptable ranges. Keep up the good work!");
  }

  return recommendations;
}

function generateCSV(report: ReturnType<typeof generateReport>): string {
  const headers = ["Metric", "Count", "Average", "p50", "p75", "p90", "p95", "Good Rate %", "Poor Rate %"];
  const rows = [headers.join(",")];

  Object.entries(report.metrics).forEach(([metric, stat]) => {
    rows.push([
      metric,
      stat.count.toString(),
      stat.avg.toFixed(0),
      stat.p50.toFixed(0),
      stat.p75.toFixed(0),
      stat.p90.toFixed(0),
      stat.p95.toFixed(0),
      stat.goodRate.toFixed(1),
      stat.poorRate.toFixed(1),
    ].join(","));
  });

  return rows.join("\n");
}
