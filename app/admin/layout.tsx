import '../globals.css';
import type { Metadata } from 'next';
import { AdminProviders } from './AdminProviders';

export const metadata: Metadata = { robots: { index: false, follow: false, noarchive: true } };

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preload" href="/fonts/rpt-regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <title>Choco Celia Admin Dashboard</title>
        <link rel="icon" href="/brand/icon-192.png" type="image/png" />
      </head>
      <body className="bg-background text-foreground min-h-screen antialiased">
        <AdminProviders>{children}</AdminProviders>
      </body>
    </html>
  );
}
