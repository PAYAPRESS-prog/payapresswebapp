import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Generated OpenGraph / Twitter card image (1200×630) — Mr Busbar on the
// brand dark gradient with the product name and keyword tagline.
// Next.js auto-wires this file into the page metadata.
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Busbar Calculator — copper and aluminum busbar cost calculator';

export default async function OpengraphImage() {
  const png = await readFile(join(process.cwd(), 'public', 'mr-busbar.png'));
  const mascot = `data:image/png;base64,${png.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: 'linear-gradient(135deg, #060608 0%, #0d0e10 55%, #1a0f06 100%)',
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'system-ui',
          position: 'relative',
        }}
      >
        {/* Copper glow behind the mascot */}
        <div
          style={{
            position: 'absolute',
            right: 60,
            top: 40,
            width: 420,
            height: 550,
            background:
              'radial-gradient(closest-side, rgba(247,148,29,0.22) 0%, rgba(215,25,32,0.08) 60%, transparent 100%)',
            display: 'flex',
          }}
        />

        {/* Copy block */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginLeft: 84,
            maxWidth: 640,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 28,
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 12,
                background: '#22c55e',
                display: 'flex',
              }}
            />
            <div style={{ color: '#22c55e', fontSize: 26, fontWeight: 600, display: 'flex' }}>
              Live COMEX &amp; LME prices
            </div>
          </div>

          <div
            style={{
              color: '#f5f7fa',
              fontSize: 84,
              fontWeight: 700,
              lineHeight: 1.04,
              letterSpacing: -2,
              display: 'flex',
            }}
          >
            Busbar Calculator
          </div>

          <div
            style={{
              color: 'rgba(245,247,250,0.62)',
              fontSize: 32,
              marginTop: 26,
              lineHeight: 1.4,
              display: 'flex',
            }}
          >
            Size &amp; price copper and aluminum busbars in seconds — free.
          </div>

          <div
            style={{
              display: 'flex',
              marginTop: 44,
              padding: '16px 34px',
              borderRadius: 14,
              background: 'linear-gradient(90deg, #f7941d 0%, #d71920 100%)',
              color: '#ffffff',
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            calculator.payapress.com
          </div>
        </div>

        {/* Mr Busbar */}
        <img
          src={mascot}
          width={196}
          height={563}
          style={{ position: 'absolute', right: 170, top: 34, objectFit: 'contain' }}
          alt=""
        />
      </div>
    ),
    { ...size },
  );
}
