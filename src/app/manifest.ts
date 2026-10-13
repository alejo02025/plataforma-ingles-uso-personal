import { isPortuguese, appName, assetBase } from '@/lib/workspace';
import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';
export default function manifest(): MetadataRoute.Manifest {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
  return {
    id: `${base}/`,
    name: appName,
    short_name: appName,
    description: isPortuguese
      ? 'Seu espaço pessoal para aprender português do Brasil.'
      : 'Your personal reading room and English practice notebook.',
    start_url: `${base}/`,
    scope: `${base}/`,
    display: 'standalone',
    lang: isPortuguese ? 'pt-BR' : 'en',
    background_color: '#fffaf3',
    theme_color: isPortuguese ? '#955168' : '#07856f',
    icons: [
      {
        src: `${assetBase}/assets/app/${isPortuguese ? 'portuguese-' : ''}icon-192-v1.png`,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: `${assetBase}/assets/app/${isPortuguese ? 'portuguese-' : ''}icon-512-v1.png`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: `${assetBase}/assets/app/${isPortuguese ? 'portuguese-' : ''}icon-512-v1.png`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
