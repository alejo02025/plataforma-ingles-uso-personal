import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';

import '../styles/study-modules.css';
import '../styles/lingua.css';
import { isPortuguese, appName, assetBase } from '@/lib/workspace';
const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
const studyFont = localFont({
  src: '../../public/assets/fonts/InterVariable.woff2',
  variable: '--font-study',
  weight: '100 900',
  display: 'swap',
});
export const metadata: Metadata = {
  title: isPortuguese
    ? 'lingua · Português brasileiro'
    : 'lingua · English, every day',
  description: isPortuguese
    ? 'Seu espaço pessoal para ler, praticar e aprender português do Brasil.'
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
export const viewport: Viewport = { themeColor: isPortuguese ? '#7652a6' : '#167568' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      className={studyFont.variable}
      lang={isPortuguese ? 'pt-BR' : 'en'}
      data-space={isPortuguese ? 'portuguese' : 'english'}
      data-study-language={isPortuguese ? 'pt' : 'en'}
    >
      <body>

        {children}
      </body>
    </html>
  );
}
