import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'English OS · Your English, every day',
  description: 'Your personal space for reading, practice, and progress in English.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
