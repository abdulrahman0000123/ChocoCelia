'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { LayoutDashboard, Package, ShoppingBag, Settings, LogOut, Ellipsis, X, FolderTree, MessageSquare, Megaphone, HelpCircle, Quote, Shield, Wallet } from 'lucide-react';
import { useAdmin } from './AdminContext';
import styles from './AdminNavigation.module.css';

const primary = [
  ['الرئيسية', 'Home', '', LayoutDashboard],
  ['الطلبات', 'Orders', '/orders', ShoppingBag],
  ['المنتجات', 'Products', '/products', Package],
  ['المالية', 'Finance', '/finance', Wallet],
] as const;
const secondary = [
  ['التصنيفات', 'Categories', '/categories', FolderTree],
  ['المراجعات', 'Reviews', '/reviews', MessageSquare],
  ['آراء العملاء', 'Testimonials', '/testimonials', Quote],
  ['الأسئلة الشائعة', 'FAQs', '/faq', HelpCircle],
  ['التسويق', 'Marketing', '/marketing', Megaphone],
  ['المحتوى', 'Content', '/content', FolderTree],
  ['الظهور ومحركات البحث', 'SEO & Visibility', '/seo', Megaphone],
  ['الإعدادات', 'Settings', '/settings', Settings],
  ['الأمان', 'Security', '/security', Shield],
] as const;

export function AdminNavigation() {
  const pathname = usePathname(), router = useRouter(), { t, ar } = useAdmin();
  const dialog = useRef<HTMLDialogElement>(null);
  const more = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState(false);
  const active = (suffix:string) => pathname === `/admin/dashboard${suffix}` || Boolean(suffix && pathname.startsWith(`/admin/dashboard${suffix}/`));
  const close = () => dialog.current?.close();
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const media = window.matchMedia('(min-width: 1024px)');
    const resize = () => { if (media.matches) dialog.current?.close(); };
    media.addEventListener('change', resize);
    return () => { document.body.style.overflow = previous; media.removeEventListener('change', resize); };
  }, [open]);
  async function logout() {
    setLoggingOut(true); setError(false);
    try {
      const r = await fetch('/api/auth/session', { method:'DELETE' });
      if (!r.ok) throw new Error();
      close(); router.push('/admin/login');
    } catch { setError(true); } finally { setLoggingOut(false); }
  }
  const links = (items:readonly (typeof primary[number] | typeof secondary[number])[]) => items.map(([a,e,suffix,Icon]) => <Link key={suffix} className={styles.link} href={`/admin/dashboard${suffix}`} aria-current={active(suffix) ? 'page' : undefined} onClick={close}><Icon size={18}/><span>{t(a,e)}</span></Link>);
  const logoutButton = <button disabled={loggingOut} className={styles.logout} onClick={logout}><LogOut size={18}/>{loggingOut ? t('جارٍ الخروج…','Signing out…') : t('تسجيل الخروج','Logout')}</button>;
  return <>
    <aside className={styles.sidebar}>
      <Link href="/admin/dashboard" className={styles.brand}>Choco Celia<small>{t('لوحة الإدارة','Administration')}</small></Link>
      <nav className={styles.links} aria-label={t('صفحات الإدارة','Admin pages')}>{links([...primary,...secondary])}</nav>
      {logoutButton}{error && <p className={styles.error} role="alert">{t('تعذر تسجيل الخروج. أعد المحاولة.','Could not sign out. Please retry.')}</p>}
    </aside>
    <nav className={styles.bottom} aria-label={t('التنقل الرئيسي للإدارة','Admin main navigation')}>
      {primary.map(([a,e,suffix,Icon]) => <Link key={suffix} href={`/admin/dashboard${suffix}`} aria-current={active(suffix) ? 'page' : undefined}><Icon size={20}/><span>{t(a,e)}</span></Link>)}
      <button ref={more} aria-expanded={open} aria-controls="admin-more" aria-current={secondary.some(item => active(item[2])) ? 'page' : undefined} onClick={() => { dialog.current?.showModal(); setOpen(true); }}><Ellipsis size={20}/><span>{t('المزيد','More')}</span></button>
    </nav>
    <dialog ref={dialog} id="admin-more" className={styles.sheet} dir={ar ? 'rtl' : 'ltr'} aria-labelledby="admin-more-title" onClose={() => { setOpen(false); more.current?.focus(); }} onClick={e => { if (e.target === e.currentTarget) { const rect = e.currentTarget.getBoundingClientRect(); if (e.clientY < rect.top || e.clientX < rect.left || e.clientX > rect.right) close(); } }}>
      <div className={styles.sheetHead}><h2 id="admin-more-title">{t('المزيد من أدوات الإدارة','More admin tools')}</h2><button className={styles.close} autoFocus onClick={close} aria-label={t('إغلاق القائمة','Close menu')}><X size={20}/></button></div>
      <nav className={styles.sheetLinks} aria-label={t('باقي أقسام الإدارة','Other admin sections')}>{links(secondary)}</nav>
      {logoutButton}{error && <p className={styles.error} role="alert">{t('تعذر تسجيل الخروج. أعد المحاولة.','Could not sign out. Please retry.')}</p>}
    </dialog>
  </>;
}
