'use client';

import { useLocale, useTranslations } from 'next-intl';

export interface CheckoutExtrasData {
  requestedDeliveryDate?: string | null;
  requestedDeliveryTime?: string | null;
  couponCode?: string | null;
  discountPct?: number;
  discountAmount?: number;
}

export function CheckoutExtras({ data }: { data: CheckoutExtrasData }) {
  const t = useTranslations('checkoutFields');
  const locale = useLocale();
  if (!data.requestedDeliveryDate && !data.couponCode) return null;
  return (
    <div className="space-y-2 my-3 p-3 rounded-xl bg-chocolate-50 dark:bg-chocolate-900 text-chocolate-800 dark:text-chocolate-100 text-sm">
      {data.couponCode && <div className="flex flex-wrap justify-between gap-2">
        <span>{t('discount')} (<b dir="ltr">{data.couponCode}</b>, {data.discountPct}%):</span>
        <span className="font-bold text-green-800 dark:text-green-300" dir="ltr">-{(data.discountAmount ?? 0).toFixed(2)} EGP</span>
      </div>}
      {data.requestedDeliveryDate && data.requestedDeliveryTime && <div>
        <p className="font-bold">{t('requestedSchedule')}</p>
        <p><time dateTime={`${data.requestedDeliveryDate}T${data.requestedDeliveryTime}`}>
          {new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${data.requestedDeliveryDate}T00:00:00Z`))}
          {' · '}<span dir="ltr">{data.requestedDeliveryTime}</span>
        </time></p>
        <p className="text-xs mt-1">{t('scheduleNote')}</p>
      </div>}
    </div>
  );
}
