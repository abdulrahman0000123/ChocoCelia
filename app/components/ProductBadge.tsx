'use client';

import React from 'react';

interface ProductBadgeProps {
  badge: string;
  locale: string;
}

export function ProductBadge({ badge, locale }: ProductBadgeProps) {
  const isAr = locale === 'ar';

  const getBadgeDetails = (type: string) => {
    const cleanType = type.trim().toUpperCase();
    switch (cleanType) {
      case 'BEST_SELLER':
      case 'BEST SELLER':
        return {
          text: isAr ? 'الأكثر مبيعاً 🔥' : 'Best Seller 🔥',
          class: 'from-amber-500 to-orange-500 text-white',
        };
      case 'NEW':
      case 'NEW_ARRIVAL':
      case 'NEW ARRIVAL':
        return {
          text: isAr ? 'جديد ✨' : 'New ✨',
          class: 'from-teal-500 to-emerald-500 text-white',
        };
      case 'LIMITED':
      case 'LIMITED_EDITION':
      case 'LIMITED EDITION':
        return {
          text: isAr ? 'إصدار محدود 👑' : 'Limited Edition 👑',
          class: 'from-purple-500 to-indigo-500 text-white',
        };
      case 'SALE':
      case 'DISCOUNT':
        return {
          text: isAr ? 'خصم 🏷️' : 'Sale 🏷️',
          class: 'from-red-500 to-pink-500 text-white',
        };
      default:
        return {
          text: type,
          class: 'from-chocolate-500 to-chocolate-600 text-white',
        };
    }
  };

  const details = getBadgeDetails(badge);

  return (
    <span className={`px-3 py-1 bg-gradient-to-r ${details.class} text-xs font-extrabold rounded-full shadow-md uppercase tracking-wider`}>
      {details.text}
    </span>
  );
}
export default ProductBadge;
