'use client';

import React from 'react';
import { Truck } from 'lucide-react';

interface EstimatedDeliveryProps {
  locale: string;
}

export function EstimatedDelivery({ locale }: EstimatedDeliveryProps) {
  const isAr = locale === 'ar';

  return (
    <div className="flex items-start gap-3 p-4 bg-chocolate-50/30 dark:bg-chocolate-900/20 border border-chocolate-100/50 dark:border-chocolate-850 rounded-2xl">
      <Truck className="w-5 h-5 text-gold-600 flex-shrink-0 mt-0.5" />
      <div className="text-sm">
        <span className="font-bold text-chocolate-900 dark:text-white block font-cairo mb-0.5">
          {isAr ? 'مواعيد التوصيل المتوقعة' : 'Estimated Delivery Times'}
        </span>
        <div className="text-chocolate-600 dark:text-chocolate-300 font-medium space-y-1">
          <p>
            {isAr
              ? '• القاهرة والجيزة وبني سويف: خلال 24 ساعة (اليوم أو غداً)'
              : '• Cairo, Giza, and Beni Suef: Within 24 hours (Today or Tomorrow)'}
          </p>
          <p>
            {isAr
              ? '• باقي المحافظات: من 2 إلى 4 أيام عمل'
              : '• Other Governorates: 2 to 4 business days'}
          </p>
        </div>
      </div>
    </div>
  );
}
export default EstimatedDelivery;
