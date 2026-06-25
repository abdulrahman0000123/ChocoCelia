'use client';

import React, { useEffect, useState } from 'react';
import { useWishlist } from '../../hooks/useWishlist';
import { ProductCard } from '../../components/ProductCard';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Heart, ArrowLeft } from 'lucide-react';
import { ProductGridSkeleton } from '../../components/skeletons/ProductCardSkeleton';

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

export default function WishlistPage() {
  const t = useTranslations();
  const locale = useLocale();
  const isAr = locale === 'ar';
  const { wishlist } = useWishlist();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (err) {
        console.error('Failed to fetch products for wishlist', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const wishlistedItems = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-chocolate-50 via-white to-chocolate-50/50 dark:from-chocolate-950 dark:via-chocolate-900 dark:to-chocolate-950 pb-20 pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Link */}
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 dark:bg-chocolate-800/80 backdrop-blur-sm text-chocolate-700 dark:text-chocolate-200 hover:bg-white dark:hover:bg-chocolate-800 hover:text-chocolate-900 dark:hover:text-white transition-all shadow-md hover:shadow-lg font-bold text-sm font-cairo cursor-pointer min-h-[44px] mb-8"
        >
          <ArrowLeft className={`w-5 h-5 ${isAr ? 'transform rotate-180' : ''}`} />
          <span>{t('backToMenu')}</span>
        </Link>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-chocolate-950 dark:text-white font-cairo mb-8">
          {t('wishlist')}
        </h1>

        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : wishlistedItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
            {wishlistedItems.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-chocolate-100 dark:border-chocolate-800 rounded-3xl bg-chocolate-50/10">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-8 h-8 text-red-500 fill-none" />
            </div>
            <h2 className="text-xl font-bold text-chocolate-900 dark:text-white mb-2">
              {t('emptyWishlist')}
            </h2>
            <p className="text-chocolate-500 dark:text-chocolate-400 mb-8 max-w-md mx-auto text-sm leading-relaxed">
              {isAr
                ? 'تصفح قائمة الشوكولاتة اللذيذة لدينا وأضف المنتجات المفضلة لديك هنا للرجوع إليها لاحقاً!'
                : 'Browse our delicious chocolate selection and save your favorite items here to purchase them later!'}
            </p>
            <Link
              href="/menu"
              className="px-6 py-3 bg-gold-600 hover:bg-gold-500 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer min-h-[44px] inline-block"
            >
              {t('browseMenu')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
