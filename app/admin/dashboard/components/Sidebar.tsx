'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingBag, Settings, LogOut, Menu, X, FolderTree } from 'lucide-react';
import { useState } from 'react';

const MENU_ITEMS = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/dashboard/products', icon: Package },
  { name: 'Categories', href: '/admin/dashboard/categories', icon: FolderTree },
  { name: 'Orders', href: '/admin/dashboard/orders', icon: ShoppingBag },
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
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-amber-50 px-4 py-2 shadow-lg border-b border-amber-200">
        <div className="flex items-center justify-center gap-2">
          <img 
            src="/logo.svg" 
            alt="CHOCO-CELIA" 
            className="h-10 w-auto object-contain"
          />
          <p className="text-xs text-chocolate-700 font-semibold">Admin Panel</p>
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-amber-100 transition-colors text-chocolate-700"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-chocolate-900 text-white flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:transform-none
      `}>
        {/* Desktop Header */}
        <div className="hidden lg:flex lg:flex-col lg:items-center lg:justify-center p-6 border-b border-amber-200 bg-amber-50">
          <img 
            src="/logo.svg" 
            alt="CHOCO-CELIA" 
            className="h-20 w-auto object-contain mb-3"
          />
          <p className="text-sm text-chocolate-700 font-semibold">Admin Panel</p>
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
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-chocolate-800 text-white' 
                    : 'text-chocolate-200 hover:bg-chocolate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-chocolate-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-chocolate-200 hover:text-white hover:bg-chocolate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
