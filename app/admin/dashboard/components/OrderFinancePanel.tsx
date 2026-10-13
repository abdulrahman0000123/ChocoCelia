'use client';
import { adminFetch, adminError, useAdmin } from './AdminContext';
import { useEffect, useState } from 'react';
import { Check, History, AlertCircle } from 'lucide-react';
import styles from './Finance.module.css';
import type { FinanceLine } from '@/app/lib/finance';
import { CostFields, emptyCosts, type CostDraft } from './CostFields';

export type FinanceData = {version: number; lines: FinanceLine[]; netSales: string; productCost: string|null; advertising: string; advertisingPct: string; developmentPct: string; deliveryCost: string|null; profit: string|null; development: string|null; available: string|null; received: string; refunded: string; events?: {id: string; action: string; reason: string; createdAt: string}[]};
export type FinancialOrder = {id: string; customerName: string; customerPhone: string; total: number; status: string; createdAt: string; finance: FinanceData|null; paymentState?: string; source?: 'MANUAL'|'STOREFRONT'|'LEGACY'};
export function formatMoney(value: string | number | null | undefined, locale: 'ar'|'en' = 'ar') {
  if (value == null) return '—';
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2}).format(Number(value));
}
export const statusLabel = (value: string, ar: boolean) => ({PENDING: ar ? 'جديد' : 'Pending', PROCESSING: ar ? 'قيد التجهيز' : 'Processing', COMPLETED: ar ? 'مكتمل' : 'Completed', CANCELLED: ar ? 'ملغي' : 'Cancelled', PAID: ar ? 'مدفوع' : 'Paid', UNPAID: ar ? 'غير مدفوع' : 'Unpaid', PARTIAL: ar ? 'دفع جزئي' : 'Partially paid', REFUNDED: ar ? 'مسترد' : 'Refunded', PARTIALLY_REFUNDED: ar ? 'استرداد جزئي' : 'Partially refunded'}[value] || value);

