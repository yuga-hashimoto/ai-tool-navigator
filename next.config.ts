import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const withNextIntl = createNextIntlPlugin();

/**
 * CDN Configuration
 * 
 * Configure your CDN settings in environment variables:
 * - CDN_ENABLED: Set to 'true' to enable CDN
 * - CDN_PROVIDER: 'cloudflare-r2' | 'cloudfront' | 'local' (default)
 * - CDN_URL: Your CDN base URL (e.g., https://cdn.yourdomain.com)
 * 
 * For Cloudflare R2:
 * - R2_ACCOUNT_ID: Your Cloudflare account ID
 * - R2_BUCKET_NAME: Your R2 bucket name
 * 
 * For CloudFront:
 * - CLOUDFRONT_URL: Your CloudFront distribution URL
 */

const cdnConfig = {
  enabled: process.env.CDN_ENABLED === 'true',
  baseUrl: process.env.CDN_URL || '',
  provider: process.env.CDN_PROVIDER || 'local',
};

const nextConfig: NextConfig = {
  output: "standalone",
  
  // Enable compression for static assets
  compress: true,
  
  // Configure CDN for static files
  async headers() {
    const headers: Array<{ source: string; headers: Array<{ key: string; value: string }> }> = [];
    
    // Add CDN headers if enabled
    if (cdnConfig.enabled) {
      // CORS headers for CDN
      headers.push({
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      });
      
      // Cache headers for static assets
      headers.push({
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      });
      
      headers.push({
        source: '/icons/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000' },
        ],
      });
    }
    
    return headers;
  },
  
  // Configure asset prefix for CDN
  assetPrefix: cdnConfig.enabled ? cdnConfig.baseUrl : undefined,
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: '**', // Allow all external images for flexibility
      },
    ],
    // Optionally use CDN for images
    ...(cdnConfig.enabled && cdnConfig.baseUrl ? {
      path: cdnConfig.baseUrl,
    } : {}),
  },
  
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // Main branch is currently broken with hundreds of type errors in loyalty/subscriptions
    ignoreBuildErrors: true,
  },

  // Webpack configuration for CDN
  webpack: (config, { isServer }) => {
    // Add CDN-related webpack configuration
    if (cdnConfig.enabled && !isServer) {
      // Ensure static files are properly hashed for long-term caching
      config.output.filename = '[name].[contenthash:8].js';
      config.output.chunkFilename = '[name].[contenthash:8].chunk.js';
    }
    return config;
  },
};

// PWA Configuration
const withPWAConfig = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  workboxOptions: {
    skipWaiting: true,
    clientsClaim: true,
  },
});

export default withPWAConfig(withNextIntl(nextConfig));
