#!/usr/bin/env node

/**
 * CDN Upload Script
 * 
 * Uploads static assets to Cloudflare R2 for CDN delivery.
 * 
 * Usage:
 *   node scripts/cdn-upload.js [options]
 * 
 * Options:
 *   --dry-run    Show what would be uploaded without uploading
 *   --force      Upload all files, skip etag check
 * 
 * Environment Variables:
 *   R2_ACCESS_KEY_ID      Cloudflare R2 Access Key
 *   R2_SECRET_ACCESS_KEY  Cloudflare R2 Secret Key
 *   R2_BUCKET_NAME       R2 Bucket Name
 *   R2_ACCOUNT_ID        Cloudflare Account ID
 *   CDN_URL              Custom CDN URL (optional)
 *   CDN_ENABLED          Set to 'true' to enable CDN
 */

import { S3Client, PutObjectCommand, ListObjectsV2Command, HeadObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative } from 'path';

const DRY_RUN = process.argv.includes('--dry-run');
const FORCE = process.argv.includes('--force');

// Configuration
const config = {
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  bucket: process.env.R2_BUCKET_NAME || 'ai-tool-navigator-assets',
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
};

const DIST_DIR = join(process.cwd(), '.next');
const PUBLIC_DIR = join(process.cwd(), 'public');

// Initialize S3 client for R2
let s3Client: S3Client | null = null;

function getS3Client(): S3Client | null {
  if (!config.accessKeyId || !config.secretAccessKey) {
    console.warn('⚠️  R2 credentials not configured. CDN upload disabled.');
    console.warn('   Set R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY in .env');
    return null;
  }

  if (!s3Client) {
    s3Client = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  return s3Client;
}

// Get all files from a directory recursively
function getFiles(dir: string, baseDir: string): string[] {
  const files: string[] = [];
  
  if (!existsSync(dir)) {
    return files;
  }

  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getFiles(fullPath, baseDir));
    } else {
      files.push(relative(baseDir, fullPath));
    }
  }
  
  return files;
}

// Check if file exists in R2 (for etag comparison)
async function fileExistsInR2(key: string): Promise<boolean> {
  const client = getS3Client();
  if (!client) return false;

  try {
    await client.send(new HeadObjectCommand({
      Bucket: config.bucket,
      Key: key,
    }));
    return true;
  } catch {
    return false;
  }
}

// Upload a single file to R2
async function uploadFile(localPath: string, key: string): Promise<{ success: boolean; error?: string }> {
  const client = getS3Client();
  if (!client) {
    return { success: false, error: 'R2 client not initialized' };
  }

  if (DRY_RUN) {
    console.log(`📤 [DRY RUN] Would upload: ${localPath} -> ${key}`);
    return { success: true };
  }

  try {
    const fileContent = readFileSync(localPath);
    
    // Determine content type based on file extension
    const contentType = getContentType(key);
    
    const command = new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: fileContent,
      ContentType: contentType,
      // Cache control for static assets
      CacheControl: getCacheControl(key),
    });

    await client.send(command);
    
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

// Determine content type based on file extension
function getContentType(key: string): string {
  const ext = key.split('.').pop()?.toLowerCase();
  
  const types: Record<string, string> = {
    html: 'text/html',
    css: 'text/css',
    js: 'application/javascript',
    mjs: 'application/javascript',
    json: 'application/json',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    webp: 'image/webp',
    ico: 'image/x-icon',
   woff: 'font/woff',
    woff2: 'font/woff2',
    ttf: 'font/ttf',
    eot: 'application/vnd.ms-fontobject',
    otf: 'font/otf',
  };
  
  return types[ext || ''] || 'application/octet-stream';
}

// Get cache control header based on file type
function getCacheControl(key: string): string {
  // Immutable assets (hashed) can be cached forever
  if (key.includes('._') || /\.[a-f0-9]{8,}\./.test(key)) {
    return 'public, max-age=31536000, immutable';
  }
  
  // Static assets
  if (key.includes('/static/')) {
    return 'public, max-age=2592000'; // 30 days
  }
  
  // Default
  return 'public, max-age=86400'; // 1 day
}

// Main upload function
async function main() {
  console.log('🚀 CDN Upload Script');
  console.log('=====================\n');
  
  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No files will be uploaded\n');
  }

  const client = getS3Client();
  if (!client) {
    console.log('\nℹ️  To enable CDN uploads, configure R2 credentials in .env:');
    console.log('   R2_ACCESS_KEY_ID=your_access_key');
    console.log('   R2_SECRET_ACCESS_KEY=your_secret_key');
    console.log('   R2_BUCKET_NAME=your_bucket_name');
    console.log('   R2_ACCOUNT_ID=your_account_id');
    console.log('   CDN_URL=your_custom_domain (optional)');
    return;
  }

  console.log(`📦 Target bucket: ${config.bucket}\n`);

  // Collect files to upload
  const staticFiles = getFiles(join(DIST_DIR, 'static'), DIST_DIR);
  const publicFiles = getFiles(PUBLIC_DIR, PUBLIC_DIR);
  
  console.log(`📁 Found ${staticFiles.length} static files in .next/static`);
  console.log(`📁 Found ${publicFiles.length} files in public/\n`);

  // Upload static files from .next/static
  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  console.log('📤 Uploading static files...');
  
  for (const file of staticFiles) {
    const localPath = join(DIST_DIR, 'static', file);
    const key = `_next/static/${file}`;
    
    // Skip if file already exists and not forcing
    if (!FORCE && await fileExistsInR2(key)) {
      skipped++;
      continue;
    }
    
    const result = await uploadFile(localPath, key);
    
    if (result.success) {
      uploaded++;
      if (!DRY_RUN) {
        console.log(`   ✅ ${key}`);
      }
    } else {
      failed++;
      console.log(`   ❌ ${key}: ${result.error}`);
    }
  }

  // Upload public files
  console.log('\n📤 Uploading public files...');
  
  for (const file of publicFiles) {
    const localPath = join(PUBLIC_DIR, file);
    const key = file;
    
    // Skip if file already exists and not forcing
    if (!FORCE && await fileExistsInR2(key)) {
      skipped++;
      continue;
    }
    
    const result = await uploadFile(localPath, key);
    
    if (result.success) {
      uploaded++;
      if (!DRY_RUN) {
        console.log(`   ✅ ${key}`);
      }
    } else {
      failed++;
      console.log(`   ❌ ${key}: ${result.error}`);
    }
  }

  // Summary
  console.log('\n📊 Summary');
  console.log('==========');
  console.log(`   ✅ Uploaded: ${uploaded}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);
  
  if (DRY_RUN) {
    console.log('\n🔍 This was a dry run. Run without --dry-run to actually upload.');
  }
}

main().catch(console.error);
