/**
 * Tool of the Week Performance Tracker
 * 
 * Tracks engagement metrics for Tool of the Week posts and tools.
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const POSTS_DIR = path.join(process.cwd(), 'content/posts/en/tool-of-the-week');

export interface PerformanceMetrics {
  toolSlug: string;
  postDate: string;
  views: number;
  clicks: number;
  timeOnPage: number;
  bounceRate: number;
  conversions: number;
  socialShares: {
    twitter: number;
    facebook: number;
    linkedin: number;
    reddit: number;
  };
  comments: number;
  relatedToolClicks: number;
}

export interface AggregatedMetrics {
  totalViews: number;
  totalClicks: number;
  avgTimeOnPage: number;
  avgBounceRate: number;
  totalConversions: number;
  avgSocialShares: number;
  topPerformingTools: ToolPerformance[];
}

export interface ToolPerformance {
  toolSlug: string;
  toolTitle: string;
  totalViews: number;
  conversionRate: number;
  engagementScore: number;
}

// In-memory storage for metrics (in production, use a database)
let metricsStore: Map<string, PerformanceMetrics> = new Map();

/**
 * Initialize metrics storage
 */
export function initializeMetrics(): void {
  if (!fs.existsSync(POSTS_DIR)) {
    fs.mkdirSync(POSTS_DIR, { recursive: true });
  }
  
  // Load existing metrics from posts
  if (fs.existsSync(POSTS_DIR)) {
    const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
    
    files.forEach(file => {
      const filepath = path.join(POSTS_DIR, file);
      const content = fs.readFileSync(filepath, 'utf-8');
      const { data } = matter(content);
      
      if (data.tool_of_the_week && data.slug) {
        const slug = data.slug;
        const existingMetrics = metricsStore.get(slug) || {
          toolSlug: data.slug,
          postDate: data.date,
          views: 0,
          clicks: 0,
          timeOnPage: 0,
          bounceRate: 0,
          conversions: 0,
          socialShares: { twitter: 0, facebook: 0, linkedin: 0, reddit: 0 },
          comments: 0,
          relatedToolClicks: 0,
        };
        
        metricsStore.set(slug, existingMetrics);
      }
    });
  }
}

/**
 * Track a page view
 */
export function trackView(toolSlug: string): void {
  const metrics = metricsStore.get(toolSlug) || initializeMetricsForTool(toolSlug);
  metrics.views++;
  metricsStore.set(toolSlug, metrics);
}

/**
 * Track a click-through
 */
export function trackClick(toolSlug: string): void {
  const metrics = metricsStore.get(toolSlug) || initializeMetricsForTool(toolSlug);
  metrics.clicks++;
  metricsStore.set(toolSlug, metrics);
}

/**
 * Track time on page
 */
export function trackTimeOnPage(toolSlug: string, seconds: number): void {
  const metrics = metricsStore.get(toolSlug) || initializeMetricsForTool(toolSlug);
  metrics.timeOnPage = seconds;
  metricsStore.set(toolSlug, metrics);
}

/**
 * Track bounce rate
 */
export function trackBounceRate(toolSlug: string, rate: number): void {
  const metrics = metricsStore.get(toolSlug) || initializeMetricsForTool(toolSlug);
  metrics.bounceRate = rate;
  metricsStore.set(toolSlug, metrics);
}

/**
 * Track a conversion (affiliate link click or signup)
 */
export function trackConversion(toolSlug: string): void {
  const metrics = metricsStore.get(toolSlug) || initializeMetricsForTool(toolSlug);
  metrics.conversions++;
  metricsStore.set(toolSlug, metrics);
}

/**
 * Track social shares
 */
export function trackSocialShare(toolSlug: string, platform: keyof PerformanceMetrics['socialShares']): void {
  const metrics = metricsStore.get(toolSlug) || initializeMetricsForTool(toolSlug);
  metrics.socialShares[platform]++;
  metricsStore.set(toolSlug, metrics);
}

/**
 * Track related tool clicks
 */
export function trackRelatedToolClick(toolSlug: string): void {
  const metrics = metricsStore.get(toolSlug) || initializeMetricsForTool(toolSlug);
  metrics.relatedToolClicks++;
  metricsStore.set(toolSlug, metrics);
}

/**
 * Track comments
 */
export function trackComment(toolSlug: string): void {
  const metrics = metricsStore.get(toolSlug) || initializeMetricsForTool(toolSlug);
  metrics.comments++;
  metricsStore.set(toolSlug, metrics);
}

/**
 * Initialize metrics for a tool
 */
function initializeMetricsForTool(toolSlug: string): PerformanceMetrics {
  // Try to get post date from the post file
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
  let postDate = new Date().toISOString().split('T')[0];
  
  for (const file of files) {
    if (file.includes(toolSlug)) {
      const filepath = path.join(POSTS_DIR, file);
      const content = fs.readFileSync(filepath, 'utf-8');
      const { data } = matter(content);
      if (data.date) {
        postDate = data.date;
      }
      break;
    }
  }
  
  return {
    toolSlug,
    postDate,
    views: 0,
    clicks: 0,
    timeOnPage: 0,
    bounceRate: 0,
    conversions: 0,
    socialShares: { twitter: 0, facebook: 0, linkedin: 0, reddit: 0 },
    comments: 0,
    relatedToolClicks: 0,
  };
}

/**
 * Get metrics for a specific tool
 */
export function getMetricsForTool(toolSlug: string): PerformanceMetrics | null {
  return metricsStore.get(toolSlug) || null;
}

/**
 * Get all metrics
 */
export function getAllMetrics(): PerformanceMetrics[] {
  return Array.from(metricsStore.values());
}

/**
 * Get aggregated metrics
 */
