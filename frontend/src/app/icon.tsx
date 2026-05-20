import { ImageResponse } from 'next/og';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          background: '#060608',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 96,
        }}
      >
        {/* Outer copper ring */}
        <div
          style={{
            width: 440,
            height: 440,
            borderRadius: 80,
            background: 'linear-gradient(135deg, #b87333 0%, #cd7f32 40%, #e8a855 65%, #cd7f32 85%, #9a5e28 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Inner dark surface */}
          <div
            style={{
              width: 368,
              height: 368,
              borderRadius: 64,
              background: '#0c0c0f',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            {/* Busbar cross-section stripes */}
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                style={{
                  width: 200,
                  height: 28,
                  borderRadius: 6,
                  background: `linear-gradient(90deg, #9a5e28, #cd7f32, #f5d78e, #cd7f32, #9a5e28)`,
                  opacity: 1 - i * 0.15,
                }}
              />
            ))}
            {/* P letter mark */}
            <div
              style={{
                marginTop: 16,
                fontSize: 72,
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
