import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';
export default function manifest(): MetadataRoute.Manifest {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
  return {
    id: `${base}/`,
    name: 'English OS',
    short_name: 'English OS',
    description: 'Your personal reading room and English practice notebook.',
    start_url: `${base}/`,
    scope: `${base}/`,
    display: 'standalone',
    lang: 'en',
    background_color: '#fffaf3',
    theme_color: '#07856f',
    icons: [
      {
        src: `${base}/assets/app/icon-192-v1.png`,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: `${base}/assets/app/icon-512-v1.png`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: `${base}/assets/app/icon-512-v1.png`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
