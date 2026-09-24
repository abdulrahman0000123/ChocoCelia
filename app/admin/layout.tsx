import '../globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = { robots: { index: false, follow: false, noarchive: true } };

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>ChocoCelia Admin Dashboard</title>
        <link rel="icon" href="/brand/icon-192.png" type="image/png" />
      </head>
      <body className="bg-gradient-to-br from-[#120704] via-[#1a0a06] to-[#0f0503] text-gray-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
