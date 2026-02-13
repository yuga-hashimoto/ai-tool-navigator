# Brotli Compression Implementation

This document describes the Brotli compression implementation for the Next.js application.

## Overview

Brotli compression provides 15-25% better compression ratios compared to gzip, reducing bandwidth usage and improving page load times.

## Files

| File | Description |
|------|-------------|
| `src/lib/compression.ts` | Next.js middleware for compression headers |
| `server.js` | Custom Node.js server with Brotli support |
| `scripts/compression-benchmark.js` | Performance benchmarking script |
| `Dockerfile.brotli` | Docker configuration with compression |

## Configuration

### Compression Settings

```typescript
const COMPRESSION_CONFIG = {
  brotliQuality: 6,       // Brotli quality (1-11)
  gzipLevel: 6,           // Gzip level (1-9)
  threshold: 1024,        // Minimum bytes to compress
  mimeTypes: [            // Types to compress
    'text/html',
    'text/css',
    'text/plain',
    'application/javascript',
    'application/json',
    'image/svg+xml',
  ],
  excludedMimeTypes: [    // Types to skip
    'image/jpeg',
    'image/png',
    'image/webp',
  ],
};
```

### Quality Levels

| Level | Use Case | Compression | Speed |
|-------|----------|-------------|-------|
| 1-4 | Dynamic content | Good | Fast |
| 6 | Balanced | Better | Moderate |
| 9-11 | Static assets | Best | Slow |

## Installation

```bash
# Install dependencies
npm install compression @fastify/compress

# Run benchmarks
node scripts/compression-benchmark.js
```

## Usage

### Development
```bash
npm run dev
```

### Production (with custom server)
```bash
npm run build
node server.js
```

### Docker
```bash
docker build -f Dockerfile.brotli -t myapp .
docker run -p 3000:3000 myapp
```

## Performance Benchmarks

Typical compression ratios for web content:

| Content Type | Original | Brotli | Gzip | Savings |
|-------------|----------|--------|------|---------|
| HTML | 50 KB | 10 KB (80%) | 12 KB (76%) | +4% |
| JSON API | 100 KB | 22 KB (78%) | 25 KB (75%) | +3% |
| CSS | 200 KB | 32 KB (84%) | 38 KB (81%) | +3% |
| JavaScript | 500 KB | 95 KB (81%) | 110 KB (78%) | +3% |

### Memory Usage

| Configuration | Memory Overhead |
|--------------|-----------------|
| Gzip level 6 | ~256 KB buffer |
| Brotli level 6 | ~512 KB buffer |
| Brotli level 11 | ~1 MB buffer |

## Cache-Friendly Headers

The implementation sets appropriate cache headers:

```nginx
# Static assets (CSS, JS, images)
Cache-Control: public, max-age=31536000, immutable

# API responses
Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate

# HTML pages
Cache-Control: public, max-age=300, stale-while-revalidate=60

# Always vary on Accept-Encoding
Vary: Accept-Encoding
```

## Fallback Strategy

1. Check if client supports `Accept-Encoding: br`
2. If Brotli supported → use Brotli compression
3. If no Brotli but gzip supported → use gzip fallback
4. If no compression support → serve uncompressed

## Monitoring

### Key Metrics

- **Compression Ratio**: Percentage reduction in response size
- **Throughput**: MB/s compression speed
- **Latency**: Additional time added to requests
- **Memory**: Buffer size for compression

### Log Output

```
> Next.js server with Brotli compression running at http://localhost:3000
>   - Environment: production
>   - Brotli quality: 6
>   - Gzip level: 6
```

## Nginx Configuration (Alternative)

If using Nginx as a reverse proxy:

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;

    # Brotli configuration
    brotli on;
    brotli_comp_level 6;
    brotli_types text/html text/css application/javascript 
                application/json image/svg+xml;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Accept-Encoding "";
    }
}
```

## Troubleshooting

### Brotli not working
1. Verify `Accept-Encoding: br` header is sent by client
2. Check compression middleware is loaded
3. Verify `compression` package is installed

### Large files not compressing
1. Check `threshold` setting (default 1024 bytes)
2. Verify MIME type is in `mimeTypes` list
3. Check response doesn't already have `content-encoding` header

### High CPU usage
1. Reduce `brotliQuality` from 6 to 4
2. Increase `threshold` to compress fewer small files
3. Consider using gzip for high-traffic endpoints
