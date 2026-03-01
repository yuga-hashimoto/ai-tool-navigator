import { Redis } from '@upstash/redis/cloudflare';
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

// Request pattern storage
interface RequestPattern {
  timestamps: number[];
  paths: string[];
  methods: string[];
  statusCodes: number[];
  userAgents: string[];
}

const memoryPatterns: Map<string, RequestPattern> = new Map();

// Anomaly types
export type AnomalyType = 
  | 'high_frequency'
  | 'unusual_path'
  | 'unusual_method'
  | 'error_spike'
  | 'geographic_impossible'
  | 'temporal_anomaly';

// Anomaly detection result
export interface AnomalyResult {
  isAnomalous: boolean;
  anomalyType?: AnomalyType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  score: number; // 0-100
  description: string;
  details?: Record<string, unknown>;
}

// Configuration
const CONFIG = {
  WINDOW_MS: 60 * 1000, // 1 minute window
  HIGH_FREQUENCY_THRESHOLD: 50, // requests per minute
  UNUSUAL_PATH_THRESHOLD: 0.1, // 10% of total requests
  ERROR_RATE_THRESHOLD: 0.5, // 50% error rate
  PATTERN_HISTORY_SIZE: 100,
};

// Track request for anomaly detection
export const trackRequest = async (
  ip: string,
  path: string,
  method: string,
  statusCode: number,
  userAgent?: string
): Promise<void> => {
  const redisClient = getRedisClient();
  const now = Date.now();
  const key = `anomaly:${ip}`;

  if (redisClient) {
    try {
      const data = await redisClient.get<RequestPattern>(key);
      let pattern: RequestPattern = data || {
        timestamps: [],
        paths: [],
        methods: [],
        statusCodes: [],
        userAgents: [],
      };

      // Add new request
      pattern.timestamps.push(now);
      pattern.paths.push(path);
      pattern.methods.push(method);
      pattern.statusCodes.push(statusCode);
      if (userAgent) pattern.userAgents.push(userAgent);

      // Trim old data
      const windowStart = now - CONFIG.WINDOW_MS;
      pattern.timestamps = pattern.timestamps.filter(t => t > windowStart);
      pattern.paths = pattern.paths.slice(-CONFIG.PATTERN_HISTORY_SIZE);
      pattern.methods = pattern.methods.slice(-CONFIG.PATTERN_HISTORY_SIZE);
      pattern.statusCodes = pattern.statusCodes.slice(-CONFIG.PATTERN_HISTORY_SIZE);
      pattern.userAgents = pattern.userAgents.slice(-CONFIG.PATTERN_HISTORY_SIZE);

      await redisClient.set(key, pattern, { ex: 3600 });
    } catch (error) {
      console.error('Failed to track request:', error);
    }
  } else {
    // Memory fallback
    let pattern = memoryPatterns.get(ip) || {
      timestamps: [],
      paths: [],
      methods: [],
      statusCodes: [],
      userAgents: [],
    };

    pattern.timestamps.push(now);
    pattern.paths.push(path);
    pattern.methods.push(method);
    pattern.statusCodes.push(statusCode);
    if (userAgent) pattern.userAgents.push(userAgent);

    const windowStart = now - CONFIG.WINDOW_MS;
    pattern.timestamps = pattern.timestamps.filter(t => t > windowStart);
    pattern.paths = pattern.paths.slice(-CONFIG.PATTERN_HISTORY_SIZE);
    pattern.methods = pattern.methods.slice(-CONFIG.PATTERN_HISTORY_SIZE);
    pattern.statusCodes = pattern.statusCodes.slice(-CONFIG.PATTERN_HISTORY_SIZE);
    pattern.userAgents = pattern.userAgents.slice(-CONFIG.PATTERN_HISTORY_SIZE);

    memoryPatterns.set(ip, pattern);
  }
};

