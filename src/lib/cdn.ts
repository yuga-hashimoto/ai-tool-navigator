/**
 * CDN Configuration
 * 
 * This module provides CDN integration for static assets.
 * Currently configured for Cloudflare R2 (S3-compatible) with fallback to local assets.
 * 
 * Setup:
 * 1. Create a Cloudflare R2 bucket
 * 2. Add R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_ACCOUNT_ID to .env
 * 3. Optionally set CDN_URL to your custom domain
 */

export interface CDNConfig {
  enabled: boolean;
  provider: 'cloudflare-r2' | 'cloudfront' | 'local';
  baseUrl: string;
  uploadPath: string;
  region?: string;
}

export interface CDNUploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

export interface CDNPerformanceMetrics {
  timestamp: number;
  latency: number;
  statusCode: number;
  assetPath: string;
  cdnUrl: string;
  cached: boolean;
}

// Get CDN configuration from environment
export function getCDNConfig(): CDNConfig {
  const isEnabled = process.env.CDN_ENABLED === 'true';
  const provider = (process.env.CDN_PROVIDER as CDNConfig['provider']) || 'local';
  const customUrl = process.env.CDN_URL;
  
  // For Cloudflare R2, construct the public URL
  let baseUrl = '/';
  if (provider === 'cloudflare-r2' && process.env.R2_ACCOUNT_ID && process.env.R2_BUCKET_NAME) {
    baseUrl = customUrl || `https://${process.env.R2_BUCKET_NAME}.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  } else if (provider === 'cloudfront' && process.env.CLOUDFRONT_URL) {
    baseUrl = process.env.CLOUDFRONT_URL;
  }

  return {
    enabled: isEnabled,
    provider,
    baseUrl,
    uploadPath: process.env.CDN_UPLOAD_PATH || '_next/static',
    region: process.env.AWS_REGION || 'auto',
  };
}

// Generate CDN URL for a static asset
export function getCDNUrl(path: string): string {
  const config = getCDNConfig();
  
  if (!config.enabled || config.provider === 'local') {
    return path;
  }

  // Handle different asset types
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  return `${config.baseUrl}/${cleanPath}`;
}

// Check if asset should be served from CDN
export function isCDNEnabled(): boolean {
  return getCDNConfig().enabled;
}

// Get asset path for upload (build time)
export function getUploadPath(localPath: string): string {
  const config = getCDNConfig();
  
  // Map local paths to CDN paths
  if (localPath.includes('/_next/static/')) {
    return localPath.replace('./', '');
  }
  
  if (localPath.includes('/public/')) {
    return localPath.replace('./public/', '');
  }
  
  return localPath;
}
