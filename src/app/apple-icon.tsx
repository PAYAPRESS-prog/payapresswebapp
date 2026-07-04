import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Apple touch icon — Mr Busbar on the brand gradient. iOS masks its own
// corner radius, so this renders a full-bleed square.
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default async function AppleIcon() {
  const png = await readFile(join(process.cwd(), 'public', 'mr-busbar.png'));
  const mascot = `data:image/png;base64,${png.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage:
            'radial-gradient(circle at 50% 115%, #f9a63a 0%, #f7941d 45%, #e01b22 85%, #d71920 100%)',
        }}
      >
        <img
          src={mascot}
          width={58}
          height={166}
          style={{ objectFit: 'contain', marginTop: 6 }}
          alt=""
        />
      </div>
    ),
    { ...size },
  );
}
