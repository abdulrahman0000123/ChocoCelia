'use client';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ThemeProvider, useTheme } from 'next-themes';
import { ArrowDownToLine, ArrowUpRight, SlidersHorizontal, RefreshCw, AlertCircle, Sun, Moon, X, PackageCheck } from 'lucide-react';
import { OrderFinancePanel, formatMoney, statusLabel, type FinancialOrder } from '../components/OrderFinancePanel';
import { SpecialOrder } from '../components/SpecialOrder';
import styles from '../components/Finance.module.css';

type Group = {count: number; complete: number; missing: number; sales: string; costs: string; advertising: string; profit: string; development: string; available: string};
type Report = {expected: Group; completed: Group; cash: {received: string; refunded: string; net: string; outstanding: string}; count: number; page: number; pages: number; orders: FinancialOrder[]; recent: FinancialOrder[]; setup: {products: number; missingCosts: number}};
type Settings = {advertisingPct: string; developmentPct: string; deliveryCostBeniSuef: string; deliveryCostEastNile: string};
const defaultSettings: Settings = {advertisingPct:'10', developmentPct:'20', deliveryCostBeniSuef:'', deliveryCostEastNile:''};

export default function FinancePage() {
  return <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="choco-finance-theme"><FinanceWorkspace/></ThemeProvider>;
}

