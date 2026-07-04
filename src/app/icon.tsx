import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import { join } from 'path';

// App icon — Mr Busbar on the brand red→orange gradient (Figma Start page).
export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default async function Icon() {
  const png = await readFile(join(process.cwd(), 'public', 'mr-busbar.png'));
  const mascot = `data:image/png;base64,${png.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 96,
          backgroundImage:
            'radial-gradient(circle at 50% 115%, #f9a63a 0%, #f7941d 45%, #e01b22 85%, #d71920 100%)',
        }}
      >
        <img
          src={mascot}
          width={165}
          height={471}
          style={{ objectFit: 'contain', marginTop: 14 }}
          alt=""
        />
      </div>
    ),
    { ...size },
  );
}
