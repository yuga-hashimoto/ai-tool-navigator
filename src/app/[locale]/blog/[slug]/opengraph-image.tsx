import { ImageResponse } from 'next/og';
import { getPostBySlug } from '@/lib/posts';

export const runtime = 'nodejs';

export const alt = 'AI Tool Navigator Blog';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  const post = getPostBySlug(slug, locale);

  if (!post) {
      return new ImageResponse(
        (
          <div
            style={{
              fontSize: 48,
              background: 'white',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Post not found
          </div>
        ),
        { ...size }
      );
  }

  const { metadata } = post;

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #18181b, #09090b)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          color: 'white',
          padding: '80px',
        }}
      >
        <div
          style={{
            fontSize: 20,
            color: '#a1a1aa',
            marginBottom: 20,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          Blog Post
        </div>

        <div
          style={{
            fontSize: 60,
            fontWeight: 'bold',
            marginBottom: 40,
            lineHeight: 1.1,
            color: 'white',
            maxWidth: '100%',
            // simple truncation logic if title is too long (basic handling)
            display: '-webkit-box',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {metadata.title}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ fontSize: 30, color: '#e4e4e7' }}>
            {metadata.author}
          </div>
          <div style={{ fontSize: 30, color: '#52525b' }}>•</div>
          <div style={{ fontSize: 30, color: '#a1a1aa' }}>
             {new Date(metadata.date).toLocaleDateString(locale === 'ja' ? 'ja-JP' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
             <div style={{ width: 40, height: 40, background: '#3b82f6', borderRadius: '50%' }} />
             <div style={{ fontSize: 24, fontWeight: 'bold' }}>AI Tool Navigator</div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
