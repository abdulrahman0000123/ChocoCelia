import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Hero } from '../components/Hero';
import { HomeClient } from '../components/HomeClient';
import { HowToOrder } from '../components/HowToOrder';
import { Testimonials } from '../components/Testimonials';
import { LocalBusinessSchema } from '../components/schemas/LocalBusinessSchema';
import { getProducts, getSettings } from '@/app/lib/products';
import { RecentlyViewed } from '../components/RecentlyViewed';
import { FAQSection } from '../components/FAQSection';
import { prisma } from '@/app/lib/db';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  
  const title = locale === 'ar' 
    ? 'شوكو سيليا | شوكولاتة فاخرة مصنوعة يدوياً 🍫' 
    : 'ChocoCelia | Premium Handmade Chocolates 🍫';
    
  const description = locale === 'ar'
    ? 'تذوق السحر مع شوكولاتة شوكو سيليا الفاخرة المصنوعة يدوياً. نوفر تشكيلة مميزة من الهدايا وبوكسات الشوكولاتة لجميع المناسبات. التوصيل حالياً في محافظة بني سويف وقريباً في جميع المحافظات.'
    : 'Experience the magic of premium handmade chocolates by ChocoCelia. Discover our customized chocolate boxes and gifts for all occasions. Currently serving Beni Suef Governorate, and coming soon to all governorates.';

  const ogImageUrl = `https://choco-celia.com/api/og?name=${encodeURIComponent(locale === 'ar' ? 'شوكولاتة فاخرة' : 'Premium Handmade Chocolate')}`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://choco-celia.com/${locale}`,
      languages: {
        'en': 'https://choco-celia.com/en',
        'ar': 'https://choco-celia.com/ar',
        'x-default': 'https://choco-celia.com/en',
      },
    },
    openGraph: {
      title,
      description,
      url: `https://choco-celia.com/${locale}`,
      siteName: 'ChocoCelia',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: 'ChocoCelia Preview',
        },
      ],
      locale: locale === 'ar' ? 'ar_EG' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations();

  // Fetch data server-side
  const settings = await getSettings();
  const rawProducts = await getProducts();

  let activeCampaign: any = null;
  let testimonials: any[] = [];
  try {
    activeCampaign = await prisma.campaign.findFirst({
      where: { isActive: true },
    });
    testimonials = await prisma.testimonial.findMany({
      where: { approved: true },
      orderBy: { createdAt: 'desc' },
    });
  } catch (err) {
    console.error('Error fetching marketing data on homepage:', err);
  }

  // Process featured products: find items with "Best Seller" or "New" in their tags
  const products = rawProducts as any[];
  const featured = products
    .filter((p) => p.isAvailable && (p.tags?.includes('Best Seller') || p.tags?.includes('New')))
    .slice(0, 3);

  // If not enough featured, backfill with other available products
  if (featured.length < 3) {
    const remaining = products
      .filter((p) => p.isAvailable && !featured.find((f) => f.id === p.id))
      .slice(0, 3 - featured.length);
    featured.push(...remaining);
  }

  // Set default feature cards using next-intl server translations
  const featureCards = [
    { icon: '🌿', title: t('premiumIngredients'), description: t('finestIngredients') },
    { icon: '🤎', title: t('handmadeWithLove'), description: t('craftedInSmallBatches') },
    { icon: '✨', title: t('uniqueFlavors'), description: t('innovativeCombinations') },
  ];

  return (
    <div className="flex flex-col gap-16 pb-16 bg-gradient-to-b from-transparent via-chocolate-50/10 to-transparent">
      {/* Schema.org Structured Data */}
      <LocalBusinessSchema />

      {/* 1. Hero Banner */}
      <Hero settings={settings} locale={locale} activeCampaign={activeCampaign} />
      
      {/* 2. How To Order (Visual Guide) */}
      <HowToOrder locale={locale} />

      {/* Recently Viewed Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <RecentlyViewed products={rawProducts as any} />
      </div>

      {/* 3. Products Grid and Brand Features */}
      <HomeClient 
        featuredProducts={featured} 
        featureCards={featureCards} 
      />

      {/* 4. Testimonials (Social Proof) */}
      <Testimonials locale={locale} testimonials={testimonials} />

      {/* 5. FAQ Section */}
      <FAQSection locale={locale} />
    </div>
  );
}
