/**
 * Custom Next.js Server with Brotli Compression
 * 
 * This file replaces the default Next.js server to add Brotli compression support.
 * Use this with Next.js standalone output mode.
 * 
 * To use:
 * 1. Install dependencies: npm install compression @fastify/compress
 * 2. Build: npm run build
 * 3. Start: node server.js
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

// Brotli compression configuration
const compressionConfig = {
  // Enable Brotli (requires compression@1.7+)
  brotli: {
    // Brotli quality (0-11), 6 is a good balance
    quality: 6,
    // Zlib flush option
    zlibFlush: require('zlib').constants.Z_BEST_COMPRESSION,
    // Threshold in bytes
    threshold: 1024,
  },
  // Gzip fallback
  gzip: {
    // Gzip level (1-9), 6 is a good balance
    level: 6,
    threshold: 1024,
  },
};

app.prepare().then(() => {
  const server = express();

  // Enable compression middleware with Brotli support
  server.use(compression(compressionConfig));

  // Cache-friendly headers middleware
  server.use((req, res, next) => {
    // Add Vary header for compression
    res.set('Vary', 'Accept-Encoding');
    
    // Cache control for static assets
    if (req.url && /\.(js|css|png|jpg|jpeg|gif|ico|svg|woff2|ttf)$/.test(req.url)) {
      // Static assets: cache for 1 year
      res.set('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (req.url && req.url.startsWith('/api')) {
      // API routes: no cache by default
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      res.set('Surrogate-Control', 'no-store');
    } else {
      // HTML pages: cache for 5 minutes
      res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
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
      console.error(`Port ${port} is already in use`);
      process.exit(1);
    }
    console.error('Server error:', err);
    process.exit(1);
  });

  // Start server
  httpServer.listen(port, () => {
    console.log(`> Next.js server with Brotli compression running at http://${hostname}:${port}`);
    console.log(`  - Environment: ${dev ? 'development' : 'production'}`);
    console.log(`  - Brotli quality: ${compressionConfig.brotli.quality}`);
    console.log(`  - Gzip level: ${compressionConfig.gzip.level}`);
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
