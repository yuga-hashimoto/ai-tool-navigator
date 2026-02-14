import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

// Limit file size to 100MB for safety
const MAX_FILE_SIZE = 100 * 1024 * 1024;
const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only MP4, WebM, and Ogg are allowed.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 100MB limit.' }, { status: 400 });
    }

    const fileExt = path.extname(file.name);
    // Sanitize extension
    if (!['.mp4', '.webm', '.ogg'].includes(fileExt.toLowerCase())) {
         return NextResponse.json({ error: 'Invalid file extension.' }, { status: 400 });
    }

    const fileName = `${randomUUID()}${fileExt}`;
    const uploadDir = path.join(process.cwd(), 'public/uploads/videos');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);

    // Stream to file
    const fileStream = fs.createWriteStream(filePath);
    // Convert Web Stream to Node Stream
    // @ts-ignore
    const readable = Readable.fromWeb(file.stream());
    await pipeline(readable, fileStream);

    const publicUrl = `/uploads/videos/${fileName}`;

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
