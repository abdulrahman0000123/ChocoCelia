'use client';
import { useEffect, useRef, useState } from 'react';
import { Phone, X } from 'lucide-react';
import { adminError, adminFetch, useAdmin } from './AdminContext';
import { AdminLoading, AdminNotice } from './AdminUI';
import { OrderFinancePanel, formatMoney, type FinancialOrder } from './OrderFinancePanel';
import styles from './Finance.module.css';

type Order = FinancialOrder & {customerEmail?: string; customerAddress?: string; preferredContact?: string; requestedDeliveryDate?: string; requestedDeliveryTime?: string; paymentMethod?: string; specialRequests?: string; subtotal?: number; deliveryFee?: number; couponCode?: string; discountAmount?: number; items?: {quantity:number;price:number;product:{name:string;nameAr?:string}}[]};
export function OrderDetail({id, onClose, onSaved}: {id:string;onClose:()=>void;onSaved:()=>void}) {
  const { ar, locale, t } = useAdmin();
  const [order,setOrder] = useState<Order|null>(null), [error,setError] = useState('');
  const [revision,setRevision] = useState(0);
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {if(active) {setOrder(null);setError('');}});
    adminFetch(`/api/orders/${encodeURIComponent(id)}`,{cache:'no-store'}).then(async r => {if(!r.ok) throw new Error();return r.json();}).then(data => {if(active) {setOrder(data); requestAnimationFrame(() => ref.current?.scrollIntoView({block:'start',behavior:'instant'}));}}).catch(() => {if(active) setError('load');});
    return () => {active=false;};
  },[id,revision]);
  const lines = order?.finance?.lines ?? order?.items?.map(i => ({name:i.product.name,nameAr:i.product.nameAr || i.product.name,quantity:i.quantity,price:String(i.price)})) ?? [];
  return <section ref={ref} className={styles.detail} aria-label={t('تفاصيل الطلب','Order details')}>
    <div className={styles.sectionHead}><div><h2>{order?.customerName ?? t('تفاصيل الطلب','Order details')}</h2><p><bdi>#{id.slice(-8).toUpperCase()}</bdi></p></div><button onClick={onClose} aria-label={t('إغلاق التفاصيل','Close details')}><X size={18}/></button></div>
    {error ? <AdminNotice retry={() => setRevision(v=>v+1)}>{adminError(null,ar)}</AdminNotice> : !order ? <AdminLoading/> : <>
      <div className={styles.grid}>
        <div><h3>{t('بيانات العميل','Customer details')}</h3><p><a href={`tel:${order.customerPhone}`}><Phone size={14} className="inline"/> <bdi>{order.customerPhone}</bdi></a></p>{order.customerEmail && <p><a href={`mailto:${order.customerEmail}`}><bdi>{order.customerEmail}</bdi></a></p>}<p>{order.customerAddress}</p><p>{t('طريقة التواصل','Contact preference')}: {order.preferredContact === 'whatsapp' ? t('واتساب','WhatsApp') : order.preferredContact === 'phone' ? t('هاتف','Phone') : order.preferredContact ?? '—'}</p></div>
        <div><h3>{t('التوصيل والدفع','Delivery & payment')}</h3><p>{t('التوصيل المطلوب بتوقيت القاهرة','Requested delivery, Cairo time')}: <bdi>{order.requestedDeliveryDate ? `${order.requestedDeliveryDate} ${order.requestedDeliveryTime ?? ''}` : t('غير مسجل','Not recorded')}</bdi></p><p>{t('طريقة الدفع','Payment method')}: {order.paymentMethod === 'cash_on_delivery' ? t('عند الاستلام','Cash on delivery') : t('تحويل / دفع أونلاين','Transfer / online payment')}</p><p>{t('رسوم التوصيل على العميل','Customer delivery fee')}: {formatMoney(order.deliveryFee,locale)}</p>{order.couponCode && <p>{t('الخصم','Discount')}: {formatMoney(order.discountAmount,locale)} · <bdi>{order.couponCode}</bdi></p>}{order.specialRequests && <p>{t('ملاحظات العميل','Customer notes')}: {order.specialRequests}</p>}</div>
      </div>
      <div className={styles.tableWrap}><table><thead><tr>{[t('المنتج','Product'),t('الكمية','Quantity'),t('السعر','Price')].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{lines.map((line,i)=><tr key={i}><td>{ar ? line.nameAr : line.name}</td><td>{line.quantity}</td><td>{formatMoney(line.price,locale)}</td></tr>)}</tbody></table></div>
      <OrderFinancePanel order={order} locale={locale} onSaved={() => {onSaved();setRevision(v=>v+1);}}/>
    </>}
  </section>;
}