export function getAggregatedMetrics(): AggregatedMetrics {
  const allMetrics = getAllMetrics();
  
  if (allMetrics.length === 0) {
    return {
      totalViews: 0,
      totalClicks: 0,
      avgTimeOnPage: 0,
      avgBounceRate: 0,
      totalConversions: 0,
      avgSocialShares: 0,
      topPerformingTools: [],
    };
  }
  
  let totalViews = 0;
  let totalClicks = 0;
  let totalTimeOnPage = 0;
  let totalBounceRate = 0;
  let totalConversions = 0;
  let totalSocialShares = 0;
  
  const toolPerformances: ToolPerformance[] = allMetrics.map(m => {
    totalViews += m.views;
    totalClicks += m.clicks;
    totalTimeOnPage += m.timeOnPage;
    totalBounceRate += m.bounceRate;
    totalConversions += m.conversions;
    totalSocialShares += Object.values(m.socialShares).reduce((a, b) => a + b, 0);
    
    const totalSocial = Object.values(m.socialShares).reduce((a, b) => a + b, 0);
    const conversionRate = m.views > 0 ? (m.conversions / m.views) * 100 : 0;
    const engagementScore = calculateEngagementScore(m);
    
    return {
      toolSlug: m.toolSlug,
      toolTitle: m.toolSlug,
      totalViews: m.views,
      conversionRate,
      engagementScore,
    };
  });
  
  // Sort by engagement score
  toolPerformances.sort((a, b) => b.engagementScore - a.engagementScore);
  
  return {
    totalViews,
    totalClicks,
    avgTimeOnPage: totalTimeOnPage / allMetrics.length,
    avgBounceRate: totalBounceRate / allMetrics.length,
    totalConversions,
    avgSocialShares: totalSocialShares / allMetrics.length,
    topPerformingTools: toolPerformances.slice(0, 5),
  };
}

/**
 * Calculate engagement score for a tool
 */
function calculateEngagementScore(metrics: PerformanceMetrics): number {
  // Weighted scoring system
  const viewsWeight = 1;
  const clicksWeight = 3;
  const timeOnPageWeight = 2;
  const conversionsWeight = 5;
  const socialSharesWeight = 2;
  const commentsWeight = 2;
  const relatedClicksWeight = 2;
  
  const normalizedViews = Math.min(metrics.views / 1000, 10); // Cap at 10
  const normalizedTime = Math.min(metrics.timeOnPage / 180, 10); // Cap at 3 minutes
  
  const score = 
    (normalizedViews * viewsWeight) +
    (metrics.clicks * clicksWeight) +
    (normalizedTime * timeOnPageWeight) +
    (metrics.conversions * conversionsWeight) +
    (Object.values(metrics.socialShares).reduce((a, b) => a + b, 0) * socialSharesWeight) +
    (metrics.comments * commentsWeight) +
    (metrics.relatedToolClicks * relatedClicksWeight);
  
  return Math.round(score * 10) / 10;
}

/**
 * Export metrics to JSON file
 */
export function exportMetricsToFile(filepath: string = path.join(process.cwd(), 'metrics-tool-of-week.json')): void {
  const metrics = getAllMetrics();
  fs.writeFileSync(filepath, JSON.stringify(metrics, null, 2));
  console.log(`Metrics exported to ${filepath}`);
}

/**
 * Get performance report
 */
export function generatePerformanceReport(): string {
  const aggregated = getAggregatedMetrics();
  const allMetrics = getAllMetrics();
  
  let report = '# Tool of the Week Performance Report\n\n';
  report += `Generated: ${new Date().toISOString()}\n\n`;
  
  report += '## Overview\n\n';
  report += `- **Total Views**: ${aggregated.totalViews.toLocaleString()}\n`;
  report += `- **Total Clicks**: ${aggregated.totalClicks.toLocaleString()}\n`;
  report += `- **Total Conversions**: ${aggregated.totalConversions.toLocaleString()}\n`;
  report += `- **Avg Time on Page**: ${Math.round(aggregated.avgTimeOnPage)}s\n`;
  report += `- **Avg Bounce Rate**: ${aggregated.avgBounceRate.toFixed(1)}%\n`;
  report += `- **Avg Social Shares**: ${aggregated.avgSocialShares.toFixed(1)}\n\n`;
  
  report += '## Top Performing Tools\n\n';
  report += '| Rank | Tool | Views | Conversion Rate | Engagement Score |\n';
  report += '|------|------|-------|-----------------|------------------|\n';
  
  aggregated.topPerformingTools.forEach((tool, index) => {
    report += `| ${index + 1} | ${tool.toolTitle} | ${tool.totalViews} | ${tool.conversionRate.toFixed(1)}% | ${tool.engagementScore} |\n`;
  });
  
  report += '\n## Recommendations\n\n';
  
  if (aggregated.topPerformingTools.length > 0) {
    const topTool = aggregated.topPerformingTools[0];
    report += `Based on performance data, **${topTool.toolTitle}** is the top-performing Tool of the Week. `;
    report += 'Consider featuring similar tools or tools in the same category for future rotations.\n';
  }
  
  if (aggregated.avgBounceRate > 50) {
    report += '\n⚠️ **High bounce rate detected**. Consider improving:\n';
    report += '- Content quality and readability\n';
    report += '- Internal linking to keep users engaged\n';
    report += '- Call-to-action placement\n';
  }
  
  if (aggregated.avgSocialShares < 1) {
    report += '\n📊 **Low social engagement**. Consider adding:\n';
    report += '- Social share buttons prominently\n';
    report += '- Shareable quotes or statistics\n';
    report += '- Twitter/Facebook cards for better visibility\n';
  }
  
  return report;
}

// Initialize on module load
initializeMetrics();
