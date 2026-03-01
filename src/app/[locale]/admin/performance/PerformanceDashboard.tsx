"use client";

import { useState, useEffect } from "react";
import { AlertThreshold, DEFAULT_ALERT_THRESHOLDS } from "@/hooks/useWebVitals";

interface WebVitalsMetrics {
  id: string;
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  page: string;
  timestamp: number;
}

interface Alert {
  timestamp: number;
  metric: WebVitalsMetrics;
  level: "warning" | "critical";
}

interface Stats {
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
}

interface DashboardData {
  metrics: WebVitalsMetrics[];
  total: number;
  alerts: Alert[];
  stats: Record<string, Stats>;
  thresholds: AlertThreshold[];
}

const METRIC_CONFIG = {
  LCP: { name: "Largest Contentful Paint", unit: "ms", description: "Time until largest content is visible" },
  FCP: { name: "First Contentful Paint", unit: "ms", description: "Time until first content is visible" },
  CLS: { name: "Cumulative Layout Shift", unit: "", description: "Visual stability metric" },
  INP: { name: "Interaction to Next Paint", unit: "ms", description: "Interactivity measurement" },
  TTFB: { name: "Time to First Byte", unit: "ms", description: "Server response time" },
};

const PAGE_TYPE_PATTERNS = [
  { pattern: /^\/$/, name: "Homepage" },
  { pattern: /^\/tools\/[^/]+$/, name: "Tool Detail" },
  { pattern: /^\/blog\/[^/]+$/, name: "Blog Post" },
  { pattern: /^\/category\/[^/]+$/, name: "Category" },
];

function getPageType(page: string): string {
  for (const { pattern, name } of PAGE_TYPE_PATTERNS) {
    if (pattern.test(page)) return name;
  }
  return "Other";
}

