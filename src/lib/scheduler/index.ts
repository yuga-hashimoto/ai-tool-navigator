/**
 * Tool of the Week Scheduler Module Exports
 */

// Scheduler
export {
  runToolOfTheWeekScheduler,
  shouldRotate,
  selectNextToolOfTheWeek,
  getCurrentToolOfTheWeek,
  getAvailableTools,
  generateToolOfTheWeekPost,
  saveToolOfTheWeekPost,
  type SchedulerConfig,
  type Tool,
} from './tool-of-the-week-scheduler';

// Performance Tracker
export {
  trackView,
  trackClick,
  trackTimeOnPage,
  trackBounceRate,
  trackConversion,
  trackSocialShare,
  trackRelatedToolClick,
  trackComment,
  getMetricsForTool,
  getAllMetrics,
  getAggregatedMetrics,
  exportMetricsToFile,
  generatePerformanceReport,
  type PerformanceMetrics,
  type AggregatedMetrics,
  type ToolPerformance,
} from './performance-tracker';

// SEO Optimizer
export {
  generateKeywordsForTool,
  generateMetaTitle,
  generateMetaDescription,
  generateOpenGraphTags,
  generateTwitterCardTags,
  generateStructuredData,
  generateInternalLinks,
  analyzeContentSEO,
  generateSEOReport,
  type SEOKeywords,
  type SEOConfig,
} from './seo-optimizer';
