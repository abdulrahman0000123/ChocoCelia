'use client';
import { adminFetch, adminError } from './AdminContext';
import { useEffect, useRef, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { CostFields, emptyCosts, type CostDraft } from './CostFields';
import styles from './Finance.module.css';

type Line = {productId?:string;name:string;price:string;quantity:number;costs:CostDraft};
export function SpecialOrder({locale,onSaved,open,onClose}: {locale:'ar'|'en';onSaved:()=>void;open?:boolean;onClose?:()=>void}) {
  const ar = locale === 'ar', t = (a:string,e:string) => ar ? a:e;
  const [catalog,setCatalog] = useState<{id:string;name:string;nameAr:string;price:number;costing:CostDraft|null}[]>([]);
  useEffect(() => {adminFetch('/api/products').then(r => r.ok ? r.json() : []).then(setCatalog).catch(() => {});},[]);
  const [lines,setLines] = useState<Line[]>([{name:'',price:'',quantity:1,costs:{...emptyCosts}}]);
  const [name,setName] = useState(''),[phone,setPhone] = useState(''),[address,setAddress] = useState('');
  const [fee,setFee] = useState('0'),[delivery,setDelivery] = useState(''),[reason,setReason] = useState('');
  const [busy,setBusy] = useState(false),[message,setMessage] = useState('');
  const key = useRef<{payload:string;key:string}|null>(null);
  const update = (i:number,field:Partial<Line>) => setLines(lines.map((l,n) => i === n ? {...l,...field}:l));
  async function submit(e:React.FormEvent) {
    e.preventDefault();setBusy(true);setMessage('');
    const body = {customerName:name,customerPhone:phone,customerAddress:address,deliveryFee:fee,deliveryCost:delivery,reason,lines:lines.map(l => ({...l,costs:Object.values(l.costs).every(v => v === '') ? null:l.costs}))};
    const payload = JSON.stringify(body); if(key.current?.payload !== payload) key.current = {payload,key:crypto.randomUUID()};
    try {const r = await adminFetch('/api/admin/finance/orders',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':key.current.key},body:payload});const data = await r.json();if(!r.ok) throw new Error(data.error);
      setMessage(t('تم تسجيل الطلب وحساباته.','Order and finances saved.'));setName('');setPhone('');setAddress('');setReason('');setLines([{name:'',price:'',quantity:1,costs:{...emptyCosts}}]);key.current=null;onSaved();
    } catch(e) {setMessage(adminError(e,ar));} finally {setBusy(false);}
  }
  return <details className={styles.settings} open={open}><button type="button" onClick={onClose}>{t('إغلاق الطلب اليدوي','Close manual order')}</button><summary><Plus size={18}/>{t('طلب خاص من خارج الموقع','Special order from outside the storefront')}</summary><p>{t('اختياري لطلبات الهاتف والمنتجات المخصصة. طلبات الموقع تدخل تلقائيًا ولا تحتاج لإعادة تسجيل.','Optional for phone orders and custom products. Storefront orders are recorded automatically.')}</p><form onSubmit={submit}><div className={styles.grid}>
    <label>{t('اسم العميل','Customer name')}<input required maxLength={200} value={name} onChange={e => setName(e.target.value)}/></label><label>{t('رقم الهاتف','Phone')}<input required type="tel" dir="ltr" value={phone} onChange={e => setPhone(e.target.value)}/></label><label>{t('العنوان','Address')}<input required maxLength={1000} value={address} onChange={e => setAddress(e.target.value)}/></label><label>{t('سبب تسجيل الطلب الخاص','Special order reason')}<input required minLength={3} maxLength={500} value={reason} onChange={e => setReason(e.target.value)}/></label></div>
    {lines.map((line,i) => <div className={styles.detail} key={i}><div className={styles.sectionHead}><h3>{t(`بند ${i+1}`,`Item ${i+1}`)}</h3>{lines.length>1 && <button type="button" aria-label={t('حذف البند','Remove item')} onClick={() => setLines(lines.filter((_,n) => n !== i))}><Trash2 size={16}/></button>}</div><label>{t('اختيار منتج محفوظ أو مخصص','Choose a saved or custom product')}<select value={line.productId || ''} onChange={e => {
      const p = catalog.find(p => p.id === e.target.value);
      update(i,p ? {productId:p.id,name:ar ? p.nameAr || p.name:p.name,price:String(p.price),costs:p.costing ? Object.fromEntries(Object.keys(emptyCosts).map(k => [k,String(p.costing![k as keyof CostDraft])])) as CostDraft : {...emptyCosts}} : {productId:undefined});
    }}><option value="">{t('منتج مخصص','Custom product')}</option>{catalog.map(p => <option key={p.id} value={p.id}>{ar ? p.nameAr || p.name:p.name}</option>)}</select></label><div className={styles.grid}><label>{t('اسم المنتج','Product name')}<input required readOnly={Boolean(line.productId)} maxLength={200} value={line.name} onChange={e => update(i,{name:e.target.value})}/></label><label>{t('سعر الوحدة','Unit price')}<input required readOnly={Boolean(line.productId)} type="number" min="0" max="999999999.99" step="0.01" value={line.price} onChange={e => update(i,{price:e.target.value})}/></label><label>{t('الكمية','Quantity')}<input required type="number" min="1" max="99" step="1" value={line.quantity} onChange={e => update(i,{quantity:Number(e.target.value)})}/></label></div><fieldset disabled={Boolean(line.productId)}><CostFields locale={locale} value={line.costs} onChange={costs => update(i,{costs})} price={Number(line.price)}/></fieldset></div>)}
    <button disabled={lines.length>=50} type="button" onClick={() => setLines([...lines,{name:'',price:'',quantity:1,costs:{...emptyCosts}}])}><Plus size={16}/>{t('إضافة منتج','Add product')}</button><div className={styles.grid}><label>{t('رسوم التوصيل على العميل','Delivery fee charged')}<input required type="number" min="0" max="999999999.99" step="0.01" value={fee} onChange={e => setFee(e.target.value)}/></label><label>{t('تكلفة التوصيل على المشروع','Delivery cost to business')}<input type="number" min="0" max="999999999.99" step="0.01" value={delivery} onChange={e => setDelivery(e.target.value)}/></label></div><div className={styles.footer}><strong>{t('إجمالي الطلب','Order total')}: {(lines.reduce((sum,l) => sum + Number(l.price)*l.quantity,0)+Number(fee)).toFixed(2)} {t('جنيه','EGP')}</strong><button className={styles.primary} disabled={busy} type="submit">{busy ? t('جارٍ التسجيل…','Saving…'):t('تسجيل الطلب وحساباته','Save order & finances')}</button></div><p role="status">{message}</p></form></details>;
}
