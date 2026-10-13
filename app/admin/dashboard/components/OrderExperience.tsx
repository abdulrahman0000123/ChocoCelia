'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarClock, ChevronDown, Mail, MessageCircle, Phone, RefreshCw } from 'lucide-react';
import { adminError, adminFetch, useAdmin } from './AdminContext';
import { AdminLoading, AdminNotice } from './AdminUI';
import { OrderFinancePanel, formatMoney, statusLabel, type FinancialOrder } from './OrderFinancePanel';
import { normalizePhoneNumber } from '@/app/lib/validation';
import styles from './AdminExperience.module.css';

export type AdminOrder = FinancialOrder & {
  customerEmail?: string | null; customerAddress?: string | null; preferredContact?: string | null;
  requestedDeliveryDate?: string | null; requestedDeliveryTime?: string | null;
  paymentMethod?: string | null; specialRequests?: string | null; subtotal?: number | null;
  deliveryFee?: number | null; couponCode?: string | null; discountAmount?: number | null; requestKey?: string | null;
  items?: {quantity:number;price:number;product:{name:string;nameAr?:string|null}}[];
};

export function deliveryLabel(order: Pick<AdminOrder,'requestedDeliveryDate'|'requestedDeliveryTime'>, locale:'ar'|'en') {
  if (!order.requestedDeliveryDate) return locale === 'ar' ? 'الموعد غير مسجل' : 'Schedule not recorded';
  const date = new Date(`${order.requestedDeliveryDate}T12:00:00Z`);
  const label = Number.isNaN(date.getTime()) ? order.requestedDeliveryDate : date.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-GB', {day:'numeric',month:'short',year:'numeric',timeZone:'Africa/Cairo'});
  return `${label} · ${order.requestedDeliveryTime || (locale === 'ar' ? 'الوقت غير مسجل' : 'Time not recorded')}`;
}

