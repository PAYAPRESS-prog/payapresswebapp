import { ImageResponse } from 'next/og';

// Generated OpenGraph / Twitter card image (1200×630) — replaces the missing
// static /og-image.png. Next.js auto-wires this file into the page metadata.
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Busbar Calculator — copper and aluminum busbar cost calculator';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: 'linear-gradient(135deg, #060608 0%, #0c0c0f 55%, #1a0f06 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui',
        }}
      >
        {/* Busbar cross-section stripes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 40 }}>
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              style={{
                width: 320,
                height: 36,
                borderRadius: 8,
                background: 'linear-gradient(90deg, #9a5e28, #cd7f32, #f5d78e, #cd7f32, #9a5e28)',
                opacity: 1 - i * 0.15,
              }}
            />
          ))}
        </div>
        <div
          style={{
            fontSize: 68,
            fontWeight: 900,
            color: '#f5f7fa',
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          Busbar Calculator
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 30,
            fontWeight: 500,
            color: '#cd7f32',
            letterSpacing: '0.01em',
          }}
        >
          Live COMEX copper &amp; aluminum pricing · 17 currencies
        </div>
      </div>
    ),
    { ...size }
  );
}
