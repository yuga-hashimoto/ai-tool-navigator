import { NextRequest, NextResponse } from 'next/server';
import { getAllVideos, saveVideo } from '@/lib/videos';

export async function GET() {
  const videos = getAllVideos();
  return NextResponse.json(videos);
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { slug, metadata, content } = data;

    if (!slug || !metadata) {
      return NextResponse.json({ error: 'Missing slug or metadata' }, { status: 400 });
    }

    saveVideo(slug, metadata, content);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to create video:', error);
    return NextResponse.json({ error: 'Failed to create video' }, { status: 500 });
  }
}
