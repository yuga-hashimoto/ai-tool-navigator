
export const ENDPOINT_CONFIGS: Record<string, { limit: number; windowSeconds: number }> = {
  '/api/abandonment/track': { limit: 100, windowSeconds: 60 },
  '/api/admin/security': { limit: 50, windowSeconds: 60 },
};
