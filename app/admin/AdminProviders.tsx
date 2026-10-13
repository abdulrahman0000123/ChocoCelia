'use client';
import { useEffect, type ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/app/components/ThemeProvider';
import { AdminProvider, useAdmin } from './dashboard/components/AdminContext';

export function AdminProviders({children}: {children:ReactNode}) {
  return <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange><AdminProvider><AdminDocument>{children}</AdminDocument></AdminProvider></ThemeProvider>;
}
function AdminDocument({children}: {children:ReactNode}) {
  const {locale,ar} = useAdmin();
  useEffect(()=>{document.documentElement.lang=locale;document.documentElement.dir=ar?'rtl':'ltr';},[locale,ar]);
  return <>{children}<Toaster toastOptions={{style:{background:'var(--surface)',color:'var(--foreground)',border:'1px solid var(--border)',fontFamily:'var(--font-rpt)'}}}/></>;
}
