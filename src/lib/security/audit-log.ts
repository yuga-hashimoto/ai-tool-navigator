import { Redis } from '@upstash/redis';
import { CLEANUP_INTERVALS } from './rate-limit-config';

let redis: Redis | null = null;

const getRedisClient = (): Redis | null => {
  if (redis) return redis;
  
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (redisUrl && redisToken) {
    redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });
    return redis;
  }
  
  return null;
};

// Audit log entry
export interface AuditLogEntry {
  id: string;
  timestamp: number;
  eventType: string;
  ip: string;
  userAgent?: string;
  path: string;
  method: string;
  userId?: string;
  status: 'allowed' | 'blocked' | 'challenge' | 'flagged';
  botScore?: number;
  reputationScore?: number;
  reasons?: string[];
  flags?: string[];
  metadata?: Record<string, unknown>;
}

// Event types
export const AUDIT_EVENTS = {
  // Rate limiting events
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  RATE_LIMIT_ALLOWED: 'rate_limit_allowed',
  
  // Bot detection events
  BOT_DETECTED: 'bot_detected',
  BOT_BLOCKED: 'bot_blocked',
  CAPTCHA_REQUIRED: 'captcha_required',
  
  // IP reputation events
  IP_BLOCKED: 'ip_blocked',
  IP_UNBLOCKED: 'ip_unblocked',
  SUSPICIOUS_IP: 'suspicious_ip',
  
  // Authentication events
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILED: 'login_failed',
  LOGOUT: 'logout',
  PASSWORD_RESET_REQUESTED: 'password_reset_requested',
  
  // Form submissions
  FORM_SUBMITTED: 'form_submitted',
  FORM_SPAM_DETECTED: 'form_spam_detected',
  HONEYPOT_TRIGGERED: 'honeypot_triggered',
  
  // API events
  API_REQUEST: 'api_request',
  API_ERROR: 'api_error',
  
  // Anomaly events
  ANOMALY_DETECTED: 'anomaly_detected',
  UNUSUAL_PATTERN: 'unusual_pattern',
} as const;

// In-memory audit log for development
const memoryAuditLog: AuditLogEntry[] = [];
const MAX_MEMORY_ENTRIES = 1000;

