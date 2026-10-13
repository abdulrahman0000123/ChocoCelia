'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { useAdmin } from '../dashboard/components/AdminContext';
import { ThemeToggle } from '@/app/components/ThemeToggle';

export default function AdminLoginPage() {
  const {t,ar,locale,setLocale} = useAdmin();
  const [username,setUsername] = useState(''), [password,setPassword] = useState('');
  const [error,setError] = useState(''), [busy,setBusy] = useState(false);
  const router=useRouter();
  async function handleSubmit(e:React.FormEvent) {
    e.preventDefault();setError('');setBusy(true);
    try {
      const response=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})});
      if(response.ok) {
        const next=new URLSearchParams(window.location.search).get('next');
        router.push(next&&next.startsWith('/admin/dashboard')&&!next.startsWith('//')?next:'/admin/dashboard');
      } else setError(response.status===429?'limit':response.status===401?'credentials':'request');
    }catch {setError('request');}finally {setBusy(false);}
  }
  return <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4" dir={ar?'rtl':'ltr'}>
    <section className="bg-surface border border-border p-6 rounded-2xl max-w-md w-full">
      <div className="flex justify-end gap-2 mb-6"><button type="button" className="border border-border rounded-xl px-3 min-h-[44px]" onClick={()=>setLocale(ar?'en':'ar')} aria-label={t('تغيير اللغة','Change language')}>{ar?'English':'العربية'}</button><ThemeToggle locale={locale}/></div>
      <div className="text-center mb-6"><Lock className="w-8 h-8 text-muted mx-auto mb-3"/><h1 className="text-2xl font-bold">{t('دخول الإدارة','Admin login')}</h1><p className="text-muted text-sm mt-2">{t('سجّل الدخول لإدارة الطلبات والمالية.','Sign in to manage orders and finances.')}</p></div>
      {error&&<p role="alert" className="text-muted border border-border rounded-xl p-3 mb-4">{error==='credentials'?t('بيانات الدخول غير صحيحة.','Invalid credentials.'):error==='limit'?t('محاولات كثيرة. حاول بعد قليل.','Too many attempts. Please try again shortly.'):t('تعذر تسجيل الدخول. حاول مرة أخرى.','Could not sign in. Please retry.')}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label htmlFor="admin-username" className="block text-sm mb-2">{t('اسم المستخدم','Username')}</label><input id="admin-username" type="text" required autoComplete="username" dir="ltr" className="w-full px-3 py-3 rounded-xl border border-border bg-surface text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" value={username} onChange={e=>setUsername(e.target.value)}/></div>
        <div><label htmlFor="admin-password" className="block text-sm mb-2">{t('كلمة المرور','Password')}</label><input id="admin-password" type="password" required autoComplete="current-password" dir="ltr" className="w-full px-3 py-3 rounded-xl border border-border bg-surface text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" value={password} onChange={e=>setPassword(e.target.value)}/></div>
        <button disabled={busy} type="submit" className="w-full bg-brand-accent text-brand-accent-foreground py-3 rounded-xl font-bold disabled:opacity-60">{busy?t('جارٍ الدخول…','Signing in…'):t('تسجيل الدخول','Sign in')}</button>
      </form>
    </section>
  </main>;
}
