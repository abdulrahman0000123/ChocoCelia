'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { SlidersHorizontal, ArrowUpDown, Tag, DollarSign, X } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  nameAr?: string | null;
}

export interface FilterState {
  category: string;
  minPrice: number;
  maxPrice: number;
  sortBy: string;
  tag: string;
}

interface ProductFiltersProps {
  categories: Category[];
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  maxPriceLimit: number;
  locale: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function ProductFilters({
  categories,
  filters,
  onChange,
  maxPriceLimit,
  locale,
  isOpen = false,
  onClose,
}: ProductFiltersProps) {
  const t = useTranslations();
  const isAr = locale === 'ar';

  const handleCategoryChange = (catName: string) => {
    onChange({ ...filters, category: catName });
  };

  const handlePriceChange = (field: 'minPrice' | 'maxPrice', value: number) => {
    onChange({ ...filters, [field]: value });
  };

  const handleSortChange = (sortBy: string) => {
    onChange({ ...filters, sortBy });
  };

  const handleTagChange = (tag: string) => {
    onChange({ ...filters, tag });
  };

  const resetFilters = () => {
    onChange({
      category: 'All',
      minPrice: 0,
      maxPrice: maxPriceLimit,
      sortBy: 'newest',
      tag: 'All',
    });
  };

  const filterContent = (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-chocolate-100 dark:border-chocolate-850">
        <div className="flex items-center gap-2 font-bold text-chocolate-900 dark:text-white text-lg font-cairo">
          <SlidersHorizontal className="w-5 h-5 text-gold-600" />
          <span>{isAr ? 'تصفية المنتجات' : 'Filter Products'}</span>
        </div>
        <button
          onClick={resetFilters}
          className="text-xs font-bold text-gold-600 hover:text-gold-500 hover:underline cursor-pointer"
        >
          {isAr ? 'إعادة ضبط' : 'Reset All'}
        </button>
      </div>

      {/* Sorting */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-chocolate-950 dark:text-white flex items-center gap-2 font-cairo">
          <ArrowUpDown className="w-4 h-4 text-chocolate-400" />
          {isAr ? 'ترتيب حسب' : 'Sort By'}
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-chocolate-100 dark:border-chocolate-800 bg-white dark:bg-chocolate-950 text-chocolate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500/50 font-medium text-sm"
        >
          <option value="newest">{isAr ? 'الأحدث' : 'Newest'}</option>
          <option value="price_asc">{isAr ? 'السعر: من الأقل للأعلى' : 'Price: Low to High'}</option>
          <option value="price_desc">{isAr ? 'السعر: من الأعلى للأقل' : 'Price: High to Low'}</option>
        </select>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-chocolate-950 dark:text-white font-cairo">
          {isAr ? 'الأقسام' : 'Categories'}
        </label>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => handleCategoryChange('All')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex justify-between items-center cursor-pointer ${
              filters.category === 'All'
                ? 'bg-gold-500/10 dark:bg-gold-500/20 text-gold-600 dark:text-gold-400 border border-gold-500/30'
                : 'text-chocolate-700 dark:text-chocolate-300 hover:bg-chocolate-50 dark:hover:bg-chocolate-800/30 border border-transparent'
            }`}
          >
            <span>{isAr ? 'كل الشوكولاتة' : 'All Chocolates'}</span>
          </button>
          {categories.map((cat) => {
            const displayName = isAr && cat.nameAr ? cat.nameAr : cat.name;
            const active = filters.category === cat.name;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.name)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex justify-between items-center cursor-pointer ${
                  active
                    ? 'bg-gold-500/10 dark:bg-gold-500/20 text-gold-600 dark:text-gold-400 border border-gold-500/30'
                    : 'text-chocolate-700 dark:text-chocolate-300 hover:bg-chocolate-50 dark:hover:bg-chocolate-800/30 border border-transparent'
                }`}
              >
                <span>{displayName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-chocolate-950 dark:text-white flex items-center gap-2 font-cairo">
          <DollarSign className="w-4 h-4 text-chocolate-400" />
          {isAr ? 'نطاق السعر' : 'Price Range'}
        </label>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <span className="text-[10px] text-chocolate-400 font-bold uppercase block mb-1">
                {isAr ? 'الحد الأدنى' : 'Min'}
              </span>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => handlePriceChange('minPrice', Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-chocolate-100 dark:border-chocolate-800 bg-white dark:bg-chocolate-950 text-chocolate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500/50 text-sm font-medium"
              />
            </div>
            <div className="flex-1">
              <span className="text-[10px] text-chocolate-400 font-bold uppercase block mb-1">
                {isAr ? 'الحد الأقصى' : 'Max'}
              </span>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handlePriceChange('maxPrice', Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-chocolate-100 dark:border-chocolate-800 bg-white dark:bg-chocolate-950 text-chocolate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500/50 text-sm font-medium"
              />
            </div>
          </div>
          <input
            type="range"
            min="0"
            max={maxPriceLimit}
            value={filters.maxPrice}
            onChange={(e) => handlePriceChange('maxPrice', Number(e.target.value))}
            className="w-full accent-gold-500 h-1 bg-chocolate-100 dark:bg-chocolate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* Badges / Tags */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-chocolate-950 dark:text-white flex items-center gap-2 font-cairo">
          <Tag className="w-4 h-4 text-chocolate-400" />
          {isAr ? 'العلامات المميزة' : 'Featured Badges'}
        </label>
        <div className="flex flex-wrap gap-2">
          {['All', 'Best Seller', 'New'].map((tag) => {
            const active = filters.tag === tag;
            const displayTagName =
              tag === 'All' ? (isAr ? 'الكل' : 'All') : isAr ? (tag === 'Best Seller' ? 'الأكثر مبيعاً' : 'جديد') : tag;
            return (
              <button
                key={tag}
                onClick={() => handleTagChange(tag)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[36px] ${
                  active
                    ? 'bg-gold-600 text-white shadow-sm'
                    : 'bg-chocolate-50 dark:bg-chocolate-800/40 text-chocolate-700 dark:text-chocolate-200 border border-chocolate-100/30 dark:border-chocolate-800/20 hover:bg-chocolate-100'
                }`}
              >
                {displayTagName}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar filter view */}
      <div className="hidden md:block bg-white dark:bg-chocolate-900 border border-chocolate-100/50 dark:border-chocolate-850 p-6 rounded-3xl h-fit">
        {filterContent}
      </div>

      {/* Mobile Modal Drawer Sheet filter view */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-chocolate-950/40 backdrop-blur-md flex justify-end md:hidden">
          <div className="w-full max-w-xs bg-white dark:bg-chocolate-900 h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-slide-in">
            <div>
              <div className="flex justify-end mb-4">
                <button
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-chocolate-50 dark:hover:bg-chocolate-800 text-chocolate-400 cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              {filterContent}
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="w-full mt-8 py-3 bg-gold-600 hover:bg-gold-500 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer min-h-[44px]"
              >
                {isAr ? 'عرض النتائج' : 'Show Results'}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
