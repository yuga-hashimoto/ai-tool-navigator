import { NextResponse } from 'next/server';

/**
 * Sets headers to enable/hint compression for API responses.
 * Note: Actual compression is often handled by the deployment platform (Vercel, Cloudflare, etc.)
 * or Next.js config, but this sets appropriate Vary headers.
 */
export function setApiCompressionHeaders(response: NextResponse) {
  response.headers.set('Vary', 'Accept-Encoding');
  // Optional: Add other relevant headers if needed
  return response;
}
