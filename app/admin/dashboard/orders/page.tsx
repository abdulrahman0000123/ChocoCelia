'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Plus, Wallet } from 'lucide-react';
import { adminFetch, adminError, useAdmin } from '../components/AdminContext';
import { useAdminQuery } from '../components/useAdminQuery';
import { AdminLoading, AdminNotice, AdminPageHeader } from '../components/AdminUI';
import { OrderDetail } from '../components/OrderDetail';
import { formatMoney, statusLabel, type FinancialOrder } from '../components/OrderFinancePanel';
import { SpecialOrder } from '../components/SpecialOrder';
import styles from '../components/Finance.module.css';

type Order = FinancialOrder & {customerEmail?:string;customerAddress:string;requestKey?:string|null;paymentMethod?:string;requestedDeliveryDate?:string;requestedDeliveryTime?:string;};
export default function OrdersPage() {
  const {ar,locale,t} = useAdmin();
  const {params,update} = useAdminQuery();
  const status = params.get('status') || '', search = params.get('search') || '', start = params.get('startDate') || '', end = params.get('endDate') || '';
  const page = Math.max(1,parseInt(params.get('page') || '1',10)||1);
  const [orders,setOrders] = useState<Order[]>([]), [loading,setLoading] = useState(true), [error,setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true);setError('');
    try {const r = await adminFetch('/api/orders',{cache:'no-store'});if(!r.ok) throw new Error();setOrders(await r.json());}
    catch(e) {setOrders([]);setError(adminError(e,ar));} finally {setLoading(false);}
  },[ar]);
  useEffect(() => {load();},[load]);
  const filtered = orders.filter(o => {
    const date = new Date(o.createdAt).toLocaleDateString('en-CA',{timeZone:'Africa/Cairo'});
    return (!status || (status === 'EXPECTED' ? ['PENDING','PROCESSING'].includes(o.status) : o.status === status)) && (!start || date >= start) && (!end || date <= end) && [o.customerName,o.customerPhone,o.customerEmail,o.customerAddress,o.id].some(value => value?.toLowerCase().includes(search.toLowerCase()));
  });
  const pages = Math.max(1,Math.ceil(filtered.length/25));
  const currentPage = Math.min(page,pages);
  return <div className={styles.workspace}>
    <AdminPageHeader title={t('الطلبات','Orders')} description={t('العملاء والتوصيل والحسابات في سجل واحد.','Customers, delivery and finances in one ledger.')}>
      <button className={styles.primary} onClick={() => update({manual:params.get('manual') ? null:'1'})}><Plus size={16}/>{t('طلب يدوي','Manual order')}</button>
      <Link className={styles.button} href={`/admin/dashboard/finance?${new URLSearchParams({...start && {startDate:start},...end && {endDate:end}})}`}><Wallet size={16}/>{t('الملخص المالي','Finance summary')}</Link>
      <button disabled={loading} onClick={load} aria-label={t('تحديث الطلبات','Refresh orders')}><RefreshCw size={18}/></button>
    </AdminPageHeader>
    <div className={styles.toolbar}>
      <label>{t('البحث','Search')}<input type="search" value={search} placeholder={t('العميل، الهاتف، رقم الطلب','Customer, phone, order ID')} onChange={e=>update({search:e.target.value,page:'1'})}/></label>
      <label>{t('الحالة','Status')}<select value={status} onChange={e=>update({status:e.target.value,page:'1'})}><option value="">{t('كل الحالات','All statuses')}</option><option value="EXPECTED">{t('طلبات متوقعة','Expected orders')}</option>{['PENDING','PROCESSING','COMPLETED','CANCELLED'].map(s=><option key={s} value={s}>{statusLabel(s,ar)}</option>)}</select></label>
      <label>{t('من تاريخ','From date')}<input type="date" value={start} max={end||undefined} onChange={e=>update({startDate:e.target.value,page:'1'})}/></label>
      <label>{t('إلى تاريخ','To date')}<input type="date" value={end} min={start||undefined} onChange={e=>update({endDate:e.target.value,page:'1'})}/></label>
    </div>
    {params.get('manual') === '1' && <SpecialOrder locale={locale} open onClose={()=>update({manual:null})} onSaved={load}/>}
    {error ? <AdminNotice retry={load}>{error}</AdminNotice> : loading ? <AdminLoading/> : <>
      <div className={styles.sectionHead}><h2>{t('سجل الطلبات','Order ledger')}</h2><span className={styles.badge}>{filtered.length} {t('طلب','orders')}</span></div>
      <div className={styles.tableWrap}><table><thead><tr>{[t('الطلب والعميل','Order & customer'),t('الحالة','Status'),t('القيمة','Total'),t('التوصيل المطلوب','Requested delivery'),t('التحصيل','Collection'),t('التفاصيل','Details')].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{filtered.slice((currentPage-1)*25,currentPage*25).map(o=><tr key={o.id}>
        <td>{o.customerName}<small><bdi>#{o.id.slice(-8).toUpperCase()}</bdi> · {new Date(o.createdAt).toLocaleDateString(ar?'ar-EG':'en-GB',{timeZone:'Africa/Cairo'})}</small><small><a href={`tel:${o.customerPhone}`}><bdi>{o.customerPhone}</bdi></a> · {o.requestKey?.startsWith('admin-') ? t('يدوي','Manual') : o.requestKey ? t('الموقع','Storefront') : t('سجل سابق','Legacy')}</small></td>
        <td><span className={styles.badge}>{statusLabel(o.status,ar)}</span></td><td>{formatMoney(o.total,locale)}<small>{t('جنيه مصري','EGP')}</small></td><td><bdi>{o.requestedDeliveryDate || '—'} {o.requestedDeliveryTime}</bdi></td><td>{formatMoney(Number(o.finance?.received??0)-Number(o.finance?.refunded??0),locale)}<small>{t('صافي المحصل','Net received')}</small></td><td><button onClick={()=>update({order:o.id})}>{t('مراجعة','Review')}</button></td>
      </tr>)}</tbody></table>{!filtered.length && <div className={styles.empty}><h3>{t('لا توجد طلبات مطابقة','No matching orders')}</h3><p>{t('جرّب تغيير البحث أو الفترة أو الحالة.','Try changing the search, dates or status.')}</p></div>}</div>
      <div className={styles.footer}><span>{t('تاريخ إنشاء الطلب · توقيت القاهرة','Order creation date · Cairo time')}</span><div className={styles.actions}><button disabled={currentPage<=1} onClick={()=>update({page:String(currentPage-1)})}>{t('السابق','Previous')}</button><span>{currentPage} / {pages}</span><button disabled={currentPage>=pages} onClick={()=>update({page:String(currentPage+1)})}>{t('التالي','Next')}</button></div></div>
    </>}
    {params.get('order') && <OrderDetail id={params.get('order')!} onClose={()=>update({order:null})} onSaved={load}/>}
  </div>;
}
