'use client';

import React, { useState } from 'react';
import { ProductCard } from './ProductCard';
import { useLocale, useTranslations } from 'next-intl';
import { ProductFilters, FilterState } from './ProductFilters';
import { SlidersHorizontal } from 'lucide-react';
import { Breadcrumb } from './Breadcrumb';

interface Category {
  id: string;
  name: string;
  nameAr?: string | null;
}

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
  createdAt?: Date | string;
}

interface MenuClientProps {
  products: Product[];
  categories: Category[];
  initialCategory?: string;
  initialTag?: string;
}

export function MenuClient({ products, categories, initialCategory = 'All', initialTag = 'All' }: MenuClientProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isAr = locale === 'ar';

  const maxProductPrice = products.reduce((max, p) => (p.price > max ? p.price : max), 100);

  const [filters, setFilters] = useState<FilterState>({
    category: initialCategory,
    minPrice: 0,
    maxPrice: maxProductPrice,
    sortBy: 'newest',
    tag: initialTag,
  });

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Filtering Logic
  let filtered = products.filter((p) => {
    // 1. Category check
    const catMatch = filters.category === 'All' || p.category?.name === filters.category;
    // 2. Price check
    const priceMatch = p.price >= filters.minPrice && p.price <= filters.maxPrice;
    // 3. Tag check
    const tagMatch =
      filters.tag === 'All' ||
      (p.tags && p.tags.toLowerCase().includes(filters.tag.toLowerCase()));

    return catMatch && priceMatch && tagMatch;
  });

  // Sorting Logic
  filtered = [...filtered].sort((a, b) => {
    if (filters.sortBy === 'price_asc') {
      return a.price - b.price;
    }
    if (filters.sortBy === 'price_desc') {
      return b.price - a.price;
    }
    // newest sort order (newest created date first)
    if (a.createdAt && b.createdAt) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return 0;
  });

  const breadcrumbs: { name: string; href?: string }[] = [
    { name: isAr ? 'الرئيسية' : 'Home', href: '/' },
    { name: isAr ? 'القائمة' : 'Menu', href: filters.category !== 'All' ? '/menu' : undefined },
  ];

  if (filters.category !== 'All') {
    const selectedCat = categories.find((c) => c.name === filters.category);
    const catName = isAr && selectedCat?.nameAr ? selectedCat.nameAr : filters.category;
    breadcrumbs.push({ name: catName });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
      <Breadcrumb items={breadcrumbs} locale={locale} />
      {/* Mobile filter toggle bar */}
      <div className="flex md:hidden justify-between items-center bg-white/80 dark:bg-chocolate-900/90 backdrop-blur-md p-4 rounded-2xl shadow-md mb-6 border border-chocolate-100/50 dark:border-chocolate-800/80">
        <span className="text-sm font-bold text-chocolate-700 dark:text-chocolate-200 font-cairo">
          {isAr
            ? `تم العثور على ${filtered.length} منتج`
            : `Found ${filtered.length} products`}
        </span>
        <button
          onClick={() => setIsMobileFiltersOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gold-600 hover:bg-gold-500 text-white font-bold rounded-xl text-sm transition-all cursor-pointer min-h-[40px]"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>{isAr ? 'تصفية' : 'Filters'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="col-span-1">
          <ProductFilters
            categories={categories}
            filters={filters}
            onChange={setFilters}
            maxPriceLimit={maxProductPrice}
            locale={locale}
            isOpen={isMobileFiltersOpen}
            onClose={() => setIsMobileFiltersOpen(false)}
          />
        </div>

        {/* Products Grid Column */}
        <div className="col-span-1 md:col-span-3 space-y-6">
          <div className="hidden md:flex justify-between items-center pb-4 border-b border-chocolate-100/10 dark:border-chocolate-850">
            <span className="text-sm font-bold text-chocolate-500 dark:text-chocolate-400 font-cairo">
              {isAr
                ? `تم العثور على ${filtered.length} منتج`
                : `Found ${filtered.length} products`}
            </span>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Empty State */}
          {filtered.length === 0 && (
            <div className="text-center py-20 bg-white/50 dark:bg-chocolate-900/30 rounded-3xl p-8 border border-chocolate-100/50 dark:border-chocolate-850">
              <span className="text-4xl block mb-2">🔍</span>
              <p className="text-lg text-chocolate-800 dark:text-chocolate-200 font-bold mb-2 font-cairo">
                {isAr
                  ? 'لا توجد منتجات تطابق خيارات التصفية الحالية.'
                  : 'No products match the selected filters.'}
              </p>
              <p className="text-chocolate-400 dark:text-chocolate-500 text-sm">
                {isAr
                  ? 'برجاء تعديل الفلاتر أو إعادة ضبطها لعرض كل الشوكولاتة.'
                  : 'Please try adjusting your filters or reset them to view all chocolates.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