function getRatingColor(rating: string): string {
  switch (rating) {
    case "good": return "bg-green-100 text-green-800";
    case "needs-improvement": return "bg-yellow-100 text-yellow-800";
    case "poor": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
}

function formatValue(name: string, value: number): string {
  if (name === "CLS") return value.toFixed(3);
  return `${Math.round(value).toLocaleString()}`;
}

export function PerformanceDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState(30000);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/analytics/web-vitals");
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Failed to fetch performance data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading performance data...</p>
        </div>
      </div>
    );
  }

  const statsByPageType: Record<string, Record<string, Stats>> = {};
  if (data?.metrics) {
    data.metrics.forEach((m) => {
      const pageType = getPageType(m.page);
      if (!statsByPageType[pageType]) statsByPageType[pageType] = {};
      if (!statsByPageType[pageType][m.name]) {
        statsByPageType[pageType][m.name] = {
          count: 0, avg: 0, min: Infinity, max: -Infinity,
          p50: 0, p75: 0, p90: 0, p95: 0,
          goodRate: 0, needsImprovementRate: 0, poorRate: 0,
        };
      }
      const stat = statsByPageType[pageType][m.name];
      stat.count++;
      stat.avg = (stat.avg * (stat.count - 1) + m.value) / stat.count;
      stat.min = Math.min(stat.min, m.value);
      stat.max = Math.max(stat.max, m.value);
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Dashboard</h1>
          <p className="text-gray-600 mt-1">Core Web Vitals monitoring and analytics</p>
        </div>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Alert Summary */}
      {data?.alerts && data.alerts.length > 0 && (
        <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-800 mb-3">Recent Alerts</h2>
          <div className="space-y-2">
            {data.alerts.slice(-5).reverse().map((alert, index) => (
              <div key={index} className={`flex items-center justify-between p-2 rounded ${
                alert.level === "critical" ? "bg-red-100" : "bg-yellow-100"
              }`}>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 text-xs font-bold rounded ${
                    alert.level === "critical" ? "bg-red-200 text-red-800" : "bg-yellow-200 text-yellow-800"
                  }`}>
                    {alert.level.toUpperCase()}
                  </span>
                  <span className="font-medium">{alert.metric.name}</span>
                  <span className="text-gray-600">
                    {formatValue(alert.metric.name, alert.metric.value)}
                    {METRIC_CONFIG[alert.metric.name as keyof typeof METRIC_CONFIG]?.unit}
                  </span>
                </div>
                <span className="text-sm text-gray-500">{alert.metric.page}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metrics Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {Object.entries(METRIC_CONFIG).map(([key, config]) => {
          const stats = data?.stats[key];
          const goodRate = stats?.goodRate ?? 0;
          const rating = goodRate >= 75 ? "good" : goodRate >= 50 ? "needs-improvement" : "poor";
          
          return (
            <button
              key={key}
              onClick={() => setSelectedMetric(selectedMetric === key ? null : key)}
              className={`p-4 rounded-lg border text-left transition-all ${
                selectedMetric === key ? "ring-2 ring-blue-500" : ""
              } ${stats ? "" : "opacity-50"}`}
            >
              <h3 className="font-semibold text-gray-900">{config.name}</h3>
              <p className="text-2xl font-bold mt-2">
                {stats ? formatValue(key, stats.p50) : "—"}
                <span className="text-sm font-normal text-gray-500 ml-1">{config.unit}</span>
              </p>
              <div className="mt-2 flex items-center gap-2">
                {stats && (
                  <>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getRatingColor(rating)}`}>
                      {stats.goodRate.toFixed(0)}% good
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">p50</p>
            </button>
          );
        })}
      </div>

      {/* Detailed Statistics */}
      {selectedMetric && data?.stats[selectedMetric] && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {METRIC_CONFIG[selectedMetric as keyof typeof METRIC_CONFIG]?.name} Details
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Object.entries(data.stats[selectedMetric]).map(([key, value]) => {
              if (key === "goodRate" || key === "needsImprovementRate" || key === "poorRate") {
                return (
                  <div key={key} className="text-center">
                    <p className="text-sm text-gray-500">{key.replace(/([A-Z])/g, " $1").trim()}</p>
                    <p className="text-xl font-bold">{typeof value === "number" ? value.toFixed(1) : value}%</p>
                  </div>
                );
              }
              if (typeof value !== "number") return null;
              return (
                <div key={key} className="text-center">
                  <p className="text-sm text-gray-500">{key.toUpperCase()}</p>
                  <p className="text-xl font-bold">{formatValue(selectedMetric, value)}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Page Type Performance */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <h2 className="text-xl font-bold text-gray-900 p-4 border-b">Performance by Page Type</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Page Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Metric</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Avg</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">p75</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">p90</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Good %</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(statsByPageType).map(([pageType, metrics]) =>
                Object.entries(metrics).map(([metricName, stats], index) => (
                  <tr key={`${pageType}-${metricName}`} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    {index === 0 && (
                      <td rowSpan={Object.keys(metrics).length} className="px-4 py-3 font-medium">
                        {pageType}
                      </td>
                    )}
                    <td className="px-4 py-3">{METRIC_CONFIG[metricName as keyof typeof METRIC_CONFIG]?.name || metricName}</td>
                    <td className="px-4 py-3">{formatValue(metricName, stats.avg)}</td>
                    <td className="px-4 py-3">{formatValue(metricName, stats.p75)}</td>
                    <td className="px-4 py-3">{formatValue(metricName, stats.p90)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${getRatingColor(
                        stats.goodRate >= 75 ? "good" : stats.goodRate >= 50 ? "needs-improvement" : "poor"
                      )}`}>
                        {stats.goodRate.toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alert Thresholds Configuration */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Alert Thresholds</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {DEFAULT_ALERT_THRESHOLDS.map((threshold) => {
            const stats = data?.stats[threshold.metric];
            const currentP75 = stats?.p75 || 0;
            const status = currentP75 >= threshold.critical ? "critical" : 
                          currentP75 >= threshold.warning ? "warning" : "good";

            return (
              <div key={threshold.metric} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{threshold.metric}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${getRatingColor(status)}`}>
                    {status}
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Warning:</span>
                    <span>{formatValue(threshold.metric, threshold.warning)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Critical:</span>
                    <span>{formatValue(threshold.metric, threshold.critical)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="text-gray-500">Current p75:</span>
                    <span className="font-medium">{formatValue(threshold.metric, currentP75)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
