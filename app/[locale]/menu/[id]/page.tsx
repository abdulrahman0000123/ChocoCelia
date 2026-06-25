import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { ProductDetailsClient } from '../../../components/ProductDetailsClient';
import { ProductSchema } from '../../../components/schemas/ProductSchema';
import { BreadcrumbSchema } from '../../../components/schemas/BreadcrumbSchema';
import { getProduct, getProducts } from '@/app/lib/products';
import { routing } from '@/i18n/routing';

interface ProductDetailPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { id, locale } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: 'Product Not Found | ChocoCelia',
    };
  }

  const isAr = locale === 'ar';
  const name = isAr && product.nameAr ? product.nameAr : product.name;
  const description = isAr && product.descriptionAr ? product.descriptionAr : product.description;
  const title = `${name} | ChocoCelia`;
  
  // Dynamic OG image URL pointing to edge route
  const ogImageUrl = `https://choco-celia.com/api/og?name=${encodeURIComponent(name)}&image=${encodeURIComponent(product.image || '')}`;

  return {
    title,
    description: description.slice(0, 160),
    alternates: {
      canonical: `https://choco-celia.com/${locale}/menu/${id}`,
      languages: {
        'en': `https://choco-celia.com/en/menu/${id}`,
        'ar': `https://choco-celia.com/ar/menu/${id}`,
        'x-default': `https://choco-celia.com/en/menu/${id}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `https://choco-celia.com/${locale}/menu/${id}`,
      siteName: 'ChocoCelia',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: name,
        },
      ],
      locale: isAr ? 'ar_EG' : 'en_US',
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

import { prisma } from '@/app/lib/db';
import { ReviewsSection } from '../../../components/ReviewsSection';
import { RelatedProducts } from '../../../components/RelatedProducts';
import { RecentlyViewed } from '../../../components/RecentlyViewed';
import { Breadcrumb } from '../../../components/Breadcrumb';

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id, locale } = await params;
  const t = await getTranslations();

  // Fetch product and all products from the database
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const allProducts = await getProducts();

  // Fetch approved reviews for the product
  const reviews = await prisma.review.findMany({
    where: {
      productId: id,
      approved: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Convert Date fields to ISO strings for client component compatibility
  const formattedReviews = reviews.map(r => ({
    ...r,
    createdAt: r.createdAt.toISOString()
  }));

  const isAr = locale === 'ar';
  const displayName = isAr && product.nameAr ? product.nameAr : product.name;

  // Visual breadcrumbs
  const breadcrumbs: { name: string; href?: string }[] = [
    { name: isAr ? 'الرئيسية' : 'Home', href: '/' },
    { name: isAr ? 'القائمة' : 'Menu', href: '/menu' },
    { name: displayName },
  ];

  // Schema breadcrumb trail: Home > Menu > Product Name
  const breadcrumbItems = [
    { name: isAr ? 'الرئيسية' : 'Home', item: `https://choco-celia.com/${locale}` },
    { name: isAr ? 'القائمة' : 'Menu', item: `https://choco-celia.com/${locale}/menu` },
    { name: displayName, item: `https://choco-celia.com/${locale}/menu/${product.id}` },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-chocolate-50 via-white to-chocolate-50/50 dark:from-chocolate-950 dark:via-chocolate-900 dark:to-chocolate-950 pb-20 pt-28">
      {/* Schema.org Structured Data */}
      <ProductSchema product={product as any} reviews={formattedReviews} locale={locale} />
      <BreadcrumbSchema items={breadcrumbItems} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Breadcrumb items={breadcrumbs} locale={locale} />

        {/* Back Link */}
        <Link 
          href="/menu" 
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 dark:bg-chocolate-800/80 backdrop-blur-sm text-chocolate-700 dark:text-chocolate-200 hover:bg-white dark:hover:bg-chocolate-800 hover:text-chocolate-900 dark:hover:text-white transition-all shadow-md hover:shadow-lg font-bold text-sm font-cairo cursor-pointer min-h-[44px]"
        >
          <ArrowLeft className={`w-5 h-5 ${locale === 'ar' ? 'transform rotate-180' : ''}`} />
          <span>{t('backToMenu')}</span>
        </Link>

        {/* Product Details Form Client Component */}
        <ProductDetailsClient product={product as any} reviews={formattedReviews} locale={locale} />

        {/* Related Products Section */}
        <RelatedProducts productId={product.id} categoryId={product.categoryId} locale={locale} />

        {/* Recently Viewed Section */}
        <RecentlyViewed products={allProducts as any} currentProductId={product.id} />

        {/* Reviews Section */}
        <ReviewsSection productId={product.id} initialReviews={formattedReviews} locale={locale} />
      </div>
    </div>
  );
}

// Generate static params for ISR/SSG
export async function generateStaticParams() {
  const products = await getProducts();
  const locales = routing.locales;

  const paths: { locale: string; id: string }[] = [];

  for (const locale of locales) {
    for (const product of products) {
      paths.push({
        locale,
        id: product.id,
      });
    }
  }

  return paths;
}
export const revalidate = 3600; // Revalidate every hour
