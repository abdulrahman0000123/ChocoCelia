'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingBag, Settings, LogOut, Menu, X, FolderTree, MessageSquare, Megaphone, HelpCircle, Quote, Shield, Wallet } from 'lucide-react';
import { useState } from 'react';
import { useAdmin } from './AdminContext';
const items = [
  ['لوحة التحكم','Dashboard','',LayoutDashboard], ['المالية','Finance','/finance',Wallet],
  ['المنتجات','Products','/products',Package], ['التصنيفات','Categories','/categories',FolderTree],
  ['الطلبات','Orders','/orders',ShoppingBag], ['المراجعات','Reviews','/reviews',MessageSquare],
  ['آراء العملاء','Testimonials','/testimonials',Quote], ['الأسئلة الشائعة','FAQs','/faq',HelpCircle],
  ['التسويق','Marketing','/marketing',Megaphone], ['المحتوى','Content','/content',FolderTree],
  ['الظهور ومحركات البحث','SEO & Visibility','/seo',Megaphone], ['الإعدادات','Settings','/settings',Settings], ['الأمان','Security','/security',Shield],
] as const;
export function Sidebar() {
  const pathname = usePathname(), router = useRouter(), { t } = useAdmin();
  const [isOpen, setIsOpen] = useState(false);
  return <>
    <button className="admin-menu" onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen} aria-controls="admin-navigation" aria-label={t('قائمة الإدارة','Admin menu')}>{isOpen ? <X/> : <Menu/>}</button>
    {isOpen && <button className="admin-overlay" aria-label={t('إغلاق القائمة','Close menu')} onClick={() => setIsOpen(false)}/>}
    <aside id="admin-navigation" className={`admin-sidebar ${isOpen ? 'is-open' : ''}`}>
      <Link className="admin-brand" href="/admin/dashboard" onClick={() => setIsOpen(false)}>Choco Celia<small>{t('لوحة الإدارة','Administration')}</small></Link>
      <nav aria-label={t('صفحات الإدارة','Admin pages')}>{items.map(([a,e,suffix,Icon]) => {
        const href = `/admin/dashboard${suffix}`, active = pathname === href || Boolean(suffix && pathname.startsWith(href + '/'));
        return <Link key={href} href={href} aria-current={active ? 'page' : undefined} onClick={() => setIsOpen(false)}><Icon size={19}/><span>{t(a,e)}</span></Link>;
      })}</nav>
      <button className="admin-logout" onClick={async () => { const r = await fetch('/api/auth/session',{method:'DELETE'}); if(r.ok) router.push('/admin/login'); }}><LogOut size={18}/>{t('تسجيل الخروج','Logout')}</button>
    </aside>
  </>;
}