export function OrderExperience({id,onClose,onSaved}: {id:string;onClose:()=>void;onSaved:()=>void}) {
  const {ar,locale,t} = useAdmin();
  const [order,setOrder] = useState<AdminOrder|null>(null);
  const [error,setError] = useState(false);
  const [loading,setLoading] = useState(true);
  const version = useRef(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const finance = useRef<HTMLDetailsElement>(null);
  const load = useCallback(async () => {
    const current = ++version.current;
    setLoading(true);setError(false);
    try {
      const r = await adminFetch(`/api/orders/${encodeURIComponent(id)}`,{cache:'no-store'});
      if (!r.ok) throw new Error();
      const data:AdminOrder = await r.json();
      if (current === version.current) setOrder(data);
    } catch { if (current === version.current) setError(true); }
    finally { if (current === version.current) setLoading(false); }
  },[id]);
  useEffect(() => {
    const requestVersion = version;
    load();
    heading.current?.focus({preventScroll:true});
    heading.current?.scrollIntoView({block:'start',behavior:'instant'});
    return () => {requestVersion.current++;};
  },[load]);
  const currency = t('ج.م','EGP');
  const money = (value:number|string|null|undefined) => value == null ? t('غير مسجل','Not recorded') : `${formatMoney(value,locale)} ${currency}`;
  const lines = order?.finance?.lines ?? order?.items?.map(i => ({name:i.product.name,nameAr:i.product.nameAr || i.product.name,quantity:i.quantity,price:String(i.price)})) ?? [];
  const phone = normalizePhoneNumber(order?.customerPhone || '');
  const whatsapp = phone.startsWith('01') ? `20${phone.slice(1)}` : phone.replace(/^00/,'').replace(/\D/g,'');
  const showFinance = () => { if (finance.current) {finance.current.open = true; finance.current.scrollIntoView({block:'start',behavior:'instant'}); finance.current.querySelector('summary')?.focus({preventScroll:true});} };
  return <article className={`${styles.workspace} ${styles.detail}`} aria-labelledby="order-heading">
    <header className={styles.detailHeader}>
      <div><div className={styles.detailHeadline}><h1 id="order-heading" ref={heading} tabIndex={-1}>{t('تفاصيل الطلب','Order details')}</h1>{order && <span className={styles.status} data-status={order.status}>{statusLabel(order.status,ar)}</span>}</div><p><bdi>#{id.slice(-8).toUpperCase()}</bdi>{order && <> · {new Date(order.createdAt).toLocaleString(ar?'ar-EG':'en-GB',{dateStyle:'medium',timeStyle:'short',timeZone:'Africa/Cairo'})}</>}</p></div>
      <button className={styles.button} onClick={onClose}>{ar ? <ArrowRight size={17}/> : <ArrowLeft size={17}/>} {t('رجوع','Back')}</button>
    </header>
    {error && <AdminNotice retry={load}>{adminError(null,ar)}</AdminNotice>}
    {loading && !order ? <AdminLoading/> : order && <>
      <section className={styles.delivery} aria-label={t('موعد التوصيل المطلوب','Requested delivery schedule')}><CalendarClock/><div><small>{t('موعد التوصيل المطلوب · توقيت القاهرة','Requested delivery · Cairo time')}</small><strong><bdi>{deliveryLabel(order,locale)}</bdi></strong></div></section>
      <div className={styles.detailColumns}>
        <div>
          <section className={styles.section}><h2>{t('بيانات العميل','Customer details')}</h2><dl className={styles.facts}>
            <div><dt>{t('الاسم','Name')}</dt><dd>{order.customerName}</dd></div>
            <div><dt>{t('الهاتف','Phone')}</dt><dd><a href={`tel:${phone}`}><bdi>{order.customerPhone}</bdi></a></dd></div>
            <div className={styles.wide}><dt>{t('عنوان التوصيل','Delivery address')}</dt><dd>{order.customerAddress || t('غير مسجل','Not recorded')}</dd></div>
            <div className={styles.wide}><dt>{t('البريد الإلكتروني','Email')}</dt><dd>{order.customerEmail ? <a href={`mailto:${order.customerEmail}`}><bdi>{order.customerEmail}</bdi></a> : t('غير مسجل','Not recorded')}</dd></div>
            <div><dt>{t('التواصل المفضل','Preferred contact')}</dt><dd>{order.preferredContact === 'whatsapp' ? t('واتساب','WhatsApp') : ['call','phone'].includes(order.preferredContact || '') ? t('مكالمة هاتفية','Phone call') : t('غير مسجل','Not recorded')}</dd></div>
            <div><dt>{t('طريقة الدفع','Payment method')}</dt><dd>{order.paymentMethod === 'cash_on_delivery' ? t('عند الاستلام','Cash on delivery') : order.paymentMethod === 'online_payment' ? t('تحويل / دفع أونلاين','Transfer / online') : t('غير مسجل','Not recorded')}</dd></div>
          </dl><div className={styles.customerActions}><a className={styles.button} href={`tel:${phone}`}><Phone size={16}/>{t('اتصال','Call')}</a>{whatsapp && <a className={styles.button} href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={16}/>{t('واتساب','WhatsApp')}</a>}{order.customerEmail && <a className={styles.button} href={`mailto:${order.customerEmail}`}><Mail size={16}/>{t('بريد','Email')}</a>}</div></section>
          <section className={styles.section}><h2>{t('ملاحظات العميل','Customer notes')}</h2><p className={styles.notes}>{order.specialRequests || t('لا توجد ملاحظات مسجلة.','No notes recorded.')}</p></section>
          <section className={styles.section}><h2>{t('المنتجات','Items')} <span className={styles.muted}>({lines.reduce((sum,line) => sum + line.quantity,0)})</span></h2>{lines.length ? <ul className={styles.items}>{lines.map((line,i) => <li key={i}><div>{ar ? line.nameAr || line.name : line.name}<small>{t('الكمية','Qty')} {line.quantity} × {money(line.price)}</small></div><strong>{money(Math.round(Number(line.price)*100)*line.quantity/100)}</strong></li>)}</ul> : <p className={styles.muted}>{t('بنود الطلب غير مسجلة.','Order items are not recorded.')}</p>}</section>
        </div>
        <div>
          <section className={styles.section}><h2>{t('ملخص المبلغ','Order total')}</h2><dl className={styles.totals}>
            <div><dt>{t('إجمالي المنتجات','Products subtotal')}</dt><dd>{money(order.subtotal)}</dd></div>
            <div><dt>{t('الخصم','Discount')}{order.couponCode && <> · <bdi>{order.couponCode}</bdi></>}</dt><dd>{money(order.discountAmount)}</dd></div>
            <div><dt>{t('رسوم التوصيل','Delivery fee')}</dt><dd>{money(order.deliveryFee)}</dd></div>
            <div className={styles.grandTotal}><dt>{t('الإجمالي','Total')}</dt><dd>{money(order.total)}</dd></div>
          </dl></section>
          <section className={styles.section}><h2>{t('التحصيل','Collection')}</h2><dl className={styles.totals}><div><dt>{t('إجمالي المحصل','Total received')}</dt><dd>{money(order.finance?.received)}</dd></div><div><dt>{t('المسترد','Refunded')}</dt><dd>{money(order.finance?.refunded)}</dd></div></dl><p className={`${styles.muted} ${styles.notes}`}>{t('طريقة الدفع لا تعني تأكيد استلام المال.','Payment method does not confirm receipt of money.')}</p></section>
        </div>
      </div>
      <details ref={finance} className={styles.finance}><summary>{t('إدارة الحالة والحسابات وسجل التغييرات','Manage status, finances & history')}<ChevronDown size={18}/></summary><OrderFinancePanel order={order} locale={locale} onSaved={() => {onSaved();load();}}/></details>
      <footer className={styles.detailFooter}><div><span className={styles.muted}>{t('الإجمالي','Total')}</span><strong>{money(order.total)}</strong></div><div className={styles.actions}><button className={styles.button} onClick={load} disabled={loading} aria-label={t('تحديث تفاصيل الطلب','Refresh order details')}><RefreshCw size={16}/></button><button className={`${styles.button} ${styles.primary}`} onClick={showFinance}>{t('إدارة الطلب','Manage order')}</button></div></footer>
    </>}
  </article>;
}
