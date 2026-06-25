'use client';

import React, { useEffect, useState } from 'react';
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
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    if (recentlyViewed.length > 0) {
      // Filter out current product and map the IDs to product objects
      const filteredIds = recentlyViewed.filter((id) => id !== currentProductId);
      const mapped = filteredIds
        .map((id) => products.find((p) => p.id === id))
        .filter((p): p is Product => !!p);
      setItems(mapped);
    }
  }, [recentlyViewed, products, currentProductId]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-16 border-t border-chocolate-100 dark:border-chocolate-850 pt-12">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-chocolate-950 dark:text-white font-cairo mb-8">
        {t('recentlyViewed')}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
