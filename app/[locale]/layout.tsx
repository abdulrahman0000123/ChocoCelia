import type { Metadata } from "next";
import { Cairo, Cormorant_Garamond } from "next/font/google";
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

const cairo = Cairo({
  subsets: ["latin", "arabic"],
  variable: "--font-cairo",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"],
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

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate the locale
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Get messages for next-intl
  const messages = await getMessages();
  
  // Get database settings for the phone number
  const settings = await getSettings();

  // Get active marketing banner
  let activeBanner = null;
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
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="manifest" href="/manifest.json" />
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
        className={`${cairo.variable} ${cormorantGaramond.variable} antialiased min-h-screen flex flex-col font-cairo`}
      >
        <NextIntlClientProvider messages={messages} locale={locale}>
          <AnalyticsProvider />
          <PromoBanner activeBanner={activeBanner} locale={locale} />
          <OrganizationSchema 
            locale={locale} 
            phone={settings.phone || undefined} 
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