export function OrderFinancePanel({order, locale: requestedLocale, onSaved}: {order: FinancialOrder; locale?: 'ar'|'en'; onSaved?: (order: FinancialOrder) => void}) {
  const shared = useAdmin(); const locale = requestedLocale ?? shared.locale;
  const ar = locale === 'ar', f = order.finance;
  const [received, setReceived] = useState(f?.received ?? '0');
  const [refunded, setRefunded] = useState(f?.refunded ?? '0');
  const [delivery, setDelivery] = useState(f?.deliveryCost ?? '');
  const [status, setStatus] = useState(order.status);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);
  const [lines, setLines] = useState<FinanceLine[]>(f?.lines ?? []);
  const [editCosts, setEditCosts] = useState(false);
  useEffect(() => {setLines(f?.lines ?? []); setEditCosts(false);}, [order.id, f?.version, f?.lines]);
  useEffect(() => {setReceived(f?.received ?? '0'); setRefunded(f?.refunded ?? '0'); setDelivery(f?.deliveryCost ?? ''); setStatus(order.status); setReason('');}, [order.id, f?.version, f?.received, f?.refunded, f?.deliveryCost, order.status]);
  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setMessage('');
    try {
      const response = await adminFetch(`/api/orders/${order.id}`, {method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({version: f?.version ?? 0, received, refunded, deliveryCost: delivery === '' ? null : delivery, status, reason, ...(editCosts ? {lines} : {})})});
      const result = await response.json();
      if (!response.ok) throw new Error(response.status === 409 ? 'Conflict: order changed' : result.error);
      setFailed(false); setMessage(ar ? 'تم الحفظ وتسجيل التغيير.' : 'Saved with an audit entry.'); onSaved?.(result);
    } catch (error) {setFailed(true); setMessage(adminError(error,ar));}
    finally {setSaving(false);}
  }
  const rows = f ? [[ar ? 'صافي مبيعات المنتجات' : 'Net product sales',f.netSales],[ar ? 'تكلفة المنتجات' : 'Product cost',f.productCost],[`${ar ? 'الإعلانات' : 'Advertising'} (${f.advertisingPct}%)`,f.advertising],[ar ? 'تكلفة التوصيل' : 'Delivery cost',f.deliveryCost],[ar ? 'الربح بعد الإعلانات والتوصيل' : 'Profit after advertising & delivery',f.profit],[`${ar ? 'التطوير' : 'Development'} (${f.developmentPct}%)`,f.development],[ar ? 'المتاح بعد المخصصات' : 'After allocations',f.available]] : [];
  return <section className={`${styles.workspace} ${styles.mini}`} dir={ar ? 'rtl' : 'ltr'}>
    <h2>{ar ? 'حسابات الأوردر' : 'Order finances'}</h2>
    {(!f || f.profit === null) && <div className={styles.notice}><AlertCircle size={18}/><span>{ar ? 'الحسابات غير مكتملة. التكلفة الناقصة لا تُعتبر صفرًا، ولا تدخل الأرباح المجهولة في إجمالي الربح.' : 'Incomplete finances. Missing costs are never treated as zero or included in profit totals.'}</span></div>}
    <div className={styles.breakdown}>{rows.map(([label, value]) => <div key={label}><span>{label}</span><strong>{formatMoney(value, locale)}</strong></div>)}</div>
    {f && <details className={styles.settings}><summary>{ar ? 'تفاصيل التكلفة وقت الطلب' : 'Costs captured at checkout'}</summary><div className={styles.tableWrap}><table><thead><tr>{(ar ? ['المنتج','الكمية','سعر الوحدة','تكلفة الوحدة'] : ['Product','Quantity','Unit price','Unit cost']).map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{f.lines.map((line,i) => <tr key={i}><td>{ar ? line.nameAr : line.name}</td><td>{line.quantity}</td><td>{formatMoney(line.price,locale)}</td><td>{formatMoney(line.costs ? Object.values(line.costs).reduce((s,v) => s + Number(v),0) : null,locale)}</td></tr>)}</tbody></table></div></details>}
    <form onSubmit={save}>
      {f && order.status !== 'CANCELLED' && <details className={styles.settings} onToggle={e => setEditCosts(e.currentTarget.open)}><summary>{ar ? 'مراجعة وتعديل البنود والتكاليف' : 'Revise line items and costs'}</summary><p>{ar ? 'التعديل يعيد حساب الأوردر بالنسب المحفوظة، ويُسجّل مع سبب التغيير.' : 'Recalculates using saved percentages and records the revision reason.'}</p>{editCosts && lines.map((line,i) => <div key={i} className={styles.detail}><h3>{ar ? line.nameAr : line.name}</h3><div className={styles.grid}><label>{ar ? 'الكمية' : 'Quantity'}<input required type="number" min="1" max="99" step="1" value={line.quantity} onChange={e => setLines(lines.map((l,n) => n === i ? {...l,quantity:Number(e.target.value)} : l))}/></label><label>{ar ? 'سعر الوحدة' : 'Unit price'}<input required type="number" min="0" step="0.01" value={line.price} onChange={e => setLines(lines.map((l,n) => n === i ? {...l,price:e.target.value} : l))}/></label></div><CostFields locale={locale} price={Number(line.price)} value={line.costs ?? emptyCosts} onChange={(costs: CostDraft) => setLines(lines.map((l,n) => n === i ? {...l,costs:Object.values(costs).every(v => v === '') ? null : costs} : l))}/></div>)}</details>}
      <div className={styles.grid}>
        <label>{ar ? 'حالة الأوردر' : 'Order status'}<select value={status} onChange={e => setStatus(e.target.value)} disabled={order.status === 'CANCELLED'}>{['PENDING','PROCESSING','COMPLETED','CANCELLED'].map(s => <option key={s} value={s}>{statusLabel(s,ar)}</option>)}</select></label>
        <label>{ar ? 'تكلفة التوصيل الفعلية' : 'Actual delivery cost'}<input type="number" min="0" max="999999999.99" step="0.01" inputMode="decimal" placeholder={ar ? 'غير معروفة' : 'Unknown'} value={delivery} onChange={e => setDelivery(e.target.value)}/></label>
        <label>{ar ? 'إجمالي المحصل من العميل' : 'Total received from customer'}<input type="number" required min="0" max={order.total} step="0.01" inputMode="decimal" value={received} onChange={e => setReceived(e.target.value)}/></label>
        <label>{ar ? 'إجمالي المبلغ المسترد' : 'Total refunded'}<input type="number" required min="0" max={Number(received)} step="0.01" inputMode="decimal" value={refunded} onChange={e => setRefunded(e.target.value)}/></label>
      </div>
      <p>{ar ? 'أدخل الإجمالي التراكمي، وليس قيمة دفعة إضافية. اختيار طريقة الدفع لا يؤكد وصول المال. الاسترداد يقلل المبيعات والمخصصات بنسبة موزعة على المنتجات والتوصيل، مع الاحتفاظ بالتكاليف المتكبدة.' : 'Enter cumulative totals, not an additional payment. Payment method does not confirm receipt. Refunds reduce sales and allocations proportionally across products and delivery; incurred costs remain.'}</p>
      <label>{ar ? 'سبب التغيير' : 'Reason for revision'}<input required minLength={3} maxLength={500} value={reason} onChange={e => setReason(e.target.value)} placeholder={ar ? 'مثال: تأكيد استلام التحويل' : 'Example: confirmed bank transfer'}/></label>
      <div className={styles.footer}><span>{ar ? 'المتبقي على العميل' : 'Customer balance'}: {formatMoney(status === 'CANCELLED' ? 0 : Math.max(0, order.total - Number(received)),locale)}</span><button disabled={saving} className={styles.primary} type="submit"><Check size={16}/>{saving ? (ar ? 'جارٍ الحفظ…' : 'Saving…') : (ar ? 'حفظ التغيير' : 'Save revision')}</button></div>
      {message && <p role={failed ? 'alert' : 'status'} className={failed ? styles.negative : styles.positive}>{message}</p>}
    </form>
    <details className={styles.settings}><summary><History size={16}/>{ar ? 'سجل التغييرات' : 'Revision history'}</summary>{f?.events?.length ? f.events.map(event => <p key={event.id}>{new Date(event.createdAt).toLocaleString(ar ? 'ar-EG' : 'en-GB',{timeZone:'Africa/Cairo'})} · {event.reason}</p>) : <p>{ar ? 'افتح تفاصيل الأوردر من لوحة الحسابات لعرض السجل الكامل.' : 'Open this order from Finance to view the full history.'}</p>}</details>
  </section>;
}
