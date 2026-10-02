'use client';
import { useState } from 'react';
import Image from 'next/image';
import { localSeo, seoAudit, type SeoValues } from '@/app/lib/seo-shared';
const fields = [
  ['titleAr', 'عنوان البحث بالعربي', 70], ['titleEn', 'Search title (English)', 70],
  ['descriptionAr', 'وصف البحث بالعربي', 170], ['descriptionEn', 'Search description (English)', 170],
  ['ogTitleAr', 'عنوان المشاركة بالعربي', 100], ['ogTitleEn', 'Share title (English)', 100],
  ['ogDescriptionAr', 'وصف المشاركة بالعربي', 200], ['ogDescriptionEn', 'Share description (English)', 200],
  ['keywordsAr', 'الكلمات المستهدفة بالعربي', 500], ['keywordsEn', 'Target keywords (English)', 500],
  ['ogImage', 'Share image URL / صورة المشاركة', 500],
] as const;
export const adminInput = 'w-full rounded-lg border border-chocolate-700 bg-chocolate-950 px-3 py-2 text-chocolate-50 focus:outline-none focus:ring-2 focus:ring-gold-500';
export const adminButton = 'rounded-lg bg-gold-500 px-4 py-2 font-semibold text-chocolate-950 disabled:opacity-50 hover:bg-gold-400 focus-visible:outline-2 focus-visible:outline-gold-300';
export function SeoEditor({value, onChange, source, entity}: {value: SeoValues; onChange: (value: SeoValues) => void; source?: {titleAr: string; titleEn: string; bodyAr: string; bodyEn: string; image?: string}; entity?: {type: string; id: string}}) {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [sharePath, setSharePath] = useState('');
  const [replace, setReplace] = useState(false);
  const [history, setHistory] = useState<{values: SeoValues; at: string}[]>([]);
  const audit = seoAudit(value);
  async function generate(useAi: boolean) {
    if (!source) return;
    setBusy(true); setNotice('');
    try {
      const res = await fetch('/api/admin/seo/generate', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({...source, useAi})});
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      const merged = {...value};
      for (const [key, text] of Object.entries(result.values)) if (replace || !merged[key as keyof SeoValues]) Object.assign(merged, {[key]: text});
      onChange(merged); setNotice(result.notice || 'Suggestions ready. Review and save. / راجع الاقتراحات ثم احفظ.');
    } catch (error) {setNotice(error instanceof Error ? error.message : 'Generation failed');}
    finally {setBusy(false);}
  }
  async function revisions() {
    if (!entity) return;
    try {const res = await fetch(`/api/admin/seo?entityType=${entity.type}&entityId=${encodeURIComponent(entity.id)}`); const result = await res.json(); if (!res.ok) throw new Error(result.error); setHistory(result.history || []); setNotice(result.history?.length ? '' : 'No previous revisions yet.');} catch {setNotice('Could not load revisions');}
  }
  const generated = source ? localSeo(source) : {};
  return <section className="space-y-4 border-t border-chocolate-800 pt-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold">SEO & sharing / البحث والمشاركة</h2><span className="text-sm text-chocolate-300">Field checks: {audit.score}/100</span></div>
    {source && <div className="flex flex-wrap gap-3 items-center"><button className={adminButton} type="button" disabled={busy} onClick={() => generate(false)}>Local suggestions</button><button className={adminButton} type="button" disabled={busy} onClick={() => generate(true)}>AI suggestions</button><label className="text-sm"><input type="checkbox" checked={replace} onChange={e => setReplace(e.target.checked)} /> Replace existing fields</label></div>}
    {notice && <p role="status" className="text-sm text-gold-300">{notice}</p>}
    <div className="grid gap-4 md:grid-cols-2">{fields.map(([key, label, limit]) => <label key={key} className={key === 'ogImage' ? 'md:col-span-2' : ''}><span className="block text-sm mb-1">{label}</span><textarea className={adminInput} dir={key.endsWith('Ar') ? 'rtl' : 'ltr'} rows={key.includes('escription') ? 3 : 1} value={String(value[key] || '')} placeholder={String(generated[key] || '')} onChange={e => onChange({...value, [key]: e.target.value, source: 'manual'})} /><span className={`text-xs ${(value[key]?.length || 0) > limit ? 'text-amber-300' : 'text-chocolate-300'}`}>{value[key]?.length || 0} / {limit} recommended</span></label>)}</div>
    <div className="flex flex-wrap gap-5 text-sm">{(['indexable', 'followable'] as const).map(key => <label key={key}><input type="checkbox" checked={value[key] !== false} onChange={e => onChange({...value, [key]: e.target.checked})} /> {key === 'indexable' ? 'Allow indexing / السماح بالفهرسة' : 'Follow links / متابعة الروابط'}</label>)}<button type="button" className="underline text-gold-300" onClick={() => onChange({})}>Use page defaults / استعادة الافتراضي</button></div>
    <div className="grid gap-3 md:grid-cols-2">{(['Ar', 'En'] as const).map(lang => <div key={lang} dir={lang === 'Ar' ? 'rtl' : 'ltr'} className="rounded-lg border border-chocolate-700 p-4"><p className="text-xs text-chocolate-300 mb-2">Search preview · {lang}</p><p className="text-lg text-gold-300">{value[`title${lang}`] || generated[`title${lang}`] || 'Choco Celia'}</p><p className="text-sm text-chocolate-200 mt-1">{value[`description${lang}`] || generated[`description${lang}`] || 'Add a description'}</p><hr className="border-chocolate-800 my-3"/><p className="text-xs text-chocolate-300">Share preview</p><p>{value[`ogTitle${lang}`] || value[`title${lang}`] || generated[`title${lang}`]}</p><p className="text-sm text-chocolate-300">{value[`ogDescription${lang}`] || value[`description${lang}`] || generated[`description${lang}`]}</p>{value.ogImage && <Image src={value.ogImage} alt="Share preview" width={320} height={168} unoptimized className="mt-2 h-24 object-contain" />}</div>)}</div>
    {entity && <button type="button" className="text-sm text-gold-300 underline" onClick={revisions}>Previous SEO versions</button>}
    {entity && entity.type !== 'page' && <div className="flex gap-3 items-center"><button type="button" disabled={busy} className="text-sm text-gold-300 underline" onClick={async () => {try {const res = await fetch('/api/admin/seo', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({action: 'share', entityType: entity.type, entityId: entity.id, locale: 'ar'})}); const data = await res.json(); if (!res.ok) throw new Error(data.error); setSharePath(data.path); try {await navigator.clipboard.writeText(window.location.origin + data.path);} catch {} setNotice('Share link ready.');} catch(e) {setNotice(e instanceof Error ? e.message : 'Could not create link');}}}>Create short share link</button>{sharePath && <a className="text-sm underline" href={sharePath} target="_blank" rel="noreferrer">{sharePath}</a>}</div>}
    {history.map((revision, i) => <button key={i} type="button" className="block text-sm text-chocolate-200 underline" onClick={() => {onChange(revision.values); setNotice('Version restored in the editor. Save to apply.');}}>{new Date(revision.at).toLocaleString()} · Restore</button>)}
  </section>;
}