// Detect anomalies
export const detectAnomalies = async (ip: string): Promise<AnomalyResult[]> => {
  const redisClient = getRedisClient();
  const now = Date.now();
  const windowStart = now - CONFIG.WINDOW_MS;
  let pattern: RequestPattern | null = null;

  if (redisClient) {
    try {
      pattern = await redisClient.get<RequestPattern>(`anomaly:${ip}`);
    } catch {
      // Fall through to memory
    }
  } else {
    pattern = memoryPatterns.get(ip) || null;
  }

  if (!pattern || pattern.timestamps.length === 0) {
    return [];
  }

  const anomalies: AnomalyResult[] = [];
  const recentTimestamps = pattern.timestamps.filter(t => t > windowStart);

  // 1. Check for high frequency
  if (recentTimestamps.length > CONFIG.HIGH_FREQUENCY_THRESHOLD) {
    anomalies.push({
      isAnomalous: true,
      anomalyType: 'high_frequency',
      severity: recentTimestamps.length > CONFIG.HIGH_FREQUENCY_THRESHOLD * 2 ? 'critical' : 'high',
      score: Math.min(100, recentTimestamps.length),
      description: `Very high request frequency: ${recentTimestamps.length} requests/min`,
      details: { count: recentTimestamps.length, threshold: CONFIG.HIGH_FREQUENCY_THRESHOLD },
    });
  }

  // 2. Check for unusual paths
  const pathCounts = new Map<string, number>();
  pattern.paths.forEach(p => pathCounts.set(p, (pathCounts.get(p) || 0) + 1));
  
  const totalPaths = pattern.paths.length;
  for (const [path, count] of pathCounts) {
    const rate = count / totalPaths;
    
    // Check for rare paths (less than 1% of requests)
    if (rate < CONFIG.UNUSUAL_PATH_THRESHOLD && totalPaths > 10) {
      // Check if it's a sensitive path
      const sensitivePaths = ['/admin', '/wp-', '/api/internal', '/.env', '/config'];
      const isSensitive = sensitivePaths.some(s => path.includes(s));
      
      if (isSensitive) {
        anomalies.push({
          isAnomalous: true,
          anomalyType: 'unusual_path',
          severity: 'high',
          score: 80,
          description: `Access to unusual sensitive path: ${path}`,
          details: { path, count, rate },
        });
      }
    }
  }

  // 3. Check for unusual methods
  const validMethods = ['GET', 'POST', 'PUT', 'DELETE'];
  const unusualMethods = pattern.methods.filter(m => !validMethods.includes(m));
  
  if (unusualMethods.length > 0) {
    anomalies.push({
      isAnomalous: true,
      anomalyType: 'unusual_method',
      severity: 'medium',
      score: 50,
      description: `Unusual HTTP methods detected`,
      details: { unusualMethods },
    });
  }

  // 4. Check for error spikes
  const errorCodes = [400, 401, 403, 404, 500, 502, 503];
  const errors = pattern.statusCodes.filter(c => errorCodes.includes(c));
  const errorRate = errors.length / pattern.statusCodes.length;
  
  if (errorRate > CONFIG.ERROR_RATE_THRESHOLD && pattern.statusCodes.length > 5) {
    anomalies.push({
      isAnomalous: true,
      anomalyType: 'error_spike',
      severity: 'medium',
      score: Math.round(errorRate * 100),
      description: `High error rate: ${Math.round(errorRate * 100)}%`,
      details: { errorRate, errorCount: errors.length, totalRequests: pattern.statusCodes.length },
    });
  }

  // 5. Check temporal patterns (requests at unusual intervals)
  if (recentTimestamps.length > 5) {
    const intervals: number[] = [];
    for (let i = 1; i < recentTimestamps.length; i++) {
      intervals.push(recentTimestamps[i] - recentTimestamps[i - 1]);
    }
    
    // Check for very regular intervals (bot-like)
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, i) => sum + Math.pow(i - avgInterval, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = stdDev / avgInterval;
    
    // Very regular intervals (CV < 0.1) suggest automation
    if (coefficientOfVariation < 0.1 && avgInterval < 1000) { // Less than 1 second average
      anomalies.push({
        isAnomalous: true,
        anomalyType: 'temporal_anomaly',
        severity: 'high',
        score: 90,
        description: 'Suspiciously regular request pattern detected',
        details: { avgInterval, coefficientOfVariation },
      });
    }
  }

  return anomalies;
};

// Get combined anomaly score
export const getAnomalyScore = async (ip: string): Promise<number> => {
  const anomalies = await detectAnomalies(ip);
  
  if (anomalies.length === 0) return 0;
  
  // Weight by severity
  const severityWeights = {
    low: 10,
    medium: 30,
    high: 60,
    critical: 100,
  };
  
  let maxScore = 0;
  for (const anomaly of anomalies) {
    const weight = severityWeights[anomaly.severity];
    if (weight > maxScore) {
      maxScore = weight;
    }
  }
  
  return maxScore;
};

// Check if should block based on anomalies
export const shouldBlockForAnomaly = async (ip: string): Promise<boolean> => {
  const anomalies = await detectAnomalies(ip);
  
  for (const anomaly of anomalies) {
    if (anomaly.severity === 'critical' || anomaly.severity === 'high') {
      return true;
    }
  }
  
  return false;
};
