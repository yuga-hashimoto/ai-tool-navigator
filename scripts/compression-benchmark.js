/**
 * Brotli Compression Performance Benchmark
 * 
 * Benchmarks Brotli vs gzip compression for different content types.
 * Uses realistic content samples to demonstrate actual compression ratios.
 * 
 * Usage: node scripts/compression-benchmark.js
 */

const zlib = require('zlib');
const fs = require('fs');

const BROTLI_QUALITY_LEVELS = [1, 4, 6, 9, 11];
const GZIP_LEVELS = [1, 4, 6, 9];

/**
 * Generate realistic test data
 */
function generateTestData() {
  // Generate diverse, realistic content
  const samples = {
    'html-document': generateHTML(50),
    'json-api-response': generateJSON(100),
    'css-stylesheet': generateCSS(30),
    'javascript-module': generateJS(25),
    'mixed-content': generateMixed(20),
  };
  
  const result = {};
  for (const [name, content] of Object.entries(samples)) {
    result[name] = Buffer.from(content, 'utf-8');
  }
  return result;
}

function generateHTML(paragraphs) {
  const sections = [];
  for (let i = 0; i < paragraphs; i++) {
    sections.push(`<section>
  <h2>Section ${i + 1}</h2>
  <p>This is paragraph ${i + 1} with some meaningful content about web development, compression techniques, and performance optimization. It contains various words and sentences.</p>
  <ul>
    <li>List item A for section ${i + 1}</li>
    <li>List item B for section ${i + 1}</li>
    <li>List item C for section ${i + 1}</li>
  </ul>
</section>`);
  }
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Document</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header><h1>Web Page Title</h1></header>
  <main>${sections.join('\n')}</main>
  <footer><p>Footer content</p></footer>
</body>
</html>`;
}

function generateJSON(items) {
  const data = {
    status: 'success',
    total: items * 100,
    page: 1,
    perPage: items,
    data: []
  };
  for (let i = 0; i < items; i++) {
    data.data.push({
      id: i + 1,
      uuid: `550e8400-e29b-${String(i).padStart(4, '0')}-4d3b-${Math.random().toString(16).slice(2, 14)}`,
      name: `Item ${i + 1}`,
      type: ['article', 'video', 'podcast'][i % 3],
      metadata: {
        views: Math.floor(Math.random() * 100000),
        likes: Math.floor(Math.random() * 5000),
        shares: Math.floor(Math.random() * 500),
        createdAt: new Date(Date.now() - i * 86400000).toISOString(),
      },
      tags: [`tag${i % 10}`, `category${i % 5}`, `topic${i % 8}`],
      content: `This is the content body for item ${i + 1}. It contains diverse text with various words and phrases that provide realistic compression scenarios. The text includes numbers like ${i * 123.456} and special characters.`
    });
  }
  return JSON.stringify(data, null, 2);
}

function generateCSS(rules) {
  const css = ['/* Main stylesheet */', 'body { font-family: system-ui, sans-serif; margin: 0; }'];
  const colors = ['#007bff', '#6c757d', '#28a745', '#dc3545', '#ffc107', '#17a2b8'];
  const sizes = ['12px', '14px', '16px', '18px', '20px', '24px', '32px'];
  
  for (let i = 0; i < rules; i++) {
    const className = `class-${i}`;
    css.push(`.${className} {
  display: ${i % 2 === 0 ? 'block' : 'inline-block'};
  padding: ${sizes[i % sizes.length]};
  margin: ${sizes[(i + 2) % sizes.length]};
  background-color: ${colors[i % colors.length]};
  color: ${colors[(i + 2) % colors.length]};
  border-radius: ${(i + 1) * 2}px;
  font-size: ${sizes[(i + 1) % sizes.length]};
  box-shadow: 0 ${i % 3 + 1}px ${(i + 1) * 2}px rgba(0,0,0,0.1);
}`);
  }
  
  // Add responsive rules
  css.push('@media (max-width: 768px) { .container { width: 100%; padding: 10px; } }');
  css.push('@media (min-width: 769px) { .container { width: 750px; margin: 0 auto; } }');
  css.push('@media (min-width: 1200px) { .container { width: 1170px; } }');
  
  return css.join('\n');
}

function generateJS(functions) {
  const js = ['// JavaScript module', '"use strict";', '', 'const CONFIG = { debug: false, apiUrl: "/api/v1" };'];
  
  for (let i = 0; i < functions; i++) {
    const fnName = `processData${i + 1}`;
    js.push(`
function ${fnName}(input) {
  // Function ${i + 1} processing data
  if (!input || typeof input !== 'object') {
    throw new Error('Invalid input provided');
  }
  
  const result = {
    id: input.id,
    timestamp: Date.now(),
    processed: true,
    items: input.items || []
  };
  
  // Process each item with various operations
  result.items = result.items.map(item => ({
    ...item,
    processed: true,
    index: item.index || 0,
    value: item.value * Math.random(),
    metadata: {
      source: 'processor',
      version: '1.0.0',
      extra: 'additional data here'
    }
  }));
  
  return result;
}`);
  }
  
  // Add utility functions
  js.push(`
function debounce(fn, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

function throttle(fn, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function generateId() {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}`);
  
  return js.join('\n');
}

function generateMixed(sections) {
  const parts = [];
  for (let i = 0; i < sections; i++) {
    parts.push(`## Section ${i + 1}

This is a section of mixed content with **bold text** and *italic text*.

- First item in the list
- Second item with \`code\` inline
- Third item with [a link](https://example.com)

\`\`\`javascript
function example() {
  return "Hello World";
}
\`\`\`

| Column A | Column B |
|----------|----------|
| Cell ${i + 1}A | Cell ${i + 1}B |
| Row 2 | Data 2 |
`);
  }
  return parts.join('\n---\n');
}

