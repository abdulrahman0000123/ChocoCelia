'use client';

import React from 'react';

interface StockStatusProps {
  stock: number | null;
  locale: string;
}

export function StockStatus({ stock, locale }: StockStatusProps) {
  const isAr = locale === 'ar';

  if (stock === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30">
        <span>✕</span>
        <span>{isAr ? 'نفذت الكمية' : 'Out of Stock'}</span>
      </span>
    );
  }

  if (stock !== null && stock <= 5) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30 animate-pulse">
        <span>⚠</span>
        <span>
          {isAr
            ? `كمية محدودة - متبقي ${stock} فقط!`
            : `Low Stock - only ${stock} left!`}
        </span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900/30">
      <span>✓</span>
      <span>{isAr ? 'متوفر في المخزن' : 'In Stock'}</span>
    </span>
  );
}
export default StockStatus;
