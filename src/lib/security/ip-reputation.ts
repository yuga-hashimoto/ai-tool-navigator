import { Redis } from '@upstash/redis';
import { IP_REPUTATION, CLEANUP_INTERVALS } from './rate-limit-config';

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

// In-memory IP reputation store
interface IPReputation {
  score: number;
  lastUpdate: number;
  violations: string[];
  flags: string[];
}

const memoryReputation: Map<string, IPReputation> = new Map();

// Known IP blocklist (VPNs, proxies, datacenters)
const BLOCKED_IP_RANGES = [
  // Example ranges - in production, use a proper IP reputation service
  // '10.0.0.0/8',    // Private
  // '172.16.0.0/12', // Private
  // '192.168.0.0/16', // Private
];

// Known datacenters (AWS, GCP, Azure, etc.)
const DATACENTER_PREFIXES = [
  '3.', '4.', '5.', '13.', '15.', '18.', '23.', '34.', '35.', '44.', '45.', 
  '47.', '50.', '52.', '54.', '64.', '65.', '66.', '67.', '68.', '69.', '70.',
  '71.', '72.', '73.', '74.', '75.', '76.', '96.', '97.', '98.', '99.', 
  '104.', '107.', '108.', '130.', '131.', '132.', '133.', '134.', '135.',
  '136.', '137.', '138.', '139.', '140.', '142.', '143.', '144.', '146.',
  '147.', '148.', '149.', '150.', '151.', '152.', '153.', '154.', '155.',
  '157.', '158.', '159.', '160.', '161.', '162.', '163.', '164.', '165.',
  // Add more as needed
];

// IP Reputation Interface
export interface IPReputationResult {
  score: number;
  isBlocked: boolean;
  isSuspicious: boolean;
  requiresCaptcha: boolean;
  reasons: string[];
  isDatacenter: boolean;
}

// Get IP reputation
export const getIPReputation = async (ip: string): Promise<IPReputationResult> => {
  const reasons: string[] = [];
  
  // Check if IP is in blocklist
  if (isIPBlocked(ip)) {
    return {
      score: IP_REPUTATION.MIN_SCORE,
      isBlocked: true,
      isSuspicious: true,
      requiresCaptcha: true,
      reasons: ['IP is in blocklist'],
      isDatacenter: false,
    };
  }

  // Check if IP is from datacenter
  const isDatacenter = isDatacenterIP(ip);
  if (isDatacenter) {
    reasons.push('IP from datacenter/VPN range');
  }

  // Get stored reputation
  const stored = await getStoredReputation(ip);
  const storedScore = stored?.score || IP_REPUTATION.GOOD_THRESHOLD;
  
  // Combine with datacenter penalty
  let finalScore = storedScore;
  if (isDatacenter && storedScore > 50) {
    finalScore -= 20;
  }

  // Check thresholds
  const isBlocked = finalScore <= IP_REPUTATION.BLOCK_THRESHOLD;
  const isSuspicious = finalScore <= IP_REPUTATION.SUSPICIOUS_THRESHOLD;
  const requiresCaptcha = finalScore < 30 || isDatacenter;

  return {
    score: finalScore,
    isBlocked,
    isSuspicious,
    requiresCaptcha,
    reasons: [...reasons, ...(stored?.reasons || [])],
    isDatacenter,
  };
};

// Check if IP is in blocklist
const isIPBlocked = (ip: string): boolean => {
  // Check against blocked ranges
  for (const range of BLOCKED_IP_RANGES) {
    if (ip.startsWith(range.replace(/\/\d+$/, ''))) {
      return true;
    }
  }
  
  // Check memory blocklist
  const blockedIPs = blockedIPsSet;
  if (blockedIPs.has(ip)) {
    return true;
  }
  
  return false;
};

// In-memory blocked IPs set
const blockedIPsSet = new Set<string>();

// Check if IP is from datacenter
const isDatacenterIP = (ip: string): boolean => {
  for (const prefix of DATACENTER_PREFIXES) {
    if (ip.startsWith(prefix)) {
      return true;
    }
  }
  return false;
};

// Get stored reputation from Redis or memory
const getStoredReputation = async (ip: string): Promise<IPReputation | null> => {
  const redisClient = getRedisClient();
  
  if (redisClient) {
    try {
      const data = await redisClient.get<{
        score: number;
        lastUpdate: number;
        violations: string[];
        flags: string[];
      }>(`ipreputation:${ip}`);
      return data || null;
    } catch {
      // Fall through to memory
    }
  }
  
  // Check memory store
  return memoryReputation.get(ip) || null;
};

// Update IP reputation
export const updateIPReputation = async (
  ip: string,
  adjustment: number,
  reason: string,
  flag?: string
): Promise<void> => {
  const redisClient = getRedisClient();
  const now = Date.now();
  
  // Get current reputation
  let current = await getStoredReputation(ip);
  
  if (!current) {
    current = {
      score: IP_REPUTATION.GOOD_THRESHOLD,
      lastUpdate: now,
      violations: [],
      flags: [],
    };
  }

  // Adjust score
  current.score = Math.max(
    IP_REPUTATION.MIN_SCORE,
    Math.min(IP_REPUTATION.MAX_SCORE, current.score + adjustment)
  );
  current.lastUpdate = now;
  
  if (reason) {
    current.violations.push(`${reason} (${new Date().toISOString()})`);
    // Keep only last 10 violations
    if (current.violations.length > 10) {
      current.violations = current.violations.slice(-10);
    }
  }
  
  if (flag) {
    current.flags.push(flag);
  }

  // Store
  if (redisClient) {
    try {
      await redisClient.set(`ipreputation:${ip}`, current, {
        ex: CLEANUP_INTERVALS.IP_REPUTATION_WINDOW,
      });
    } catch (error) {
      console.error('Failed to update IP reputation in Redis:', error);
    }
  } else {
    memoryReputation.set(ip, current);
  }
};

// Block an IP
export const blockIP = async (ip: string, reason?: string): Promise<void> => {
  blockedIPsSet.add(ip);
  
  await updateIPReputation(ip, IP_REPUTATION.MIN_SCORE, reason || 'Manually blocked', 'blocked');
};

// Unblock an IP
export const unblockIP = async (ip: string): Promise<void> => {
  blockedIPsSet.delete(ip);
  
  const redisClient = getRedisClient();
  if (redisClient) {
    await redisClient.del(`ipreputation:${ip}`);
  } else {
    memoryReputation.delete(ip);
  }
};

// Check if IP is blocked
export const isIPBlockedFunc = (ip: string): boolean => {
  return blockedIPsSet.has(ip);
};

// Get all blocked IPs (for admin)
export const getBlockedIPs = (): string[] => {
  return Array.from(blockedIPsSet);
};

// Record a successful request (improves reputation)
export const recordSuccess = async (ip: string): Promise<void> => {
  await updateIPReputation(ip, 1, undefined);
};

// Record a failed attempt (decreases reputation)
export const recordFailure = async (ip: string, reason: string): Promise<void> => {
  await updateIPReputation(ip, -5, reason);
};

export const clearCaptchaReq = async (ip: string): Promise<void> => {
  await updateIPReputation(ip, 20, 'CAPTCHA solved successfully', 'captcha_solved');
};
