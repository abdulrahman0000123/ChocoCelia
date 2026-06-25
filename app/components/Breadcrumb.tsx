'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  name: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  locale: string;
}

export function Breadcrumb({ items, locale }: BreadcrumbProps) {
  const isAr = locale === 'ar';

  return (
    <nav aria-label="breadcrumb" className="w-full mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold text-chocolate-500 dark:text-chocolate-400 font-cairo">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-1.5 sm:gap-2">
              {index > 0 && (
                <ChevronRight
                  className={`w-3.5 h-3.5 text-chocolate-300 dark:text-chocolate-800 ${
                    isAr ? 'transform rotate-180' : ''
                  }`}
                />
              )}

              {isLast || !item.href ? (
                <span className="text-chocolate-950 dark:text-white truncate max-w-[150px] sm:max-w-xs font-semibold">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-gold-600 dark:hover:text-gold-400 transition-colors"
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
export default Breadcrumb;
