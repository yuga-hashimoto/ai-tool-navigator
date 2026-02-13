'use client';

import { useState, useEffect } from 'react';
import {
  MessageCircle,
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  Activity,
} from 'lucide-react';
import './ChatAnalyticsStyles.css';

interface ChatAnalyticsData {
  totalSessions: number;
  activeSessions: number;
  closedSessions: number;
  totalMessages: number;
  avgResponseTime: number;
  satisfactionScore: number;
  sessionsByCategory: Record<string, number>;
  sessionsByStatus: Record<string, number>;
  peakHours: Record<number, number>;
}

export default function ChatAnalyticsDashboard() {
  const [data, setData] = useState<ChatAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const endDate = new Date();
        const startDate = new Date();
        
        switch (dateRange) {
          case '7d':
            startDate.setDate(startDate.getDate() - 7);
            break;
          case '30d':
            startDate.setDate(startDate.getDate() - 30);
            break;
          case '90d':
            startDate.setDate(startDate.getDate() - 90);
            break;
        }

        const response = await fetch(
          `/api/chat/analytics?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
        );
        const result = await response.json();
        
        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [dateRange]);

  if (isLoading) {
    return (
      <div className="analytics-loading">
        <div className="spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="analytics-error">
        <AlertCircle size={48} />
        <p>Failed to load analytics data</p>
      </div>
    );
  }

  const totalSessions = data.totalSessions || 0;
  const avgResponseTime = data.avgResponseTime || 0;
  const satisfactionScore = data.satisfactionScore || 0;

  // Calculate trends (mock data for demonstration)
  const trends = {
    sessions: { value: 12, isUp: true },
    responseTime: { value: 8, isUp: false },
    satisfaction: { value: 3, isUp: true },
  };

  return (
    <div className="chat-analytics-dashboard">
      {/* Header */}
      <div className="analytics-header">
        <div className="header-left">
          <h2>Chat Analytics</h2>
          <p>Monitor your live chat performance</p>
        </div>
        <div className="header-right">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="date-range-select"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button className="export-btn">
            <BarChart3 size={18} />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#eff6ff', color: '#6366f1' }}>
            <MessageCircle size={24} />
          </div>
          <div className="metric-content">
            <span className="metric-value">{totalSessions}</span>
            <span className="metric-label">Total Conversations</span>
            <div className={`metric-trend ${trends.sessions.isUp ? 'up' : 'down'}`}>
              {trends.sessions.isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {trends.sessions.value}% vs last period
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
            <Users size={24} />
          </div>
          <div className="metric-content">
            <span className="metric-value">{data.activeSessions}</span>
            <span className="metric-label">Active Chats</span>
            <div className="metric-status online">
              <span className="status-dot"></span>
              Live
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Clock size={24} />
          </div>
          <div className="metric-content">
            <span className="metric-value">{avgResponseTime}s</span>
            <span className="metric-label">Avg Response Time</span>
            <div className={`metric-trend ${trends.responseTime.isUp ? 'up' : 'down'}`}>
              {trends.responseTime.isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {trends.responseTime.value}% improvement
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#fae8ff', color: '#c026d3' }}>
            <Activity size={24} />
          </div>
          <div className="metric-content">
            <span className="metric-value">{data.totalMessages}</span>
            <span className="metric-label">Total Messages</span>
            <div className="metric-trend up">
              <TrendingUp size={14} />
              Real-time updates
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        {/* Sessions by Category */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Conversations by Category</h3>
            <div className="chart-legend">
              {Object.entries(data.sessionsByCategory).map(([category, count]) => (
                <div key={category} className="legend-item">
                  <span className="legend-color" style={{ background: getCategoryColor(category) }}></span>
                  <span className="legend-label">{category}</span>
                  <span className="legend-value">{count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="chart-body">
            <div className="bar-chart">
              {Object.entries(data.sessionsByCategory).map(([category, count]) => {
                const max = Math.max(...Object.values(data.sessionsByCategory));
                const percentage = (count / max) * 100;
                return (
                  <div key={category} className="bar-item">
                    <div className="bar-label">{category}</div>
                    <div className="bar-container">
                      <div
                        className="bar-fill"
                        style={{
                          width: `${percentage}%`,
                          background: getCategoryColor(category),
                        }}
                      ></div>
                      <span className="bar-value">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Session Status Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Session Status</h3>
          </div>
          <div className="chart-body">
            <div className="donut-chart">
              <svg viewBox="0 0 200 200">
                {Object.entries(data.sessionsByStatus).map(([status, count], index) => {
                  const total = Object.values(data.sessionsByStatus).reduce((a, b) => a + b, 0);
                  const percentage = (count / total) * 100;
                  const strokeDasharray = `${percentage * 3.14} 3.14`;
                  const offset = Object.entries(data.sessionsByStatus)
                    .slice(0, index)
                    .reduce((acc, [, val]) => acc - (val / total) * 100, 25);
                  
                  return (
                    <circle
                      key={status}
                      cx="100"
                      cy="100"
                      r="70"
                      fill="none"
                      stroke={getStatusColor(status)}
                      strokeWidth="20"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={offset}
                      transform="rotate(-90 100 100)"
                    />
                  );
                })}
              </svg>
              <div className="donut-center">
                <span className="donut-total">{totalSessions}</span>
                <span className="donut-label">Total</span>
              </div>
            </div>
            <div className="status-legend">
              {Object.entries(data.sessionsByStatus).map(([status, count]) => (
                <div key={status} className="status-item">
                  <span className="status-color" style={{ background: getStatusColor(status) }}></span>
                  <span className="status-label">{status}</span>
                  <span className="status-count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Peak Hours Heatmap */}
      <div className="heatmap-card">
        <div className="chart-header">
          <h3>Peak Activity Hours</h3>
          <p>Chat volume by hour of day</p>
        </div>
        <div className="heatmap-body">
          <div className="heatmap-grid">
            {Object.entries(data.peakHours).map(([hour, count]) => {
              const max = Math.max(...Object.values(data.peakHours), 1);
              const intensity = count / max;
              return (
                <div
                  key={hour}
                  className="heatmap-cell"
                  style={{
                    background: `rgba(99, 102, 241, ${0.1 + intensity * 0.9})`,
                  }}
                >
                  <span className="cell-hour">{hour}:00</span>
                  <span className="cell-count">{count}</span>
                </div>
              );
            })}
          </div>
          <div className="heatmap-legend">
            <span>Low</span>
            <div className="legend-gradient"></div>
            <span>High</span>
          </div>
        </div>
      </div>

      {/* Satisfaction Score */}
      <div className="satisfaction-card">
        <div className="chart-header">
          <h3>Customer Satisfaction</h3>
        </div>
        <div className="satisfaction-body">
          <div className="score-display">
            <div className="score-circle" style={{
              background: `conic-gradient(#16a34a ${satisfactionScore * 20}%, #e2e8f0 0)`,
            }}>
              <div className="score-inner">
                <span className="score-value">{satisfactionScore.toFixed(1)}</span>
                <span className="score-label">out of 5</span>
              </div>
            </div>
          </div>
          <div className="satisfaction-breakdown">
            <div className="breakdown-item">
              <span className="breakdown-label">Excellent</span>
              <div className="breakdown-bar">
                <div className="breakdown-fill" style={{ width: '65%', background: '#16a34a' }}></div>
              </div>
              <span className="breakdown-value">65%</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">Good</span>
              <div className="breakdown-bar">
                <div className="breakdown-fill" style={{ width: '25%', background: '#22c55e' }}></div>
              </div>
              <span className="breakdown-value">25%</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">Average</span>
              <div className="breakdown-bar">
                <div className="breakdown-fill" style={{ width: '7%', background: '#eab308' }}></div>
              </div>
              <span className="breakdown-value">7%</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">Poor</span>
              <div className="breakdown-bar">
                <div className="breakdown-fill" style={{ width: '3%', background: '#ef4444' }}></div>
              </div>
              <span className="breakdown-value">3%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    GENERAL: '#6366f1',
    TECHNICAL: '#8b5cf6',
    BILLING: '#f59e0b',
    SALES: '#10b981',
    FEEDBUG_REPORT: '#ef4444',
    BUG_REPORT: '#ef4444',
  };
  return colors[category] || '#64748b';
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    WAITING: '#f59e0b',
    ACTIVE: '#10b981',
    ON_HOLD: '#6366f1',
    CLOSED: '#64748b',
    TRANSFERRED: '#8b5cf6',
  };
  return colors[status] || '#64748b';
}
