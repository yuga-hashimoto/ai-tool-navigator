import { ImageResponse } from 'next/og';
import { getToolBySlug } from '@/lib/tools';

export const runtime = 'nodejs';

export const alt = 'AI Tool Details';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  const tool = await getToolBySlug(slug, locale);

  if (!tool) {
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
          Tool not found
        </div>
      ),
      { ...size }
    );
  }

  const { metadata } = tool;

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #18181b, #09090b)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          color: 'white',
          padding: '40px',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <div
            style={{
                position: 'absolute',
                top: 40,
                left: 40,
                fontSize: 24,
                color: '#a1a1aa',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
            }}
        >
            <span style={{ color: '#3b82f6' }}>AI Tool Navigator</span>
             <span>/</span>
            <span>{metadata.category}</span>
        </div>

        <div
          style={{
            fontSize: 80,
            fontWeight: 'bold',
            marginBottom: 20,
            background: 'linear-gradient(to right, #fff, #a1a1aa)',
            backgroundClip: 'text',
            color: 'transparent',
            lineHeight: 1.1,
          }}
        >
          {metadata.title}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: 20 }}>
            {/* Simple star representation since we can't easily loop in JSX inside ImageResponse without creating an array */}
             <div style={{ display: 'flex' }}>
              {Array.from({ length: 5 }).map((_, i) => {
                  const rating = metadata.rating;
                  const is10PointScale = rating > 5;
                  const normalizedRating = is10PointScale ? rating / 2 : rating;
                  // Use partial stars logic?
                  // Math.round logic matches what I did in components for full stars.
                  const isFilled = i < Math.round(normalizedRating);
                  return (
                    <div key={i} style={{ fontSize: 40, color: isFilled ? '#facc15' : '#52525b' }}>★</div>
                  );
              })}
            </div>
            <div style={{ fontSize: 30, color: '#e4e4e7', marginLeft: 10 }}>{metadata.rating}/{metadata.rating > 5 ? '10' : '5'}</div>
        </div>

         <div style={{ fontSize: 30, color: '#d4d4d8', maxWidth: '80%', marginTop: 30, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {metadata.description}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
