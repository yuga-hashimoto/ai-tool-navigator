import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'AI Tool Navigator';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const title = 'AI Tool Navigator';
  const description = locale === 'ja'
    ? '最高のAIツールを発見・比較しましょう'
    : 'Discover and compare the best AI tools for your workflow';

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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
            }}
        >
             {/* Logo or Icon could go here */}
            <div
                style={{
                    fontSize: 60,
                    fontWeight: 'bold',
                    background: 'linear-gradient(to right, #3b82f6, #a855f7)',
                    backgroundClip: 'text',
                    color: 'transparent',
                }}
            >
            {title}
            </div>
        </div>

        <div style={{ fontSize: 30, color: '#e4e4e7', maxWidth: '80%', lineHeight: 1.5 }}>
          {description}
        </div>

        <div style={{
            marginTop: '40px',
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '10px 20px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
        }}>
             <div style={{ fontSize: 20, color: '#a1a1aa' }}>ai-tool-navigator.vercel.app</div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