// Create audit log entry
export const createAuditLog = async (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> => {
  const fullEntry: AuditLogEntry = {
    ...entry,
    id: generateId(),
    timestamp: Date.now(),
  };

  const redisClient = getRedisClient();
  
  if (redisClient) {
    try {
      // Store in sorted set with timestamp as score for time-based queries
      const key = `audit:${entry.eventType}`;
      await redisClient.zadd(key, {
        score: fullEntry.timestamp,
        member: JSON.stringify(fullEntry),
      });
      
      // Set TTL for auto-cleanup
      await redisClient.expire(key, CLEANUP_INTERVALS.AUDIT_LOG_RETENTION);
      
      // Also add to general audit log
      await redisClient.zadd('audit:all', {
        score: fullEntry.timestamp,
        member: JSON.stringify(fullEntry),
      });
      await redisClient.expire('audit:all', CLEANUP_INTERVALS.AUDIT_LOG_RETENTION);
    } catch (error) {
      console.error('Failed to write audit log to Redis:', error);
      // Fall through to memory
      addToMemoryLog(fullEntry);
    }
  } else {
    addToMemoryLog(fullEntry);
  }
};

// Add to memory log
const addToMemoryLog = (entry: AuditLogEntry): void => {
  memoryAuditLog.unshift(entry);
  
  // Trim to max size
  if (memoryAuditLog.length > MAX_MEMORY_ENTRIES) {
    memoryAuditLog.pop();
  }
};

// Generate unique ID
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Query audit logs
export const queryAuditLogs = async (
  options: {
    eventType?: string;
    startTime?: number;
    endTime?: number;
    ip?: string;
    status?: AuditLogEntry['status'];
    limit?: number;
    offset?: number;
  } = {}
): Promise<AuditLogEntry[]> => {
  const { 
    eventType, 
    startTime, 
    endTime, 
    ip, 
    status,
    limit = 100, 
    offset = 0 
  } = options;

  const redisClient = getRedisClient();
  
  // Determine time range
  const start = startTime || Date.now() - CLEANUP_INTERVALS.AUDIT_LOG_RETENTION;
  const end = endTime || Date.now();

  if (redisClient) {
    try {
      const key = eventType ? `audit:${eventType}` : 'audit:all';
      
      // Get entries in time range
      const entries = await redisClient.zrange(
        key,
        start,
        end,
        { byScore: true, withScores: true }
      );
      
      const results: AuditLogEntry[] = [];
      
      for (let i = 0; i < entries.length; i += 2) {
        try {
          const entry = JSON.parse(entries[i] as string) as AuditLogEntry;
          
          // Apply filters
          if (ip && entry.ip !== ip) continue;
          if (status && entry.status !== status) continue;
          
          results.push(entry);
          
          if (results.length >= limit) break;
        } catch {
          // Skip invalid entries
        }
      }
      
      return results;
    } catch (error) {
      console.error('Failed to query audit logs:', error);
    }
  }

  // Fallback to memory
  return memoryAuditLog
    .filter(entry => {
      if (eventType && entry.eventType !== eventType) return false;
      if (ip && entry.ip !== ip) return false;
      if (status && entry.status !== status) return false;
      if (startTime && entry.timestamp < startTime) return false;
      if (endTime && entry.timestamp > endTime) return false;
      return true;
    })
    .slice(offset, offset + limit);
};

// Get security statistics
export const getSecurityStats = async (
  periodHours: number = 24
): Promise<{
  totalRequests: number;
  blockedRequests: number;
  botDetections: number;
  rateLimitExceeded: number;
  uniqueIPs: number;
  topIPs: Array<{ ip: string; count: number }>;
  topPaths: Array<{ path: string; count: number }>;
  eventCounts: Record<string, number>;
}> => {
  const startTime = Date.now() - (periodHours * 60 * 60 * 1000);
  const entries = await queryAuditLogs({ startTime, limit: 10000 });
  
  const stats = {
    totalRequests: 0,
    blockedRequests: 0,
    botDetections: 0,
    rateLimitExceeded: 0,
    captchaChallenges: 0,
    botScoreSum: 0,
    botScoreCount: 0,
    uniqueIPs: new Set<string>(),
    topIPs: [] as Array<{ ip: string; count: number }>,
    topPaths: [] as Array<{ path: string; count: number }>,
    eventCounts: {} as Record<string, number>,
  };
  
  for (const entry of entries) {
    stats.totalRequests++;
    stats.uniqueIPs.add(entry.ip);
    stats.eventCounts[entry.eventType] = (stats.eventCounts[entry.eventType] || 0) + 1;
    
    if (entry.status === 'blocked') stats.blockedRequests++;
    if (entry.eventType === AUDIT_EVENTS.BOT_DETECTED) stats.botDetections++;
    if (entry.eventType === AUDIT_EVENTS.RATE_LIMIT_EXCEEDED) stats.rateLimitExceeded++;
    if (entry.eventType === AUDIT_EVENTS.CAPTCHA_REQUIRED) stats.captchaChallenges++;

    if (entry.botScore !== undefined) {
      stats.botScoreSum += entry.botScore;
      stats.botScoreCount++;
    }
  }
  
  // Calculate top IPs
  const ipCounts = new Map<string, number>();
  for (const entry of entries) {
    if (entry.ip !== 'unknown') {
      ipCounts.set(entry.ip, (ipCounts.get(entry.ip) || 0) + 1);
    }
  }
  stats.topIPs = Array.from(ipCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([ip, count]) => ({ ip, count }));
  
  // Calculate top paths
  const pathCounts = new Map<string, number>();
  for (const entry of entries) {
    pathCounts.set(entry.path, (pathCounts.get(entry.path) || 0) + 1);
  }
  stats.topPaths = Array.from(pathCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([path, count]) => ({ path, count }));
  
  return {
    ...stats,
    avgBotScore: stats.botScoreCount > 0 ? stats.botScoreSum / stats.botScoreCount : 0,
    uniqueIPs: stats.uniqueIPs.size,
  } as {
    totalRequests: number;
    blockedRequests: number;
    botDetections: number;
    rateLimitExceeded: number;
    captchaChallenges: number;
    avgBotScore: number;
    uniqueIPs: number;
    topIPs: Array<{ ip: string; count: number }>;
    topPaths: Array<{ path: string; count: number }>;
    eventCounts: Record<string, number>;
  };
};

export const getSecurityStatsByPeriod = async (
  periodHours: number = 24
) => {
  return getSecurityStats(periodHours);
};

// Helper function to log rate limit events
export const logRateLimitEvent = async (
  ip: string,
  path: string,
  method: string,
  allowed: boolean,
  userAgent?: string
): Promise<void> => {
  await createAuditLog({
    eventType: allowed ? AUDIT_EVENTS.RATE_LIMIT_ALLOWED : AUDIT_EVENTS.RATE_LIMIT_EXCEEDED,
    ip,
    userAgent,
    path,
    method,
    status: allowed ? 'allowed' : 'blocked',
  });
};

// Helper function to log bot detection events
export const logBotDetection = async (
  ip: string,
  path: string,
  method: string,
  result: { score: number; isBot: boolean; reasons: string[]; flags: string[] },
  userAgent?: string
): Promise<void> => {
  await createAuditLog({
    eventType: result.isBot ? AUDIT_EVENTS.BOT_DETECTED : AUDIT_EVENTS.API_REQUEST,
    ip,
    userAgent,
    path,
    method,
    status: result.isBot ? 'blocked' : 'allowed',
    botScore: result.score,
    reasons: result.reasons,
    flags: result.flags,
  });
};

// Helper function to log form submission
export const logFormSubmission = async (
  ip: string,
  path: string,
  formType: string,
  isSpam: boolean,
  userAgent?: string
): Promise<void> => {
  await createAuditLog({
    eventType: isSpam ? AUDIT_EVENTS.FORM_SPAM_DETECTED : AUDIT_EVENTS.FORM_SUBMITTED,
    ip,
    userAgent,
    path,
    method: 'POST',
    status: isSpam ? 'blocked' : 'allowed',
    metadata: { formType },
  });
};
