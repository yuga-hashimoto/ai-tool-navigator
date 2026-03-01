"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  AlertTriangle,
  Lock,
  Activity,
  FileCheck,
  Settings,
  Users,
  Search,
  Bell,
  RefreshCw,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Terminal
} from "lucide-react";
import { SecurityOverview } from "./SecurityOverview";
import { IncidentQueue } from "./IncidentQueue";
import { AccessManager } from "./AccessManager";
import { ComplianceDashboard } from "./ComplianceDashboard";
import { SecurityConfig } from "./SecurityConfig";

export function SecurityDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/security/stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch security stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const tabs = [
    { id: "overview", name: "Overview", icon: Activity },
    { id: "incidents", name: "Incidents", icon: AlertTriangle },
    { id: "access", name: "Access Manager", icon: Users },
    { id: "compliance", name: "Compliance", icon: FileCheck },
    { id: "config", name: "Configuration", icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            Security Intelligence Platform
            <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              v2.0
            </span>
          </h1>
          <p className="text-gray-600 mt-1">Real-time threat detection and security governance</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-green-700 uppercase tracking-tight">System Secure</span>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto pb-1 mb-8 border-b">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="min-h-[600px]">
        {loading && activeTab === 'overview' ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <>
            {activeTab === "overview" && <SecurityOverview stats={stats} />}
            {activeTab === "incidents" && <IncidentQueue />}
            {activeTab === "access" && <AccessManager />}
            {activeTab === "compliance" && <ComplianceDashboard />}
            {activeTab === "config" && <SecurityConfig />}
          </>
        )}
      </div>
    </div>
  );
}
