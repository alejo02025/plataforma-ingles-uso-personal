import type { Metadata, Viewport } from 'next';
import './globals.css';
import '../styles/study-modules.css';
import { isPortuguese, appName, assetBase } from '@/lib/workspace';
const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
export const metadata: Metadata = {
  title: isPortuguese
    ? 'Português OS · O espaço da Jazmín'
    : 'English OS · Your English, every day',
  description: isPortuguese
    ? 'O espaço da Jazmín para ler, conversar e aprender português do Brasil.'
    : 'Your personal space for reading, practice, and progress in English.',
  applicationName: appName,
  manifest: `${base}/manifest.webmanifest`,
  icons: {
    icon: [
      {
        url: `${assetBase}/assets/app/${isPortuguese ? 'portuguese-os-v1' : 'english-os-v1'}.svg`,
        type: 'image/svg+xml',
        sizes: 'any',
      },
      {
        url: `${assetBase}/assets/app/${isPortuguese ? 'portuguese-' : ''}favicon-v1.png`,
        type: 'image/png',
        sizes: '32x32',
      },
    ],
    apple: [
      {
        url: `${assetBase}/assets/app/${isPortuguese ? 'portuguese-' : ''}apple-touch-icon-v1.png`,
        type: 'image/png',
        sizes: '180x180',
      },
    ],
  },
  appleWebApp: { capable: true, title: appName, statusBarStyle: 'default' },
};
export const viewport: Viewport = { themeColor: isPortuguese ? '#24845d' : '#16836b' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang={isPortuguese ? 'pt-BR' : 'en'}
      data-space={isPortuguese ? 'portuguese' : 'english'}
      data-study-language={isPortuguese ? 'pt' : 'en'}
    >
      <body>{children}</body>
    </html>
  );
}
