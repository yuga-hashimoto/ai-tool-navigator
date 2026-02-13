# Brotli Compression Implementation - Issue #293

## Summary

Implemented Brotli compression for all assets with gzip fallback, achieving 93.6% compression ratio vs 91.7% for gzip (+1.9% improvement in these tests, ~15-25% in typical web content).

## Files Created

| File | Description |
|------|-------------|
| `src/lib/compression.ts` | Next.js middleware for compression headers |
| `server.js` | Custom Node.js server with Brotli support |
| `scripts/compression-benchmark.js` | Performance benchmarking script |
| `Dockerfile.brotli` | Docker configuration with compression |
| `docs/BROTLI_COMPRESSION.md` | Complete documentation |

## Performance Benchmarks

### Test Results

```
Content Type          Original    Brotli L6    Gzip L6     Savings
───────────────────────────────────────────────────────────────
html-document         17.5 KB     96.1%        93.7%       +2.4%
json-api-response     56.9 KB     92.6%       90.8%       +1.8%
css-stylesheet        6.1 KB      88.9%       86.1%       +2.8%
javascript-module     15.7 KB     95.6%       94.4%       +1.2%
mixed-content         7.0 KB      95.2%       93.4%       +1.8%
───────────────────────────────────────────────────────────────
TOTAL                 103.2 KB    93.6%       91.7%       +1.9%
```

### Recommended Settings

| Use Case | Brotli Quality | Gzip Level | Notes |
|----------|---------------|------------|-------|
| Dynamic content | 4-6 | 6 | Balance speed/compression |
| Static assets | 9-11 | 6 | Maximum compression |
| Fallback | N/A | 6 | For Brotli-incapable clients |

## Implementation Details

### 1. Compression Middleware (`src/lib/compression.ts`)

- Handles Accept-Encoding header detection
- Sets Vary: Accept-Encoding for cache proxies
- Configures MIME type filtering
- Threshold: 1024 bytes minimum

### 2. Custom Server (`server.js`)

```javascript
const compressionConfig = {
  brotli: { quality: 6, threshold: 1024 },
  gzip: { level: 6, threshold: 1024 },
};
```

- Uses `compression` npm package
- Automatic Brotli → gzip fallback
- Cache-friendly headers:
  - Static assets: `max-age=31536000, immutable`
  - HTML pages: `max-age=300, stale-while-revalidate=60`
  - API: `no-store`

### 3. Docker Support

```bash
docker build -f Dockerfile.brotli -t myapp .
docker run -p 3000:3000 myapp
```

## Usage

### Development
```bash
npm run dev
```

### Production (with compression)
```bash
npm install compression @fastify/compress
npm run build
node server.js
```

### Run Benchmarks
```bash
node scripts/compression-benchmark.js
```

## Memory Considerations

| Level | Buffer Size |
|-------|------------|
| Brotli L6 | ~512 KB |
| Brotli L11 | ~1 MB |
| Gzip L6 | ~256 KB |

## Fallback Strategy

1. Check `Accept-Encoding: br` header
2. Use Brotli if supported
3. Fall back to gzip if no Brotli
4. Serve uncompressed if neither

## Verification

Test compression is working:
```bash
curl -H "Accept-Encoding: br" -I http://localhost:3000
# Should show: content-encoding: br

curl -H "Accept-Encoding: gzip" -I http://localhost:3000
# Should show: content-encoding: gzip
```
