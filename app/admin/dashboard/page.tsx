'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Wallet } from 'lucide-react';
import { adminFetch, adminError, useAdmin } from './components/AdminContext';
import { useAdminQuery } from './components/useAdminQuery';
import { AdminLoading, AdminNotice, AdminPageHeader } from './components/AdminUI';
import { formatMoney } from './components/OrderFinancePanel';
import type { FinanceReport } from './finance/page';
import styles from './components/Finance.module.css';
export default function DashboardPage() {
  const {ar,locale,t} = useAdmin(), {params,update} = useAdminQuery();
  const start=params.get('startDate')||'', end=params.get('endDate')||'';
  const query=new URLSearchParams({...start&&{startDate:start},...end&&{endDate:end}}).toString();
  const [report,setReport]=useState<FinanceReport|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState('');
  const load=useCallback(async()=>{setLoading(true);setError('');setReport(null);try {const r=await adminFetch(`/api/admin/finance?${query}`,{cache:'no-store'});if(!r.ok) throw new Error();setReport(await r.json());}catch(e){setError(adminError(e,ar));}finally{setLoading(false);}},[query,ar]);
  useEffect(()=>{load();},[load]);
  const values=report ? [
    {label:t('صافي المبيعات المكتملة','Completed net sales'),value:formatMoney(report.completed.sales,locale),note:t('بعد الخصم والاسترداد، دون رسوم التوصيل','After discounts/refunds, excluding delivery'),href:`/admin/dashboard/finance?${query}&view=completed`},
    {label:t('صافي التحصيل','Net collected'),value:formatMoney(report.cash.net,locale),note:t('المحصل ناقص المسترد','Receipts minus refunds'),href:`/admin/dashboard/finance?${query}&view=cash`},
    {label:t('الربح','Profit'),value:formatMoney(report.completed.profit,locale),note:t('للطلبات المكتملة ماليًا فقط','Financially complete records only'),href:`/admin/dashboard/finance?${query}&view=completed`},
    {label:t('طلبات متوقعة','Expected orders'),value:String(report.expected.count),note:t('جديدة أو قيد التجهيز','Pending or processing'),href:`/admin/dashboard/orders?${query}&status=EXPECTED`},
  ] : [];
  return <div className={styles.workspace}>
    <AdminPageHeader title={t('لوحة التحكم','Dashboard')} description={t('متابعة الطلبات والمبيعات والتحصيل من نفس البيانات.','Track orders, sales and collection from the same data.')}><Link className={styles.button} href={`/admin/dashboard/finance?${query}`}><Wallet size={16}/>{t('المالية','Finance')}</Link><button disabled={loading} onClick={load} aria-label={t('تحديث','Refresh')}><RefreshCw size={18}/></button></AdminPageHeader>
    <div className={styles.toolbar}><label>{t('من تاريخ','From date')}<input type="date" value={start} max={end||undefined} onChange={e=>update({startDate:e.target.value})}/></label><label>{t('إلى تاريخ','To date')}<input type="date" value={end} min={start||undefined} onChange={e=>update({endDate:e.target.value})}/></label><a className={styles.button} href={`/api/orders/export?${query}`}>{t('تصدير الحسابات','Export finances')}</a></div>
    {error ? <AdminNotice retry={load}>{error}</AdminNotice> : loading ? <AdminLoading/> : report && <>
      <div className={styles.metrics}>{values.map(m=><Link key={m.label} href={m.href} className={`${styles.metric} ${styles.metricLink}`}><span>{m.label}</span><strong>{m.value}</strong><small>{m.note}</small></Link>)}</div>
      {report.completed.missing>0 && <p className={styles.negative}>{t(`${report.completed.missing} طلب مكتمل بحسابات ناقصة. لا تدخل الأرباح المجهولة في إجمالي الربح.`,`${report.completed.missing} completed orders have incomplete finances. Unknown profit is excluded from totals.`)}</p>}
      <div className={styles.sectionHead}><h2>{t('متابعة العمل','Operations')}</h2></div><div className={styles.breakdown}>
        <div><Link href={`/admin/dashboard/orders?${query}`}>{t('كل الطلبات','All orders')}</Link><strong>{report.count}</strong></div>
        <div><Link href={`/admin/dashboard/orders?${query}&status=COMPLETED`}>{t('طلبات مكتملة','Completed orders')}</Link><strong>{report.completed.count}</strong></div>
        <div><Link href={`/admin/dashboard/orders?${query}&status=CANCELLED`}>{t('طلبات ملغاة','Cancelled orders')}</Link><strong>{report.count-report.completed.count-report.expected.count}</strong></div>
        <div><Link href="/admin/dashboard/products">{t('منتجات منشورة','Published products')}</Link><strong>{report.setup.products}</strong></div>
        <div><Link href="/admin/dashboard/products?costs=missing">{t('منتجات تحتاج استكمال التكلفة','Products needing costs')}</Link><strong>{report.setup.missingCosts}</strong></div>
      </div><p>{t('الفترة حسب إنشاء الطلب، بتوقيت القاهرة. الأرباح والمخصصات لا تعني وصول المال.','Period uses order creation date, Cairo time. Profit and allocations do not confirm receipt of money.')}</p>
    </>}
  </div>;
}
