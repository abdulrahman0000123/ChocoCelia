import type { Metadata } from "next";
import { Noto_Sans_Arabic, Playfair_Display } from "next/font/google";
import "../globals.css";
import { Analytics } from "@vercel/analytics/next";
import ClientLayout from "../components/ClientLayout";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getSettings } from "@/app/lib/products";
import { QuickContactMenu } from "@/app/components/QuickContactMenu";
import { AnalyticsProvider } from "@/app/components/analytics/AnalyticsProvider";
import { OrganizationSchema } from "@/app/components/schemas/OrganizationSchema";
import { PromoBanner } from "@/app/components/PromoBanner";
import { prisma } from "@/app/lib/db";
import { getSiteUrl } from "@/app/lib/productImages";

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["latin", "arabic"],
  variable: "--font-noto-arabic",
  weight: ["400", "500", "600", "700"],
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "Choco Celia | Handmade Chocolate",
  description: "Where Every Bite Melts Your Heart. Discover our exquisite collection of handmade chocolates.",
  icons: {
    icon: [
      { url: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/brand/icon-192.png",
    apple: "/brand/apple-touch-icon.png",
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate the locale
  if (!routing.locales.some((supportedLocale) => supportedLocale === locale)) {
    notFound();
  }

  // Get messages for next-intl
  const messages = await getMessages();
  
  // Get database settings for the phone number
  const settings = await getSettings();

  // Get active marketing banner
  let activeBanner: Awaited<ReturnType<typeof prisma.banner.findFirst>> = null;
  try {
    activeBanner = await prisma.banner.findFirst({
      where: { isActive: true },
    });
  } catch (err) {
    console.error("Error fetching active banner in layout:", err);
  }

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} suppressHydrationWarning className="scroll-smooth">
      <head>
        <link rel="icon" href="/brand/icon-192.png" type="image/png" />
        <link rel="apple-touch-icon" href="/brand/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <style dangerouslySetInnerHTML={{
          __html: `
            body { 
              margin: 0; 
              padding: 0; 
              overflow-x: hidden;
            }
          `
        }} />
      </head>
      <body
        className={`${notoSansArabic.variable} ${playfairDisplay.variable} antialiased min-h-screen flex flex-col font-cairo`}
      >
        <NextIntlClientProvider messages={messages} locale={locale}>
          <AnalyticsProvider />
          <PromoBanner activeBanner={activeBanner} locale={locale} />
          <OrganizationSchema 
            locale={locale} 
            facebook={settings.facebook || undefined}
            instagram={settings.instagram || undefined}
          />
          <ClientLayout>
            {children}
            <QuickContactMenu 
              phone={settings.phone || undefined} 
              facebook={settings.facebook || undefined}
              instagram={settings.instagram || undefined}
              locale={locale} 
            />
          </ClientLayout>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
