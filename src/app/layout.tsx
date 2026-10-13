import type { Metadata, Viewport } from 'next';
import './globals.css';
const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
export const metadata: Metadata = {
  title: 'English OS · Your English, every day',
  description: 'Your personal space for reading, practice, and progress in English.',
  applicationName: 'English OS',
  manifest: `${base}/manifest.webmanifest`,
  icons: {
    icon: [
      { url: `${base}/assets/app/english-os-v1.svg`, type: 'image/svg+xml', sizes: 'any' },
      { url: `${base}/assets/app/favicon-v1.png`, type: 'image/png', sizes: '32x32' },
    ],
    apple: [
      { url: `${base}/assets/app/apple-touch-icon-v1.png`, type: 'image/png', sizes: '180x180' },
    ],
  },
  appleWebApp: { capable: true, title: 'English OS', statusBarStyle: 'default' },
};
export const viewport: Viewport = { themeColor: '#07856f' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
