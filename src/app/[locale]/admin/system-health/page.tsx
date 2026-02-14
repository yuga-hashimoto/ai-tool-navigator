'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Activity, AlertTriangle, CheckCircle, Database, Server, Clock, AlertOctagon } from 'lucide-react';

interface SystemMetrics {
  status: string;
  timestamp: string;
  uptime: number;
  database: {
    status: string;
    latency: number;
  };
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
  };
  errorCounts: {
    total: number;
    high: number;
    medium: number;
    low: number;
    critical: number;
  };
  recentErrors: Array<{
    id: string;
    message: string;
    severity: string;
    category: string;
    createdAt: string;
  }>;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function SystemHealthPage() {
  const t = useTranslations('SystemHealth');
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/health/metrics');
      if (!res.ok) throw new Error('Failed to fetch metrics');
      const data = await res.json();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError('Failed to load system health data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading && !metrics) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
        <h2 className="text-xl font-bold">{error}</h2>
      </div>
    );
  }

  if (!metrics) return null;

  const statusColor = metrics.status === 'healthy' ? 'text-green-500' : metrics.status === 'degraded' ? 'text-yellow-500' : 'text-red-500';
  const StatusIcon = metrics.status === 'healthy' ? CheckCircle : metrics.status === 'degraded' ? AlertTriangle : AlertOctagon;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('title')}</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>{t('lastUpdated')}: {new Date(metrics.timestamp).toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* System Status */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('status')}</h3>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex items-center gap-2">
            <StatusIcon className={`h-6 w-6 ${statusColor}`} />
            <span className={`text-2xl font-bold capitalize ${statusColor}`}>
              {t(metrics.status)}
            </span>
          </div>
        </div>

        {/* Uptime */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('uptime')}</h3>
            <Server className="h-5 w-5 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatUptime(metrics.uptime)}
          </div>
        </div>

        {/* Response Time (DB Latency) */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('responseTime')}</h3>
            <Database className="h-5 w-5 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {metrics.database.latency} {t('ms')}
          </div>
          <p className="text-xs text-gray-500 mt-1 capitalize">{metrics.database.status}</p>
        </div>

        {/* Error Rate */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('errorRate')}</h3>
            <AlertOctagon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.errorCounts.total}</span>
            <span className="text-sm text-gray-500">errors</span>
          </div>
          <div className="flex gap-2 mt-2 text-xs">
            <span className="text-red-500 font-medium">{metrics.errorCounts.critical} Critical</span>
            <span className="text-orange-500 font-medium">{metrics.errorCounts.high} High</span>
          </div>
        </div>
      </div>

      {/* Memory Usage */}
       <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('memory')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                <span className="text-sm text-gray-500">RSS</span>
                <p className="text-xl font-semibold dark:text-white">{metrics.memory.rss} {t('mb')}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                <span className="text-sm text-gray-500">Heap Total</span>
                <p className="text-xl font-semibold dark:text-white">{metrics.memory.heapTotal} {t('mb')}</p>
            </div>
             <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                <span className="text-sm text-gray-500">Heap Used</span>
                <p className="text-xl font-semibold dark:text-white">{metrics.memory.heapUsed} {t('mb')}</p>
            </div>
          </div>
       </div>


      {/* Recent Critical Errors */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('recentErrors')}</h3>
        </div>
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {metrics.recentErrors.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              <CheckCircle className="mx-auto h-8 w-8 mb-2 text-green-500" />
              {t('noErrors')}
            </div>
          ) : (
            metrics.recentErrors.map((err) => (
              <div key={err.id} className="p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${
                    err.severity === 'CRITICAL' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                  }`}>
                    {err.severity}
                  </span>
                  <span className="text-xs text-gray-500">{new Date(err.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{err.message}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">{err.category}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
