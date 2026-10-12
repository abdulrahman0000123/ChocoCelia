'use client';
import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useAdminQuery } from './components/useAdminQuery';
import { Sidebar } from './components/Sidebar';
import OrderNotification from './components/OrderNotification';
import { AdminProvider, useAdmin } from './components/AdminContext';
import { AdminLoading, AdminNotice } from './components/AdminUI';
import { ThemeToggle } from '@/app/components/ThemeToggle';
import styles from './components/Finance.module.css';
import './admin.css';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminProvider><AdminShell>{children}</AdminShell></AdminProvider>;
}
function AdminShell({ children }: { children: ReactNode }) {
  const { locale, ar, t, setLocale } = useAdmin();
  const pathname = usePathname();
  const [session, setSession] = useState<'checking'|'ready'|'expired'|'error'>('checking');
  const {params} = useAdminQuery();
  const returnTo = pathname + (params.size ? `?${params}` : '');
  async function checkSession() {
    try { const r = await fetch('/api/auth/session', { cache: 'no-store' }); setSession(r.ok ? 'ready' : r.status === 401 ? 'expired' : 'error'); }
    catch { setSession('error'); }
  }
  useEffect(() => {
    void Promise.resolve().then(checkSession);
    const expire = () => { setSession('expired'); };
    window.addEventListener('admin-session-expired', expire);
    return () => window.removeEventListener('admin-session-expired', expire);
  }, []);
  return <div className="admin-shell" dir={ar ? 'rtl' : 'ltr'} lang={locale}>
    <Sidebar/>
    <div className="admin-content">
      <div className="admin-topbar"><span>{t('إدارة شوكو سيليا', 'Choco Celia administration')}</span><div className={styles.actions}><button onClick={() => setLocale(ar ? 'en' : 'ar')} aria-label={t('تغيير لغة الإدارة', 'Change admin language')}>{ar ? 'English' : 'العربية'}</button><ThemeToggle locale={locale}/>{session === 'ready' && <OrderNotification/>}</div></div>
      <main className="admin-main">
        {session === 'checking' ? <AdminLoading/> : session === 'expired' ? <section className={`${styles.workspace} ${styles.empty}`}><h1>{t('انتهت جلسة الدخول', 'Session expired')}</h1><p>{t('سجّل الدخول مرة أخرى للعودة إلى نفس الصفحة.', 'Sign in again to return to this page.')}</p><Link className={styles.button} href={`/admin/login?next=${encodeURIComponent(returnTo)}`}>{t('تسجيل الدخول', 'Sign in')}</Link></section> : session === 'error' ? <AdminNotice retry={() => {setSession('checking');checkSession();}}>{t('تعذر التحقق من جلسة الدخول.', 'Could not verify your session.')}</AdminNotice> : children}
      </main>
    </div>
  </div>;
}
