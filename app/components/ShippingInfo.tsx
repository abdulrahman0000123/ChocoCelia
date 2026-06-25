'use client';

import React from 'react';
import { ShieldCheck, CornerUpLeft, Award } from 'lucide-react';

interface ShippingInfoProps {
  locale: string;
}

export function ShippingInfo({ locale }: ShippingInfoProps) {
  const isAr = locale === 'ar';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Quality Guarantees */}
        <div className="flex items-center gap-3 p-3 bg-white dark:bg-chocolate-900 border border-chocolate-100/50 dark:border-chocolate-850 rounded-xl">
          <Award className="w-5 h-5 text-gold-600 flex-shrink-0" />
          <div>
            <span className="text-xs font-bold text-chocolate-950 dark:text-white block font-cairo">
              {isAr ? 'شوكولاتة طبيعية 100%' : '100% Premium Cocoa'}
            </span>
            <span className="text-[10px] text-chocolate-500 dark:text-chocolate-400 font-medium">
              {isAr ? 'بلجيكية فاخرة بدون مواد حافظة' : 'Premium Belgian chocolate, no preservatives'}
            </span>
          </div>
        </div>

        {/* Return Policy */}
        <div className="flex items-center gap-3 p-3 bg-white dark:bg-chocolate-900 border border-chocolate-100/50 dark:border-chocolate-850 rounded-xl">
          <CornerUpLeft className="w-5 h-5 text-gold-600 flex-shrink-0" />
          <div>
            <span className="text-xs font-bold text-chocolate-950 dark:text-white block font-cairo">
              {isAr ? 'ضمان الاستلام' : 'Delivery Guarantee'}
            </span>
            <span className="text-[10px] text-chocolate-500 dark:text-chocolate-400 font-medium">
              {isAr ? 'استبدال فوري مجاني في حال التلف' : 'Free replacement if items are damaged'}
            </span>
          </div>
        </div>
      </div>

      {/* Fresh Packaging Notice */}
      <div className="flex items-start gap-3 p-4 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-2xl">
        <ShieldCheck className="w-5 h-5 text-gold-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed text-chocolate-700 dark:text-chocolate-300 font-medium">
          <span className="font-bold text-chocolate-950 dark:text-white block font-cairo mb-0.5">
            {isAr ? 'تغليف مبرد وحفظ آمن' : 'Cold-Chain Packaging & Freshness'}
          </span>
          <p>
            {isAr
              ? 'نقوم بشحن الشوكولاتة في حاويات مبردة ومغلفة بعناية للحفاظ على شكلها وجودتها من الذوبان أثناء الشحن صيفاً.'
              : 'Our chocolates are shipped in temperature-controlled packaging to prevent melting and preserve taste and texture during delivery.'}
          </p>
        </div>
      </div>
    </div>
  );
}
export default ShippingInfo;
