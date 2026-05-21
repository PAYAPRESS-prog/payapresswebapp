import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: '#060608',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 156,
            height: 156,
            borderRadius: 32,
            background: 'linear-gradient(135deg, #b87333 0%, #cd7f32 40%, #e8a855 65%, #cd7f32 85%, #9a5e28 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 22,
              background: '#0c0c0f',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 3,
            }}
          >
            {[0, 1, 2].map(i => (
              <div
                key={i}
                style={{
                  width: 68,
                  height: 10,
                  borderRadius: 3,
                  background: 'linear-gradient(90deg, #9a5e28, #cd7f32, #f5d78e, #cd7f32, #9a5e28)',
                  opacity: 1 - i * 0.18,
                }}
              />
            ))}
            <div
              style={{
                marginTop: 6,
                fontSize: 28,
                fontWeight: 900,
                color: '#cd7f32',
                fontFamily: 'system-ui',
                letterSpacing: '-0.04em',
                lineHeight: 1,
              }}
            >
              PP
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
