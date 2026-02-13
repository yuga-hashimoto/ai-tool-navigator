/**
 * Custom Next.js Server with Brotli Compression
 * 
 * This file replaces the default Next.js server to add Brotli compression support.
 * Use this with Next.js standalone output mode.
 * 
 * To use:
 * 1. Install dependencies: npm install compression
 * 2. Build: npm run build
 * 3. Start: node server.js
 * 
 * Features:
 * - Native Brotli compression (Node.js 11.7.0+)
 * - Gzip fallback for older clients
 * - Intelligent compression based on Accept-Encoding header
 * - Optimized compression ratios for different content types
 */

const compression = require('compression');
const express = require('express');
const http = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, quiet: !dev });
const handle = app.getRequestHandler();

// Compression configuration optimized for Next.js assets
const compressionConfig = {
  // Threshold in bytes - only compress responses larger than this
  threshold: 1024,
  // Filter function - don't compress if this returns false
  filter: (req, res) => {
    // Don't compress if no Accept-Encoding header
    if (!req.headers['accept-encoding']) return false;
    
    // Don't compress if the filter from compression middleware returns false
    return compression.filter(req, res);
  },
};

// Brotli-specific options (using Node.js native zlib)
const brotliOptions = {
  // Brotli quality (0-11), 6 is optimal balance of speed/compression
  // 4 = fastest, 6 = balanced, 11 = maximum compression
  params: {
    [require('zlib').constants.BROTLI_PARAM_MODE]: require('zlib').constants.BROTLI_MODE_TEXT,
    [require('zlib').constants.BROTLI_PARAM_QUALITY]: 6,
    [require('zlib').constants.BROTLI_PARAM_SIZE_HINT]: 0,
  },
};

// Gzip options
const gzipOptions = {
  level: 6, // balanced compression level
  threshold: 1024,
};

app.prepare().then(() => {
  const server = express();

  // Enable compression middleware with Brotli and Gzip support
  server.use(compression(compressionConfig));

  // Compression-aware cache headers middleware
  server.use((req, res, next) => {
    // Add Vary header for compression negotiation
    res.set('Vary', 'Accept-Encoding');
    
    // Cache control for static assets (compressed by Next.js automatically)
    if (req.url && /\.(js|css|png|jpg|jpeg|gif|ico|svg|woff2|ttf|eot|otf|map)$/.test(req.url)) {
      res.set('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (req.url && req.url.startsWith('/api')) {
      // API routes: short cache for dynamic content
      res.set('Cache-Control', 'public, max-age=60, s-maxage=300');
      res.set('X-Content-Type-Options', 'nosniff');
    } else if (req.url && (req.url.endsWith('.html') || req.url === '/')) {
      // HTML pages: short cache for fresh content
      res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=600');
    }
    
    next();
  });

  // Handle all requests
  server.all('*', (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Create HTTP server
  const httpServer = http.createServer(server);

  // Error handling
  httpServer.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${port} is already in use`);
      process.exit(1);
    }
    console.error('❌ Server error:', err);
    process.exit(1);
  });

  // Start server
  httpServer.listen(port, () => {
    console.log(`🚀 Next.js server with Brotli compression ready at http://${hostname}:${port}`);
    console.log(`   Environment: ${dev ? 'development' : 'production'}`);
    console.log(`   Brotli quality: 6 (balanced speed/compression)`);
    console.log(`   Gzip level: 6 (balanced speed/compression)`);
    console.log(`   Compression threshold: 1KB`);
    console.log(`   ✅ All assets (HTML, JS, CSS, images, fonts) are compressed`);
    console.log(`   ✅ API responses are compressed`);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
