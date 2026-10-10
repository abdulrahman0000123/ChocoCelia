'use client';
import { useEffect, useState } from 'react';
import styles from './Finance.module.css';

export type CostDraft = {chocolate: string; packaging: string; nuts: string; decoration: string};
export const emptyCosts: CostDraft = {chocolate: '', packaging: '', nuts: '', decoration: ''};
export function CostFields({value, onChange, price, locale = 'ar'}: {value: CostDraft; onChange: (v: CostDraft) => void; price: number; locale?: 'ar'|'en'}) {
  const ar = locale === 'ar';
  const complete = Object.values(value).every(v => v !== '' && Number.isFinite(Number(v)) && Number(v) >= 0);
  const total = Object.values(value).reduce((sum, v) => sum + (Number(v) || 0), 0);
  const labels = ar ? ['الشوكولاتة', 'التغليف', 'المكسرات', 'التزيين'] : ['Chocolate', 'Packaging', 'Nuts', 'Decoration'];
  return <section className={`${styles.workspace} ${styles.mini}`} dir={ar ? 'rtl' : 'ltr'}>
    <h2>{ar ? 'تكلفة وحدة البيع' : 'Cost per selling unit'}</h2>
    <p>{ar ? 'لو المنتج علبة، أدخل تكلفة العلبة كاملة. اكتب صفرًا للمكوّن غير المستخدم.' : 'For a box, enter the cost of the entire box. Enter zero for unused components.'}</p>
    <div className={styles.grid}>{(Object.keys(emptyCosts) as (keyof CostDraft)[]).map((key, i) => <label key={key}>{labels[i]} · {ar ? 'جنيه' : 'EGP'}<input type="number" required={Object.values(value).some(v => v !== '')} inputMode="decimal" min="0" max="999999999.99" step="0.01" value={value[key]} onChange={e => onChange({...value, [key]: e.target.value})}/></label>)}</div>
    <div className={styles.metrics} aria-live="polite">
      <div className={styles.metric}><span>{ar ? 'التكلفة' : 'Unit cost'}</span><strong>{complete ? total.toFixed(2) : '—'}</strong></div>
      <div className={styles.metric}><span>{ar ? 'الربح قبل المخصصات' : 'Before allocations'}</span><strong className={price < total ? styles.negative : styles.positive}>{complete ? (price - total).toFixed(2) : '—'}</strong></div>
      <div className={styles.metric}><span>{ar ? 'هامش الربح' : 'Margin'}</span><strong>{complete && price > 0 ? `${((price - total) / price * 100).toFixed(1)}%` : '—'}</strong></div>
    </div>
    {!complete && <p>{ar ? 'أكمل المكونات الأربعة لتفعيل حساب الربح تلقائيًا.' : 'Complete all four components to enable automatic profit calculations.'}</p>}
  </section>;
}

export function ProductCostEditor({productId, price}: {productId?: string; price: number}) {
  const [draft, setDraft] = useState<CostDraft>(emptyCosts);
  const [loading, setLoading] = useState(Boolean(productId));
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    if (!productId) return;
    fetch(`/api/products/${productId}`).then(async r => {if (!r.ok) throw new Error(); return r.json();}).then(p => {
      if (active) {setDraft(p.costing ? Object.fromEntries(Object.keys(emptyCosts).map(k => [k, String(p.costing[k])])) as CostDraft : emptyCosts); setLoading(false);}
    }).catch(() => {if (active) {setLoading(false); setError('تعذر تحميل التكلفة. أعد فتح المنتج قبل الحفظ.');}});
    return () => {active = false;};
  }, [productId]);
  if (loading) return <><p role="status">جارٍ تحميل التكلفة…</p><input type="hidden" name="finance-cost-error" value="loading"/></>;
  if (error) return <><p role="alert">{error}</p><input type="hidden" name="finance-cost-error" value="error"/></>;
  return <><CostFields value={draft} onChange={setDraft} price={price}/><input type="hidden" name="finance-costs" value={Object.values(draft).every(v => v === '') ? '' : JSON.stringify(draft)}/></>;
}
