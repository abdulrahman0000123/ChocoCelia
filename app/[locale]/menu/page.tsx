import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { MenuClient } from '../../components/MenuClient';
import { BreadcrumbSchema } from '../../components/schemas/BreadcrumbSchema';
import { getProducts, getCategories } from '@/app/lib/products';

interface MenuPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: MenuPageProps): Promise<Metadata> {
  const { locale } = await params;
  
  const title = locale === 'ar' 
    ? 'قائمة الشوكولاتة | شوكو سيليا - طعم السعادة اليدوية 🍫' 
    : 'Chocolate Menu | ChocoCelia - Taste Handcrafted Happiness 🍫';
    
  const description = locale === 'ar'
    ? 'تصفح قائمتنا الغنية بقطع الشوكولاتة البلجيكية الفاخرة المصنوعة يدوياً، بارات الشوكولاتة المخصصة، وبوكسات هدايا المناسبات مع التوصيل المبرد السريع.'
    : 'Explore our rich menu of premium handcrafted chocolates, customized bars, and elegant gift boxes. Place your order online for fresh delivery in Egypt.';

  const ogImageUrl = `https://choco-celia.com/api/og?name=${encodeURIComponent(locale === 'ar' ? 'قائمة المنتجات' : 'Chocolate Menu')}`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://choco-celia.com/${locale}/menu`,
      languages: {
        'en': 'https://choco-celia.com/en/menu',
        'ar': 'https://choco-celia.com/ar/menu',
        'x-default': 'https://choco-celia.com/en/menu',
      },
    },
    openGraph: {
      title,
      description,
      url: `https://choco-celia.com/${locale}/menu`,
      siteName: 'ChocoCelia',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: 'ChocoCelia Menu',
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

export default async function MenuPage({ params, searchParams }: MenuPageProps) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const t = await getTranslations();

  // Fetch products and categories server-side
  const rawProducts = await getProducts();
  const rawCategories = await getCategories();

  // Only display available products
  const products = (rawProducts as any[]).filter((p) => p.isAvailable);
  const categories = rawCategories as any[];

  // Parse category/tag from query params to pre-filter
  const category = typeof resolvedSearchParams?.category === 'string' ? resolvedSearchParams.category : 'All';
  const tag = typeof resolvedSearchParams?.tag === 'string' ? resolvedSearchParams.tag : 'All';

  // Schema breadcrumb trail
  const breadcrumbItems = [
    { name: locale === 'ar' ? 'الرئيسية' : 'Home', item: `https://choco-celia.com/${locale}` },
    { name: locale === 'ar' ? 'القائمة' : 'Menu', item: `https://choco-celia.com/${locale}/menu` },
  ];

  return (
    <div className="min-h-screen bg-chocolate-50/20 dark:bg-chocolate-950/10 pb-20 pt-20">
      {/* Search Engine Structured Breadcrumbs */}
      <BreadcrumbSchema items={breadcrumbItems} />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-chocolate-900 to-chocolate-950 text-white py-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gold-500/5 via-transparent to-gold-500/5 pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold font-cairo mb-4 tracking-tight drop-shadow-md">
            {t('ourMenu')}
          </h1>
          <p className="text-chocolate-200 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            {t('discoverHandcraftedCollection')}
          </p>
        </div>
      </div>

      {/* Interactive Products and Category Filters Client Component */}
      <MenuClient products={products} categories={categories} initialCategory={category} initialTag={tag} />
    </div>
  );
}
