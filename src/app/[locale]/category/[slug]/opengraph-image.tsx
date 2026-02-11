import { ImageResponse } from 'next/og';
import { getTranslations } from 'next-intl/server';
import { CATEGORY_MAPPINGS } from '@/lib/categories';

export const runtime = 'nodejs';

export const alt = 'AI Tool Category';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;

  if (!Object.keys(CATEGORY_MAPPINGS).includes(slug)) {
      return new ImageResponse(
        (
            <div style={{ fontSize: 48, background: 'white', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Category Not Found
            </div>
        ), { ...size }
      );
  }

  const t = await getTranslations({ locale, namespace: 'CategoryPage' });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const title = t(`${slug}_title` as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const description = t(`${slug}_description` as any);

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
        }}
      >
        <div
            style={{
                fontSize: 24,
                color: '#3b82f6',
                marginBottom: 20,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
            }}
        >
            AI Tool Category
        </div>

        <div
          style={{
            fontSize: 80,
            fontWeight: 'bold',
            marginBottom: 30,
            background: 'linear-gradient(to right, #fff, #94a3b8)',
            backgroundClip: 'text',
            color: 'transparent',
            lineHeight: 1.1,
          }}
        >
          {title}
        </div>

        <div style={{ fontSize: 32, color: '#e4e4e7', maxWidth: '80%', lineHeight: 1.4 }}>
          {description}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
