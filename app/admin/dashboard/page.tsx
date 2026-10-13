'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpLeft, ArrowUpRight, RefreshCw, ShoppingBag, Wallet } from 'lucide-react';
import { adminFetch, adminError, useAdmin } from './components/AdminContext';
import { useAdminQuery } from './components/useAdminQuery';
import { AdminExport, AdminLoading, AdminNotice } from './components/AdminUI';
import { formatMoney, statusLabel } from './components/OrderFinancePanel';
import type { FinanceReport } from './finance/page';
import styles from './components/AdminExperience.module.css';

export default function DashboardPage() {
  const {ar,locale,t} = useAdmin(), {params,update} = useAdminQuery();
  const start=params.get('startDate')||'', end=params.get('endDate')||'';
  const query=new URLSearchParams({...start&&{startDate:start},...end&&{endDate:end}}).toString();
  const [report,setReport]=useState<FinanceReport|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState('');
  const version = useRef(0);
  const load=useCallback(async()=>{
    const current = ++version.current;
    setLoading(true);setError('');setReport(null);
    try {const r=await adminFetch(`/api/admin/finance?${query}`,{cache:'no-store'});if(!r.ok) throw new Error();const data = await r.json();if(current === version.current) setReport(data);}
    catch(e){if(current === version.current) setError(adminError(e,ar));}
    finally{if(current === version.current) setLoading(false);}
  },[query,ar]);
  useEffect(()=>{const requestVersion = version;load();return () => {requestVersion.current++;};},[load]);
  const values=report ? [
    {label:t('صافي المبيعات المكتملة','Completed net sales'),value:formatMoney(report.completed.sales,locale),note:t('بعد الخصم والاسترداد، دون التوصيل','After discounts/refunds, excluding delivery'),href:`/admin/dashboard/finance?${query}&view=completed`},
    {label:t('صافي التحصيل','Net collected'),value:formatMoney(report.cash.net,locale),note:t('المحصل ناقص المسترد','Receipts minus refunds'),href:`/admin/dashboard/finance?${query}&view=cash`},
    {label:t('الربح','Profit'),value:formatMoney(report.completed.profit,locale),note:t('للحسابات المكتملة فقط','Complete financial records only'),href:`/admin/dashboard/finance?${query}&view=completed`},
    {label:t('طلبات تحتاج متابعة','Orders to follow up'),value:String(report.expected.count),note:t('جديدة أو قيد التجهيز','Pending or processing'),href:`/admin/dashboard/orders?${query}&status=EXPECTED`},
  ] : [];
  const operations = report ? [
    [t('كل الطلبات','All orders'),report.count,`/admin/dashboard/orders?${query}`],
    [t('طلبات مكتملة','Completed orders'),report.completed.count,`/admin/dashboard/orders?${query}&status=COMPLETED`],
    [t('طلبات ملغاة','Cancelled orders'),report.count-report.completed.count-report.expected.count,`/admin/dashboard/orders?${query}&status=CANCELLED`],
    [t('المنتجات','Products'),report.setup.products,'/admin/dashboard/products'],
    [t('منتجات تحتاج استكمال التكلفة','Products needing costs'),report.setup.missingCosts,'/admin/dashboard/products?costs=missing'],
  ] as const : [];
  const Arrow = ar ? ArrowUpLeft : ArrowUpRight;
  return <div className={styles.workspace}>
    <header className={styles.header}><div><h1>{t('لوحة التحكم','Dashboard')}</h1><p>{t('نظرة على الطلبات والمبيعات والتحصيل.','Orders, sales and collections at a glance.')}</p></div><div className={styles.actions}><Link className={`${styles.button} ${styles.primary}`} href="/admin/dashboard/orders"><ShoppingBag size={16}/>{t('الطلبات','Orders')}</Link><Link className={styles.button} href={`/admin/dashboard/finance?${query}`}><Wallet size={16}/>{t('المالية','Finance')}</Link><button className={styles.button} disabled={loading} onClick={load} aria-label={t('تحديث','Refresh')}><RefreshCw size={17}/></button></div></header>
    <div className={styles.dateFilters}><label>{t('من تاريخ','From date')}<input type="date" value={start} max={end||undefined} onChange={e=>update({startDate:e.target.value})}/></label><label>{t('إلى تاريخ','To date')}<input type="date" value={end} min={start||undefined} onChange={e=>update({endDate:e.target.value})}/></label><span className={styles.export}><AdminExport query={query}/></span></div>
    {error ? <AdminNotice retry={load}>{error}</AdminNotice> : loading ? <AdminLoading/> : report && <>
      <div className={styles.overviewMetrics}>{values.map(m=><Link key={m.label} href={m.href}><span>{m.label}</span><strong>{m.value}</strong><small>{m.note}</small></Link>)}</div>
      <p className={styles.caption}>{t('المبالغ بالجنيه المصري · الفترة حسب إنشاء الطلب بتوقيت القاهرة','Amounts in EGP · Period by order creation, Cairo time')}</p>
      {report.completed.missing>0 && <p className={styles.warning}>{t(`${report.completed.missing} طلب مكتمل بحسابات ناقصة. الأرباح المجهولة غير مشمولة.`,`${report.completed.missing} completed orders have incomplete finances. Unknown profit is excluded.`)}</p>}
      <section className={styles.section}><h2>{t('متابعة العمل','Operations')}</h2><div className={styles.operations}>{operations.map(([label,count,href]) => <Link href={href} key={href}><span>{label}</span><span className={styles.actions}><strong>{count}</strong><Arrow size={15}/></span></Link>)}</div></section>
      <section className={styles.section}><div className={styles.header}><h2>{t('أحدث الطلبات','Recent orders')}</h2><Link className={styles.button} href="/admin/dashboard/orders">{t('عرض الكل','View all')}</Link></div>{report.recent.length ? <div className={styles.recent}>{[...report.recent].sort((a,b) => new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()).slice(0,4).map(o => <Link key={o.id} href={`/admin/dashboard/orders?order=${encodeURIComponent(o.id)}`}><div><strong>{o.customerName}</strong><small><bdi>#{o.id.slice(-8).toUpperCase()}</bdi> · {statusLabel(o.status,ar)}</small></div><span>{formatMoney(o.total,locale)} {t('ج.م','EGP')}<Arrow size={15}/></span></Link>)}</div> : <p className={styles.caption}>{t('ستظهر الطلبات الجديدة هنا تلقائيًا.','New orders will appear here automatically.')}</p>}</section>
      <p className={styles.caption}>{t('الأرباح والمخصصات لا تعني وصول المال. راجع التحصيل الفعلي في المالية.','Profit and allocations do not confirm receipt of money. Review collections in Finance.')}</p>
    </>}
  </div>;
}