async function compressBrotli(data, quality = 6) {
  return new Promise((resolve, reject) => {
    const buffers = [];
    const brotli = zlib.createBrotliCompress({
      params: {
        [zlib.constants.BROTLI_PARAM_QUALITY]: quality,
        [zlib.constants.BROTLI_PARAM_SIZE_HINT]: data.length,
      },
    });
    brotli.on('data', chunk => buffers.push(chunk));
    brotli.on('end', () => resolve(Buffer.concat(buffers)));
    brotli.on('error', reject);
    brotli.end(data);
  });
}

async function compressGzip(data, level = 6) {
  return new Promise((resolve, reject) => {
    zlib.gzip(data, { level }, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function calculateRatio(original, compressed) {
  if (compressed >= original) return 0;
  const ratio = (1 - compressed / original) * 100;
  return Math.round(ratio * 10) / 10;
}

async function runBenchmarks() {
  console.log('═'.repeat(80));
  console.log('       BROTLI vs GZIP COMPRESSION PERFORMANCE BENCHMARK');
  console.log('═'.repeat(80));
  console.log();
  console.log(`Node.js: ${process.version} | Date: ${new Date().toISOString().split('T')[0]}`);
  console.log();
  
  const testSamples = generateTestData();
  const results = {};
  
  for (const [name, data] of Object.entries(testSamples)) {
    const [brotliL6, brotliL9, brotliL11] = await Promise.all([
      compressBrotli(data, 6),
      compressBrotli(data, 9),
      compressBrotli(data, 11)
    ]);
    const [gzipL6, gzipL9] = await Promise.all([
      compressGzip(data, 6),
      compressGzip(data, 9)
    ]);
    
    results[name] = {
      original: data.length,
      brotli: {
        level6: { size: brotliL6.length, ratio: calculateRatio(data.length, brotliL6.length) },
        level9: { size: brotliL9.length, ratio: calculateRatio(data.length, brotliL9.length) },
        level11: { size: brotliL11.length, ratio: calculateRatio(data.length, brotliL11.length) },
      },
      gzip: {
        level6: { size: gzipL6.length, ratio: calculateRatio(data.length, gzipL6.length) },
        level9: { size: gzipL9.length, ratio: calculateRatio(data.length, gzipL9.length) },
      },
    };
  }
  
  // Print results
  console.log('─'.repeat(80));
  for (const [name, data] of Object.entries(results)) {
    console.log(`\n📄 ${name} (${formatBytes(data.original)})`);
    console.log(`   Brotli L6: ${data.brotli.level6.ratio}% (${formatBytes(data.brotli.level6.size)})  |  Gzip L6: ${data.gzip.level6.ratio}% (${formatBytes(data.gzip.level6.size)})`);
    console.log(`   Brotli L9: ${data.brotli.level9.ratio}% (${formatBytes(data.brotli.level9.size)})  |  Gzip L9: ${data.gzip.level9.ratio}% (${formatBytes(data.gzip.level9.size)})`);
    console.log(`   Brotli L11: ${data.brotli.level11.ratio}% (${formatBytes(data.brotli.level11.size)})`);
  }
  
  // Summary
  let totOrig = 0, totBrotli = 0, totGzip = 0;
  for (const [name, data] of Object.entries(results)) {
    totOrig += data.original;
    totBrotli += data.brotli.level6.size;
    totGzip += data.gzip.level6.size;
  }
  
  const brotliRatio = calculateRatio(totOrig, totBrotli);
  const gzipRatio = calculateRatio(totOrig, totGzip);
  const advantage = (brotliRatio - gzipRatio).toFixed(1);
  
  console.log('\n' + '═'.repeat(80));
  console.log('                         SUMMARY');
  console.log('═'.repeat(80));
  console.log();
  console.log(`Total Size:  ${formatBytes(totOrig)}`);
  console.log(`Brotli L6:   ${formatBytes(totBrotli)} (${brotliRatio}% reduction)  - Recommended for dynamic content`);
  console.log(`Gzip L6:     ${formatBytes(totGzip)} (${gzipRatio}% reduction)  - Fallback for older clients`);
  console.log(`Savings:     +${advantage}% bandwidth saved with Brotli`);
  console.log();
  console.log('─'.repeat(80));
  console.log('📊 RECOMMENDATIONS');
  console.log('─'.repeat(80));
  console.log();
  console.log('1. Use Brotli quality 6 for balanced performance');
  console.log('2. Brotli provides ~15-25% better compression than gzip');
  console.log('3. Static assets: Brotli L9 | Dynamic content: Brotli L4-6');
  console.log('4. Fallback to gzip for clients without Brotli support');
  console.log('5. Cache static assets with: Cache-Control: max-age=31536000, immutable');
  console.log('6. Threshold: Compress only responses larger than 1 KB');
  console.log();
  
  // Save results
  fs.writeFileSync('compression-results.json', JSON.stringify(results, null, 2));
  console.log(`✅ Results saved to compression-results.json`);
}

runBenchmarks().catch(console.error);
