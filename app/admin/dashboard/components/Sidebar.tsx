'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingBag, Settings, LogOut, Menu, X, FolderTree, MessageSquare, Megaphone, HelpCircle, Quote } from 'lucide-react';
import { useState } from 'react';

const MENU_ITEMS = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/dashboard/products', icon: Package },
  { name: 'Categories', href: '/admin/dashboard/categories', icon: FolderTree },
  { name: 'Orders', href: '/admin/dashboard/orders', icon: ShoppingBag },
  { name: 'Reviews', href: '/admin/dashboard/reviews', icon: MessageSquare },
  { name: 'Testimonials', href: '/admin/dashboard/testimonials', icon: Quote },
  { name: 'FAQs', href: '/admin/dashboard/faq', icon: HelpCircle },
  { name: 'Marketing', href: '/admin/dashboard/marketing', icon: Megaphone },
  { name: 'Settings', href: '/admin/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/session', { method: 'DELETE' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-chocolate-950/90 backdrop-blur-md px-4 py-2 shadow-lg border-b border-chocolate-800/80">
        <div className="flex items-center justify-center gap-2">
          <p className="text-sm text-white font-semibold tracking-wider">Admin ChocoCelia</p>
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-xl bg-chocolate-800/80 hover:bg-chocolate-700 transition-colors text-white cursor-pointer shadow-md border border-chocolate-600/50"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky lg:top-0 inset-y-0 left-0 z-50 lg:h-screen
        w-64 bg-chocolate-950/80 backdrop-blur-xl text-white flex flex-col border-r border-chocolate-850/60
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:transform-none
      `}>
        {/* Desktop Header */}
        <div className="hidden lg:flex lg:flex-col lg:items-center lg:justify-center p-6 border-b border-chocolate-800/80 bg-chocolate-950/40 relative">
          <div className="absolute inset-0 bg-gold-500/5 blur-xl pointer-events-none rounded-full" />
          <p className="text-sm text-white font-semibold tracking-wide relative z-10">Admin ChocoCelia</p>
        </div>

        {/* Mobile spacer */}
        <div className="lg:hidden h-16"></div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 border-l-4 ${
                  isActive 
                    ? 'bg-gradient-to-r from-gold-500/15 to-transparent text-gold-400 font-bold border-gold-500 shadow-inner' 
                    : 'text-chocolate-200 hover:text-white hover:bg-chocolate-900/60 border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'text-gold-400 scale-110' : 'text-chocolate-300'}`} />
                <span className="font-semibold text-sm tracking-wide">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-chocolate-800/80">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-chocolate-200 hover:text-white hover:bg-chocolate-900/60 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-semibold text-sm tracking-wide">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
