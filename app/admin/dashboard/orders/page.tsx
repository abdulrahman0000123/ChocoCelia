'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CalendarClock, Phone, Plus, RefreshCw, SlidersHorizontal, Wallet } from 'lucide-react';
import { adminFetch, adminError, useAdmin } from '../components/AdminContext';
import { useAdminQuery } from '../components/useAdminQuery';
import { AdminLoading, AdminNotice } from '../components/AdminUI';
import { OrderDetail } from '../components/OrderDetail';
import { deliveryLabel, type AdminOrder } from '../components/OrderExperience';
import { formatMoney, statusLabel } from '../components/OrderFinancePanel';
import { SpecialOrder } from '../components/SpecialOrder';
import styles from '../components/AdminExperience.module.css';

export default function OrdersPage() {
  const {ar,locale,t} = useAdmin();
  const {params,update} = useAdminQuery();
  const status = params.get('status') || '', search = params.get('search') || '', start = params.get('startDate') || '', end = params.get('endDate') || '';
  const selectedId = params.get('order');
  const page = Math.max(1,parseInt(params.get('page') || '1',10)||1);
  const [orders,setOrders] = useState<AdminOrder[]>([]), [loading,setLoading] = useState(true), [error,setError] = useState('');
  const [datesOpen,setDatesOpen] = useState(Boolean(start || end));
  const version = useRef(0), returnScroll = useRef(0), lastSelected = useRef<string|null>(null);
  const trigger = useRef<HTMLButtonElement|null>(null);
  const load = useCallback(async () => {
    const current = ++version.current;
    setLoading(true);setError('');
    try {const r = await adminFetch('/api/orders',{cache:'no-store'});if(!r.ok) throw new Error();const data = await r.json();if(current === version.current) setOrders(data);}
    catch(e) {if(current === version.current) {setOrders([]);setError(adminError(e,ar));}} finally {if(current === version.current) setLoading(false);}
  },[ar]);
  useEffect(() => {const requestVersion = version;load();return () => {requestVersion.current++;};},[load]);
  useEffect(() => {
    if (!selectedId && lastSelected.current) requestAnimationFrame(() => {window.scrollTo({top:returnScroll.current,behavior:'instant'});trigger.current?.focus({preventScroll:true});});
    lastSelected.current = selectedId;
  },[selectedId]);
  const openOrder = (id:string,button:HTMLButtonElement) => {returnScroll.current = window.scrollY;trigger.current = button;update({order:id});};
  const filtered = orders.filter(o => {
    const date = new Date(o.createdAt).toLocaleDateString('en-CA',{timeZone:'Africa/Cairo'});
    return (!status || (status === 'EXPECTED' ? ['PENDING','PROCESSING'].includes(o.status) : o.status === status)) && (!start || date >= start) && (!end || date <= end) && [o.customerName,o.customerPhone,o.customerEmail,o.customerAddress,o.id].some(value => value?.toLowerCase().includes(search.trim().toLowerCase()));
  });
  const pages = Math.max(1,Math.ceil(filtered.length/25)), currentPage = Math.min(page,pages);
  const visibleOrders = filtered.slice((currentPage-1)*25,currentPage*25);
  const currency = t('ج.م','EGP');
  const statusBadge = (o:AdminOrder) => <span className={styles.status} data-status={o.status}>{statusLabel(o.status,ar)}</span>;
  const review = (o:AdminOrder) => <button className={styles.button} onClick={e => openOrder(o.id,e.currentTarget)} aria-label={t(`تفاصيل طلب ${o.customerName}`,`View ${o.customerName}'s order`)}>{t('التفاصيل','Details')}</button>;
  return <div className={styles.workspace}>
    <div hidden={Boolean(selectedId)}>
      <header className={styles.header}><div><h1>{t('الطلبات','Orders')}</h1><p>{t('متابعة العملاء ومواعيد التوصيل.','Customers and delivery schedules at a glance.')}</p></div><div className={styles.actions}>
        <button className={`${styles.button} ${styles.primary}`} onClick={() => update({manual:params.get('manual') ? null:'1'})}><Plus size={16}/>{t('طلب يدوي','Manual order')}</button>
        <Link className={styles.button} href={`/admin/dashboard/finance?${new URLSearchParams({...start && {startDate:start},...end && {endDate:end}})}`}><Wallet size={16}/>{t('المالية','Finance')}</Link>
        <button className={styles.button} disabled={loading} onClick={load} aria-label={t('تحديث الطلبات','Refresh orders')}><RefreshCw size={17}/></button>
      </div></header>
      <div className={styles.toolbar}>
        <label>{t('البحث','Search')}<input type="search" value={search} placeholder={t('العميل، الهاتف، رقم الطلب','Customer, phone, order ID')} onChange={e=>update({search:e.target.value,page:'1'})}/></label>
        <label>{t('حالة الطلب','Order status')}<select value={status} onChange={e=>update({status:e.target.value,page:'1'})}><option value="">{t('كل الحالات','All statuses')}</option><option value="EXPECTED">{t('جديد وقيد التجهيز','Pending & processing')}</option>{['PENDING','PROCESSING','COMPLETED','CANCELLED'].map(s=><option key={s} value={s}>{statusLabel(s,ar)}</option>)}</select></label>
        <button className={styles.button} aria-expanded={datesOpen} aria-controls="order-date-filters" onClick={() => setDatesOpen(!datesOpen)}><SlidersHorizontal size={16}/>{t('الفترة','Dates')}{(start || end) && ' •'}</button>
      </div>
      {datesOpen && <div className={styles.dateFilters} id="order-date-filters"><label>{t('أُنشئ من تاريخ','Created from')}<input type="date" value={start} max={end||undefined} onChange={e=>update({startDate:e.target.value,page:'1'})}/></label><label>{t('إلى تاريخ','Until')}<input type="date" value={end} min={start||undefined} onChange={e=>update({endDate:e.target.value,page:'1'})}/></label>{(start || end) && <button className={styles.button} onClick={() => update({startDate:null,endDate:null,page:'1'})}>{t('كل الفترات','All dates')}</button>}</div>}
      {params.get('manual') === '1' && <SpecialOrder locale={locale} open onClose={()=>update({manual:null})} onSaved={load}/>}
      {error ? <AdminNotice retry={load}>{error}</AdminNotice> : loading ? <AdminLoading/> : <>
        <div className={styles.ledgerHead}><span>{filtered.length} {t('طلب','orders')}</span><span>{t('مواعيد التوصيل بتوقيت القاهرة','Delivery times in Cairo time')}</span></div>
        {!filtered.length ? <div className={styles.empty}><h2>{t('لا توجد طلبات مطابقة','No matching orders')}</h2><p>{t('جرّب تغيير البحث أو الفترة أو الحالة.','Try changing the search, dates or status.')}</p>{(search || status || start || end) && <button className={styles.button} onClick={() => update({search:null,status:null,startDate:null,endDate:null,page:'1'})}>{t('مسح الفلاتر','Clear filters')}</button>}</div> : <>
          <div className={styles.desktopOrders}><table><thead><tr>{[t('الطلب والعميل','Order & customer'),t('الحالة','Status'),t('الإجمالي','Total'),t('التوصيل المطلوب','Requested delivery'),t('التحصيل','Collection'),t('التفاصيل','Details')].map(h=><th scope="col" key={h}>{h}</th>)}</tr></thead><tbody>{visibleOrders.map(o=><tr key={o.id}>
            <td><strong>{o.customerName}</strong><small><bdi>#{o.id.slice(-8).toUpperCase()}</bdi> · {new Date(o.createdAt).toLocaleDateString(ar?'ar-EG':'en-GB',{timeZone:'Africa/Cairo'})}</small><small><a href={`tel:${o.customerPhone}`}><bdi>{o.customerPhone}</bdi></a></small></td>
            <td>{statusBadge(o)}</td><td><strong>{formatMoney(o.total,locale)}</strong><small>{currency}</small></td><td><bdi>{deliveryLabel(o,locale)}</bdi></td><td>{o.finance ? formatMoney(Number(o.finance.received)-Number(o.finance.refunded),locale) : t('غير مسجل','Not recorded')}<small>{t('صافي المحصل','Net received')}</small></td><td>{review(o)}</td>
          </tr>)}</tbody></table></div>
          <div className={styles.mobileOrders}>{visibleOrders.map(o => <article className={styles.orderRow} key={o.id}>
            <div className={styles.rowTop}><strong>{o.customerName}</strong>{statusBadge(o)}</div>
            <div className={styles.rowMeta}><bdi>#{o.id.slice(-8).toUpperCase()}</bdi><strong>{formatMoney(o.total,locale)} {currency}</strong></div>
            <div className={styles.scheduleLine}><CalendarClock size={14}/><bdi>{deliveryLabel(o,locale)}</bdi></div>
            <div className={styles.rowBottom}><span>{(o.finance?.lines ?? o.items)?.reduce((sum,line) => sum + line.quantity,0) ?? '—'} {t('قطعة','items')} · {o.requestKey?.startsWith('admin-') ? t('يدوي','Manual') : o.requestKey ? t('الموقع','Storefront') : t('سابق','Legacy')}</span><div className={styles.actions}><a className={styles.button} href={`tel:${o.customerPhone}`} aria-label={t(`اتصال بـ ${o.customerName}`,`Call ${o.customerName}`)}><Phone size={15}/></a>{review(o)}</div></div>
          </article>)}</div>
        </>}
        <div className={styles.pagination}><span>{t('الأحدث أولًا','Newest first')}</span><div className={styles.actions}><button className={styles.button} disabled={currentPage<=1} onClick={()=>update({page:String(currentPage-1)})}>{t('السابق','Previous')}</button><span>{currentPage} / {pages}</span><button className={styles.button} disabled={currentPage>=pages} onClick={()=>update({page:String(currentPage+1)})}>{t('التالي','Next')}</button></div></div>
      </>}
    </div>
    {selectedId && <OrderDetail key={selectedId} id={selectedId} onClose={()=>update({order:null})} onSaved={load}/>}
  </div>;
}