function FinanceWorkspace() {
  const [locale,setLocale] = useState<'ar'|'en'>('ar'); const ar = locale === 'ar';
  const {resolvedTheme,setTheme} = useTheme();
  const [report,setReport] = useState<Report|null>(null);
  const [settings,setSettings] = useState<Settings>(defaultSettings);
  const [settingsReady,setSettingsReady] = useState(false);
  const [start,setStart] = useState(''), [end,setEnd] = useState(''), [status,setStatus] = useState('');
  const [page,setPage] = useState(1), [view,setView] = useState<'expected'|'completed'|'cash'>('completed');
  const [loading,setLoading] = useState(true), [error,setError] = useState(''), [saving,setSaving] = useState(false), [feedback,setFeedback] = useState('');
  const [selected,setSelected] = useState<FinancialOrder|null>(null), [opening,setOpening] = useState(false);
  const version = useRef(0);
  const detail = useRef<HTMLDivElement>(null);
  const t = (arabic: string, english: string) => ar ? arabic : english;
  const query = useCallback(() => new URLSearchParams({...start && {startDate:start}, ...end && {endDate:end}, ...status && {status}, page:String(page)}).toString(), [start,end,status,page]);
  const load = useCallback(async () => {
    const current = ++version.current; setLoading(true); setError('');
    try {
      const r = await fetch(`/api/admin/finance?${query()}`,{cache:'no-store'});
      const data = await r.json(); if (!r.ok) throw new Error(data.error);
      if (current === version.current) setReport(data);
    } catch (e) {if (current === version.current) setError(e instanceof Error ? e.message : 'Could not load finances.');}
    finally {if (current === version.current) setLoading(false);}
  },[query]);
  useEffect(() => {const requestVersion = version; load(); return () => {requestVersion.current++;};},[load]);
  useEffect(() => {fetch('/api/admin/finance/settings').then(async r => {if(!r.ok) throw new Error(); return r.json();}).then(data => {
    setSettings(Object.fromEntries(Object.keys(defaultSettings).map(key => [key,data[key] == null ? '' : String(data[key])])) as Settings); setSettingsReady(true);
  }).catch(() => setFeedback('Could not load settings. Refresh before saving.'));},[]);
  async function saveSettings(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setFeedback('');
    try {const r = await fetch('/api/admin/finance/settings',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(settings)}); const data = await r.json(); if(!r.ok) throw new Error(data.error);
      setFeedback(t('تم حفظ الإعدادات للطلبات الجديدة.','Saved for new orders.')); await load();
    } catch(e) {setFeedback(e instanceof Error ? e.message : t('تعذر الحفظ.','Could not save.'));} finally {setSaving(false);}
  }
  async function open(order: FinancialOrder) {
    setOpening(true); setSelected(null);
    try {const r = await fetch(`/api/orders/${order.id}`); if(!r.ok) throw new Error(); setSelected(await r.json()); requestAnimationFrame(() => detail.current?.scrollIntoView({behavior:'smooth',block:'start'}));}
    catch {setError(t('تعذر فتح الأوردر. حاول مرة أخرى.','Could not open order. Please retry.'));} finally {setOpening(false);}
  }
  const group = report ? report[view === 'expected' ? 'expected' : 'completed'] : null;
  const metric = (label: string, value: string|number|null|undefined, note: string, positive = false) => <div className={styles.metric}><span>{label}</span><strong className={positive && Number(value) < 0 ? styles.negative : positive ? styles.positive : undefined}>{formatMoney(value,locale)}</strong><small>{note}</small></div>;
  const currency = t('جنيه مصري','EGP');
  return <div className={styles.workspace} dir={ar ? 'rtl':'ltr'} lang={locale}>
    <header className={styles.header}>
      <div><div className={styles.eyebrow}>CHOCO CELIA / {t('الإدارة المالية','FINANCE')}</div><h1>{t('كل أوردر، حساباته واضحة.','Every order, accounted for.')}</h1><p>{t('من الطلب إلى التحصيل، حسابات تلقائية بتكاليف محفوظة وقت البيع.','From checkout to collection, automatic finances with costs captured at sale.')}</p></div>
      <div className={styles.actions}><button aria-label={t('تغيير اللغة','Change language')} onClick={() => setLocale(ar ? 'en':'ar')}>{ar ? 'English':'العربية'}</button><button aria-label={t('تغيير المظهر','Toggle theme')} onClick={() => setTheme(resolvedTheme === 'dark' ? 'light':'dark')}>{resolvedTheme === 'dark' ? <Sun size={18}/>:<Moon size={18}/>}</button><button disabled={loading} aria-label={t('تحديث الحسابات','Refresh finances')} onClick={load}><RefreshCw size={18}/></button></div>
    </header>
    <div className={styles.toolbar}>
      <label>{t('من تاريخ','From date')}<input type="date" value={start} max={end || undefined} onChange={e => {setStart(e.target.value);setPage(1);}}/></label>
      <label>{t('إلى تاريخ','To date')}<input type="date" value={end} min={start || undefined} onChange={e => {setEnd(e.target.value);setPage(1);}}/></label>
      <label>{t('حالة الأوردر','Order status')}<select value={status} onChange={e => {setStatus(e.target.value);setPage(1);}}><option value="">{t('كل الحالات','All statuses')}</option>{['PENDING','PROCESSING','COMPLETED','CANCELLED'].map(s => <option key={s} value={s}>{statusLabel(s,ar)}</option>)}</select></label>
      <a className={styles.button} href={`/api/orders/export?${query()}`}><ArrowDownToLine size={16}/>{t('تصدير الحسابات','Export finances')}</a>
    </div>
    {error && <div className={styles.notice} role="alert"><AlertCircle size={18}/><span>{error}</span><button onClick={load}>{t('إعادة المحاولة','Retry')}</button></div>}
    {report && report.setup.missingCosts > 0 && <div className={styles.notice}><PackageCheck size={20}/><span>{t(`${report.setup.missingCosts} منتج بدون تكلفة مكتملة. أكملها لتظهر أرباح الطلبات الجديدة تلقائيًا.`,`${report.setup.missingCosts} products need costs. Complete them to calculate profit on new orders.`)}</span><Link className={styles.button} href="/admin/dashboard/products">{t('إدارة التكاليف','Manage costs')}<ArrowUpRight size={16}/></Link></div>}
    <nav className={styles.tabs} role="tablist" aria-label={t('نوع الحسابات','Finance view')}>{(['completed','expected','cash'] as const).map(v => <button id={`tab-${v}`} aria-controls="finance-summary" role="tab" tabIndex={view === v ? 0 : -1} aria-selected={view === v} key={v} onClick={() => setView(v)} onKeyDown={e => {
      const tabs = ['completed','expected','cash'] as const;
      const direction = e.key === 'ArrowRight' ? (ar ? -1:1) : e.key === 'ArrowLeft' ? (ar ? 1:-1) : 0;
      const index = e.key === 'Home' ? 0 : e.key === 'End' ? 2 : direction ? (tabs.indexOf(v) + direction + 3) % 3 : -1;
      if(index >= 0) {e.preventDefault();setView(tabs[index]);document.getElementById(`tab-${tabs[index]}`)?.focus();}
    }}>{v === 'completed' ? t('مبيعات مكتملة','Completed sales') : v === 'expected' ? t('طلبات متوقعة','Expected orders') : t('التحصيل الفعلي','Cash collected')}</button>)}</nav>
    <section id="finance-summary" role="tabpanel" aria-labelledby={`tab-${view}`} aria-busy={loading}>
      {loading ? <div className={styles.metrics} role="status" aria-label={t('جارٍ تحميل الحسابات','Loading finances')}>{[1,2,3,4].map(i => <div key={i} className={styles.skeleton}/>)}</div> : report && group && <>
        {view === 'cash' ? <><div className={styles.metrics}>{metric(t('إجمالي المحصل','Total received'),report.cash.received,currency)}{metric(t('المبالغ المستردة','Refunds'),report.cash.refunded,currency)}{metric(t('صافي التحصيل','Net collected'),report.cash.net,currency,true)}{metric(t('المستحق على العملاء','Customer balances'),report.cash.outstanding,currency)}</div><p>{t('التحصيل يعرض الأموال المؤكدة لأوردرات الفترة المختارة. قيمة الطلب أو اختيار الدفع أونلاين لا يؤكد استلام المال.','Collections show confirmed receipts for orders created in the selected period. Placing an order or choosing online payment does not confirm receipt.')}</p></> : <>
          <div className={styles.metrics}>{metric(t('صافي مبيعات المنتجات','Net product sales'),group.sales,t(`${group.count} أوردر · بعد الخصم`,`${group.count} orders · after discounts`))}{metric(t('تكلفة المنتجات','Product costs'),group.costs,t('للحسابات المكتملة فقط','Complete financial records only'))}{metric(t('الربح بعد الإعلانات والتوصيل','Profit after ads & delivery'),group.profit,currency,true)}{metric(t('المتاح بعد المخصصات','After allocations'),group.available,t('قيمة محسوبة، راجع التحصيل','Calculated amount, check collection'),true)}</div>
          {group.missing > 0 && <p className={styles.negative}>{t(`${group.missing} أوردر بحسابات ناقصة. المبيعات تشملها، لكن الربح والتكلفة والمخصصات المعروضة تخص ${group.complete} أوردر مكتمل الحسابات.`,`${group.missing} orders have incomplete finances. Sales include them; costs, profit and allocations cover ${group.complete} complete records.`)}</p>}
        </>}
      </>}
    </section>
    {report && <div className={styles.split}>
      <section><h2>{t('آخر ١٠ أوردرات','Last 10 orders')}</h2><p>{t('المبيعات والتكلفة والربح قبل مخصص التطوير','Net sales, product cost and profit before development allocation')}</p><OrderChart orders={report.recent} locale={locale}/></section>
      <section><h2>{t('توزيع المخصصات','Allocation breakdown')}</h2><div className={styles.breakdown}><div><span>{t('الإعلانات','Advertising')}</span><strong>{formatMoney(group?.advertising,locale)}</strong></div><div><span>{t('التطوير وإعادة الاستثمار','Development & reinvestment')}</span><strong>{formatMoney(group?.development,locale)}</strong></div><div><span>{t('المتاح بعد المخصصات','After allocations')}</span><strong className={styles.positive}>{formatMoney(group?.available,locale)}</strong></div></div><p>{t('مخصصات حسابية وليست أرصدة بنكية. تعرض أرقام التبويب المختار، وفي التحصيل تعرض المبيعات المكتملة.','Calculated allocations, not bank balances. Uses the selected sales view; collections uses completed sales.')}</p></section>
    </div>}
    <SpecialOrder locale={locale} onSaved={load}/>
    <details className={styles.settings}><summary><SlidersHorizontal size={18}/>{t('إعدادات الحسابات والتوصيل','Finance & delivery settings')}</summary><p>{t('تطبق على الطلبات الجديدة فقط. اترك تكلفة التوصيل فارغة إذا كانت غير معروفة.','Applies to new orders only. Leave delivery cost blank if unknown.')}</p><form onSubmit={saveSettings}><div className={styles.grid}>{(Object.keys(defaultSettings) as (keyof Settings)[]).map((key,i) => <label key={key}>{[t('الإعلانات من صافي مبيعات المنتجات %','Advertising on net product sales %'),t('التطوير من الربح الموجب %','Development on positive profit %'),t('تكلفة التوصيل داخل بني سويف','Beni Suef delivery cost'),t('تكلفة التوصيل شرق النيل','East Nile delivery cost')][i]}<input disabled={!settingsReady} required={i < 2} type="number" step="0.01" min="0" max={i < 2 ? '50':'999999999.99'} value={settings[key]} onChange={e => setSettings({...settings,[key]:e.target.value})}/></label>)}</div><button type="submit" className={styles.primary} disabled={saving || !settingsReady}>{saving ? t('جارٍ الحفظ…','Saving…'):t('حفظ الإعدادات','Save settings')}</button><p role="status">{feedback}</p></form></details>
    <div className={styles.sectionHead}><h2>{t('سجل الأوردرات المالي','Order financial ledger')}</h2><span className={styles.badge}>{report?.count ?? 0} {t('أوردر','orders')}</span></div>
    <div className={styles.tableWrap}><table><thead><tr>{[t('العميل والأوردر','Customer & order'),t('الحالة','Status'),t('قيمة الطلب','Order total'),t('الربح','Profit'),t('المتاح','After allocations'),t('التحصيل','Collection'),t('التفاصيل','Details')].map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{!loading && report?.orders.map(o => <tr key={o.id}><td>{o.customerName}<small><bdi>#{o.id.slice(-8).toUpperCase()}</bdi> · {new Date(o.createdAt).toLocaleDateString(ar ? 'ar-EG':'en-GB',{timeZone:'Africa/Cairo'})}</small></td><td><span className={styles.badge}>{statusLabel(o.status,ar)}</span></td><td>{formatMoney(o.total,locale)}</td><td className={Number(o.finance?.profit) < 0 ? styles.negative:undefined}>{formatMoney(o.finance?.profit,locale)}{o.finance?.profit == null && <small>{t('حسابات ناقصة','Incomplete costs')}</small>}</td><td>{formatMoney(o.finance?.available,locale)}</td><td>{statusLabel(o.paymentState || 'UNPAID',ar)}<small>{formatMoney(Number(o.finance?.received ?? 0) - Number(o.finance?.refunded ?? 0),locale)}</small></td><td><button disabled={opening} onClick={() => open(o)} aria-label={t(`تفاصيل أوردر ${o.customerName}`,`View ${o.customerName}'s order`)}>{t('مراجعة','Review')}<ArrowUpRight size={16}/></button></td></tr>)}</tbody></table>{!loading && !report?.orders.length && <div className={styles.empty}><h3>{t('لا توجد أوردرات في الفترة دي','No orders in this period')}</h3><p>{t('الحسابات تظهر هنا تلقائيًا بمجرد طلب العميل. جرّب تغيير الفترة أو الحالة.','Customer orders appear automatically. Try changing the date range or status.')}</p></div>}</div>
    <div className={styles.footer}><span>{t('الفترة حسب إنشاء الأوردر · توقيت القاهرة · الجنيه المصري','Period by order creation date · Cairo time · EGP')}</span><div className={styles.actions}><button disabled={loading || page <= 1} onClick={() => setPage(page - 1)}>{t('السابق','Previous')}</button><span>{page} / {Math.max(1,report?.pages ?? 1)}</span><button disabled={loading || page >= (report?.pages ?? 1)} onClick={() => setPage(page + 1)}>{t('التالي','Next')}</button></div></div>
    {selected && <div ref={detail} className={styles.detail}><div className={styles.sectionHead}><div><h2>{selected.customerName}</h2><p><bdi>#{selected.id}</bdi></p></div><button aria-label={t('إغلاق التفاصيل','Close details')} onClick={() => setSelected(null)}><X size={18}/></button></div><OrderFinancePanel order={selected} locale={locale} onSaved={async saved => {setSelected(saved);await load(); const r = await fetch(`/api/orders/${saved.id}`);if(r.ok) setSelected(await r.json());}}/></div>}
  </div>;
}

function OrderChart({orders,locale}: {orders: FinancialOrder[];locale:'ar'|'en'}) {
  const ar = locale === 'ar';
  if (!orders.length) return <div className={styles.empty}><p>{ar ? 'أول أوردر هيبدأ الرسم تلقائيًا.':'Your first order starts the chart automatically.'}</p></div>;
  const values = orders.flatMap(o => [Number(o.finance?.netSales ?? 0),Number(o.finance?.productCost ?? 0),Number(o.finance?.profit ?? 0)]);
  const min = Math.min(0,...values), max = Math.max(1,...values), span = max - min;
  const y = (v:number) => 155 - (v - min) / span * 135;
  const fields = ['netSales','productCost','profit'] as const;
  const colors = ['var(--accent)','var(--subtle)','var(--positive)'];
  return <><svg className={styles.chart} viewBox="0 0 600 200" role="img" aria-label={ar ? 'مقارنة المبيعات والتكلفة والربح لآخر عشرة أوردرات. التفاصيل في جدول السجل.':'Sales, costs and profit for the last ten orders. Details in the ledger table.'}>
    {[0,.5,1].map(v => <line key={v} x1="12" x2="588" y1={20 + v*135} y2={20+v*135} stroke="var(--line)" strokeDasharray="3 5"/>)}
    <line x1="12" x2="588" y1={y(0)} y2={y(0)} stroke="var(--line)"/>
    {orders.map((o,i) => <g key={o.id}>{fields.map((field,j) => {const value = o.finance?.[field]; if(value == null) return null; const width = Math.min(12,400/orders.length/3); return <rect key={field} x={22 + i * (560/orders.length) + j*(width+3)} y={Math.min(y(Number(value)),y(0))} width={width} height={Math.max(1,Math.abs(y(Number(value))-y(0)))} rx="2" fill={colors[j]}><title>{o.customerName} · {field}: {formatMoney(value,locale)}</title></rect>;})}<text x={22+i*(560/orders.length)} y="184" fill="var(--subtle)" fontSize="11">{i+1}</text></g>)}
  </svg><div className={styles.legend}>{(ar ? ['المبيعات','التكلفة','الربح']:['Sales','Costs','Profit']).map((label,i) => <span key={label}><i style={{background:colors[i]}}/>{label}</span>)}</div></>;
}
