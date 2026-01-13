import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import ClientLayout from "./components/ClientLayout";

const cairo = Cairo({
  subsets: ["latin", "arabic"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "CHOCO-CELIA | Premium Handmade Chocolates",
  description: "Where Every Bite Melts Your Heart. Discover our exquisite collection of handmade chocolates.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <style dangerouslySetInnerHTML={{
          __html: `
            body { 
              margin: 0; 
              padding: 0; 
              overflow-x: hidden;
            }
            /* Prevent content flash - hide everything initially */
            body > div:not([class*="preloader"]) {
              opacity: 0;
            }
          `
        }} />
      </head>
      <body
        className={`${cairo.variable} antialiased min-h-screen flex flex-col font-cairo`}
      >
        <ClientLayout>
          {children}
        </ClientLayout>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
