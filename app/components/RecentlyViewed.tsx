'use client';

import React from 'react';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import { ProductCard } from './ProductCard';
import { useTranslations } from 'next-intl';

interface Product {
  id: string;
  name: string;
  nameAr?: string | null;
  description: string;
  descriptionAr?: string | null;
  price: number;
  image: string;
  category: {
    id: string;
    name: string;
    nameAr?: string | null;
  };
  tags?: string | null;
}

interface RecentlyViewedProps {
  products: Product[];
  currentProductId?: string;
}

export function RecentlyViewed({ products, currentProductId }: RecentlyViewedProps) {
  const t = useTranslations();
  const { recentlyViewed } = useRecentlyViewed();
  const items = recentlyViewed
    .filter(id => id !== currentProductId)
    .map(id => products.find(product => product.id === id))
    .filter((product): product is Product => !!product);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 sm:mt-16 border-t border-chocolate-100 dark:border-chocolate-850 pt-5 sm:pt-12">
      <h2 className="text-lg sm:text-3xl font-extrabold text-chocolate-950 dark:text-white font-cairo mb-3 sm:mb-8">
        {t('recentlyViewed')}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-6">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
