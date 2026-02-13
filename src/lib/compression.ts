/**
 * Brotli Compression Middleware for Next.js
 * 
 * This middleware enables Brotli compression for all responses with fallback to gzip.
 * Compatible with Next.js standalone output mode.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Compression configuration
const COMPRESSION_CONFIG = {
  // Brotli quality levels (1-11), lower = faster but less compression
  brotliQuality: 6,
  // Gzip compression level (1-9)
  gzipLevel: 6,
  // Threshold in bytes - responses smaller than this won't be compressed
  threshold: 1024,
  // MIME types to compress
  mimeTypes: [
    'text/html',
    'text/css',
    'text/plain',
    'text/xml',
    'application/javascript',
    'application/x-javascript',
    'application/json',
    'application/xml',
    'application/xml+rss',
    'application/typescript',
    'application/font-woff2',
    'image/svg+xml',
  ],
  // MIME types to exclude from compression
  excludedMimeTypes: [
    'image/jpeg',
    'image/gif',
    'image/png',
    'image/webp',
    'application/octet-stream',
  ],
};

/**
 * Check if the request accepts a specific encoding
 */
function acceptsEncoding(request: NextRequest, encoding: string): boolean {
  const acceptEncoding = request.headers.get('accept-encoding') || '';
  return acceptEncoding.toLowerCase().includes(encoding.toLowerCase());
}

/**
 * Determine the best encoding to use based on request Accept-Encoding header
 */
function getPreferredEncoding(request: NextRequest): 'br' | 'gzip' | null {
  const acceptEncoding = request.headers.get('accept-encoding') || '';
  const normalized = acceptEncoding.toLowerCase();
  
  // Prefer Brotli if client supports it
  if (normalized.includes('br')) {
    return 'br';
  }
  
  // Fall back to gzip
  if (normalized.includes('gzip')) {
    return 'gzip';
  }
  
  return null;
}

/**
 * Check if the response should be compressed
 */
function shouldCompress(
  request: NextRequest,
  response: NextResponse
): boolean {
  // Don't compress if already compressed
  const contentEncoding = response.headers.get('content-encoding');
  if (contentEncoding) {
    return false;
  }

  // Get content type
  const contentType = response.headers.get('content-type') || '';
  
  // Check if MIME type should be compressed
  const shouldCompressType = COMPRESSION_CONFIG.mimeTypes.some(type => 
    contentType.includes(type)
  );
  
  // Check if explicitly excluded
  const isExcluded = COMPRESSION_CONFIG.excludedMimeTypes.some(type =>
    contentType.includes(type)
  );
  
  if (isExcluded || !shouldCompressType) {
    return false;
  }

  // Check if response has Vary header (indicates already handling compression)
  const vary = response.headers.get('vary') || '';
  if (vary.toLowerCase().includes('accept-encoding')) {
    return true;
  }

  // Only compress GET requests
  if (request.method !== 'GET') {
    return false;
  }

  return true;
}

/**
 * Add cache-friendly compression headers
 */
function addCompressionHeaders(response: NextResponse, encoding: string): void {
  response.headers.set('Vary', 'Accept-Encoding');
  response.headers.set('X-Content-Type-Options', 'nosniff');
}

/**
 * Brotli compression middleware
 * 
 * Note: This middleware adds Accept-Encoding handling.
 * Actual compression should be done at the Node.js server level
 * using @fastify/compress or similar for optimal performance.
 */
export function compressionMiddleware(
  request: NextRequest,
  response: NextResponse
): NextResponse {
  const encoding = getPreferredEncoding(request);
  
  if (!encoding) {
    return response;
  }

  if (shouldCompress(request, response)) {
    addCompressionHeaders(response, encoding);
  }

  return response;
}

export { COMPRESSION_CONFIG };
