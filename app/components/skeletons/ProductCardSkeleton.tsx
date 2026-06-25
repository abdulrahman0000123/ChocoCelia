'use client';

import React from 'react';

export function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-chocolate-900 rounded-3xl overflow-hidden shadow-md border border-chocolate-100/50 dark:border-chocolate-800/80 animate-pulse flex flex-col h-full">
      <div className="bg-chocolate-100 dark:bg-chocolate-800 h-64 w-full" />
      <div className="p-6 flex flex-col flex-grow justify-between space-y-4">
        <div>
          {/* Category placeholder */}
          <div className="h-3 bg-chocolate-100 dark:bg-chocolate-800 rounded w-1/4 mb-3" />
          {/* Title placeholder */}
          <div className="h-5 bg-chocolate-100 dark:bg-chocolate-800 rounded w-3/4 mb-3" />
          {/* Description placeholder */}
          <div className="space-y-2">
            <div className="h-3.5 bg-chocolate-100 dark:bg-chocolate-800 rounded w-full" />
            <div className="h-3.5 bg-chocolate-100 dark:bg-chocolate-800 rounded w-5/6" />
          </div>
        </div>
        {/* Footer placeholder */}
        <div className="flex items-center justify-between border-t border-chocolate-50 dark:border-chocolate-800/40 pt-4 mt-auto">
          <div className="h-5 bg-chocolate-100 dark:bg-chocolate-800 rounded w-1/3" />
          <div className="h-4 bg-chocolate-100 dark:bg-chocolate-800 rounded w-8" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
