'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { adminFetch, adminError, useAdmin } from '../../components/AdminContext';
import { AdminLoading, AdminNotice, AdminPageHeader } from '../../components/AdminUI';
import styles from '../../components/Finance.module.css';
const empty = {advertisingPct:'',developmentPct:'',deliveryCostBeniSuef:'',deliveryCostEastNile:''};
const feesEmpty = {deliveryFeeBeniSuef:'',deliveryFeeEastNile:''};
export default function FinanceSettingsPage() {
  const {ar,t} = useAdmin();
  const [settings,setSettings] = useState(empty), [fees,setFees] = useState(feesEmpty);
  const [loading,setLoading] = useState(true), [error,setError] = useState('');
  const [saving,setSaving] = useState(''), [feedback,setFeedback] = useState('');
  const load = useCallback(async () => {
    setLoading(true);setError('');
    try {
      const responses = await Promise.all([adminFetch('/api/admin/finance/settings'),adminFetch('/api/settings')]);
      if(responses.some(r=>!r.ok)) throw new Error();
      const [finance,site] = await Promise.all(responses.map(r=>r.json()));
      setSettings(Object.fromEntries(Object.keys(empty).map(key=>[key,finance[key] == null ? '':String(finance[key])])) as typeof empty);
      setFees(Object.fromEntries(Object.keys(feesEmpty).map(key=>[key,String(site[key]??0)])) as typeof feesEmpty);
    } catch(e) {setError(adminError(e,ar));} finally {setLoading(false);}
  },[ar]);
  useEffect(()=>{load();},[load]);
  async function save(e:React.FormEvent,kind:'finance'|'fees') {
    e.preventDefault();setSaving(kind);setFeedback('');setError('');
    try {
      const r = await adminFetch(kind==='finance'?'/api/admin/finance/settings':'/api/settings',{method:kind==='finance'?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(kind==='finance'?settings:fees)});
      const data = await r.json();if(!r.ok) throw new Error(data.error);
      setFeedback(t('تم الحفظ. تُطبق القيم على الطلبات الجديدة فقط.','Saved. Values apply to new orders only.'));
    } catch(e) {setError(adminError(e,ar));} finally {setSaving('');}
  }
  return <div className={styles.workspace}>
    <AdminPageHeader title={t('إعدادات المالية والتوصيل','Finance & delivery settings')} description={t('رسوم العميل منفصلة عن تكلفة التوصيل على المشروع. الطلبات السابقة تحتفظ بحساباتها.','Customer fees are separate from business delivery costs. Existing orders keep their saved finances.')}><Link className={styles.button} href="/admin/dashboard/finance">{t('المالية','Finance')}</Link><Link className={styles.button} href="/admin/dashboard/settings">{t('إعدادات الموقع','Site settings')}</Link></AdminPageHeader>
    {error && <AdminNotice retry={load}>{error}</AdminNotice>}
    {loading ? <AdminLoading/> : error && !settings.advertisingPct ? null : <>
      <form className={styles.settingsPanel} onSubmit={e=>save(e,'fees')}><h2>{t('رسوم التوصيل على العميل','Delivery fees charged to customers')}</h2><p>{t('تظهر في صفحة الدفع وتدخل ضمن إجمالي الطلب.','Shown at checkout and included in the order total.')}</p><div className={styles.grid}>{(Object.keys(feesEmpty) as (keyof typeof feesEmpty)[]).map((key,i)=><label key={key}>{i===0?t('داخل بني سويف · جنيه','Beni Suef · EGP'):t('شرق النيل · جنيه','East Nile · EGP')}<input disabled={Boolean(saving)||loading} required type="number" min="0" max="999999999.99" step="0.01" value={fees[key]} onChange={e=>setFees({...fees,[key]:e.target.value})}/></label>)}</div><button className={styles.primary} disabled={Boolean(saving)||Boolean(error)}>{saving==='fees'?t('جارٍ الحفظ…','Saving…'):t('حفظ رسوم العميل','Save customer fees')}</button></form>
      <form className={styles.settingsPanel} onSubmit={e=>save(e,'finance')}><h2>{t('التكلفة والمخصصات على المشروع','Business costs & allocations')}</h2><p>{t('المخصصات قيم حسابية، وليست أرصدة بنكية. اترك تكلفة التوصيل فارغة إذا لم تكن معروفة.','Allocations are calculated values, not bank balances. Leave delivery costs blank if unknown.')}</p><div className={styles.grid}>{(Object.keys(empty) as (keyof typeof empty)[]).map((key,i)=><label key={key}>{[t('الإعلانات من صافي مبيعات المنتجات %','Advertising on net product sales %'),t('التطوير من الربح الموجب %','Development on positive profit %'),t('تكلفة التوصيل داخل بني سويف · جنيه','Beni Suef business delivery cost · EGP'),t('تكلفة التوصيل شرق النيل · جنيه','East Nile business delivery cost · EGP')][i]}<input disabled={Boolean(saving)} required={i<2} type="number" min="0" max={i<2?'50':'999999999.99'} step="0.01" value={settings[key]} onChange={e=>setSettings({...settings,[key]:e.target.value})}/></label>)}</div><button disabled={Boolean(saving)||Boolean(error)} className={styles.primary}>{saving==='finance'?t('جارٍ الحفظ…','Saving…'):t('حفظ التكلفة والمخصصات','Save costs & allocations')}</button></form>
      {feedback && <p role="status" className={styles.positive}>{feedback}</p>}
    </>}
  </div>;
}
