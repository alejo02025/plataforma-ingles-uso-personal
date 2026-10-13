import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'English OS · Tu inglés, cada día',
  description: 'Tu espacio personal de lectura, práctica y progreso en inglés.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <body>{children}</body>
    </html>
  );
}
