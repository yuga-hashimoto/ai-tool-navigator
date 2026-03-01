"use client";

import {
  ShieldCheck,
  ShieldAlert,
  Target,
  Zap,
  TrendingUp,
  AlertCircle
} from "lucide-react";

export function SecurityOverview({ stats }: { stats: any }) {
  if (!stats) return null;

  const cards = [
    {
      title: "Security Posture",
      value: `${stats.posture}%`,
      description: "Aggregated security health score",
      icon: ShieldCheck,
      color: "text-green-600",
      bg: "bg-green-100",
      status: "Excellent"
    },
    {
      title: "Threat Prevention",
      value: "99.2%",
      description: "Threats blocked in last 24h",
      icon: Target,
      color: "text-blue-600",
      bg: "bg-blue-100",
      status: "Active"
    },
    {
      title: "Active Alerts",
      value: stats.stats?.blockedRequests || 0,
      description: "Security events requiring review",
      icon: ShieldAlert,
      color: "text-orange-600",
      bg: "bg-orange-100",
      status: "Attention"
    },
    {
      title: "MTTR",
      value: "14m",
      description: "Mean time to resolution",
      icon: Zap,
      color: "text-purple-600",
      bg: "bg-purple-100",
      status: "Optimal"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border shadow-sm transition-hover hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-lg ${card.bg}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${card.bg} ${card.color}`}>
                {card.status}
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-tight">{card.title}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-green-500 font-medium">+2.5%</span> from last week
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Threat Analysis Chart (Simulated) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Threat Detection Trends
          </h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {stats.trends.threats.map((val: number, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div
                  className="w-full bg-blue-100 hover:bg-blue-200 transition-colors rounded-t-md relative"
                  style={{ height: `${(val / 20) * 100}%` }}
                >
                   <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {val} Threats
                  </div>
                </div>
                <span className="text-[10px] font-medium text-gray-400">Day {i+1}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-center gap-8 border-t pt-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-sm" />
              <span className="text-xs font-medium text-gray-600">Detected Threats</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-sm" />
              <span className="text-xs font-medium text-gray-600">Blocked Attempts</span>
            </div>
          </div>
        </div>

        {/* Real-time Alerts Feed */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            Recent Security Events
          </h3>
          <div className="space-y-4">
            {stats.stats?.topIPs?.slice(0, 5).map((ip: any, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-transparent hover:border-blue-200 transition-colors cursor-pointer">
                <div className="mt-1">
                  <ShieldAlert className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-gray-900">{ip.ip}</p>
                    <span className="text-[10px] font-medium bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
                      Suspicious
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Multiple failed login attempts detected ({ip.count})
                  </p>
                  <p className="text-[10px] text-gray-400 mt-2 uppercase font-bold tracking-tighter">
                    2 minutes ago
                  </p>
                </div>
              </div>
            ))}
            <button className="w-full py-2 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors border border-dashed border-blue-200">
              View All Alerts
            </button>
          </div>
        </div>
      </div>

      {/* Compliance Overview */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Compliance Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.compliance.map((c: any, i: number) => (
            <div key={i} className="flex flex-col gap-3 p-4 bg-gray-50 rounded-xl border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-900">{c.framework}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  c.status === 'compliant' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {c.status}
                </span>
              </div>
              <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`absolute top-0 left-0 h-full transition-all duration-500 ${
                    c.score > 80 ? 'bg-green-500' : 'bg-orange-500'
                  }`}
                  style={{ width: `${c.score}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Progress</span>
                <span className="text-xs font-bold text-gray-900">{c.score}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
