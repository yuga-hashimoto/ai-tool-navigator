
import { RATE_LIMITS } from "./rate-limit-config";

export interface EndpointConfig {
  limit: number;
  requests: number; // Alias for limit to support both usages
  windowSeconds: number;
  daily?: number;
  keyPrefix?: string;
}

const createConfig = (limit: number, windowSeconds: number, keyPrefix?: string): EndpointConfig => ({
  limit,
  requests: limit,
  windowSeconds,
  keyPrefix,
});

export const ENDPOINT_CONFIGS: Record<string, EndpointConfig> = {
  '/api/abandonment/track': createConfig(100, 60, 'abandonment'),
  '/api/admin/security': createConfig(30, 60, 'admin_security'),
  '/api/affiliate/conversion': createConfig(20, 60, 'affiliate_conversion'),
  // Add other endpoints as needed
};
