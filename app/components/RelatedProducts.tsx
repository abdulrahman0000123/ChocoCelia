import React from 'react';
import { getRelatedProducts } from '@/app/lib/recommendations';
import { ProductCard } from './ProductCard';
import { getTranslations } from 'next-intl/server';

interface RelatedProductsProps {
  productId: string;
  categoryId: string;
  locale: string;
}

export async function RelatedProducts({ productId, categoryId, locale }: RelatedProductsProps) {
  const t = await getTranslations();
  const related = await getRelatedProducts(productId, categoryId, 4);

  if (related.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 sm:mt-16 border-t border-chocolate-100 dark:border-chocolate-850 pt-5 sm:pt-12">
      <h2 className="text-lg sm:text-3xl font-extrabold text-chocolate-950 dark:text-white font-cairo mb-3 sm:mb-8">
        {t('relatedProducts')}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-6">
        {related.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
