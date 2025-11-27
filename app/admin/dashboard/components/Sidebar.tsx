'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingBag, Settings, LogOut } from 'lucide-react';

const MENU_ITEMS = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/dashboard/products', icon: Package },
  { name: 'Categories', href: '/admin/dashboard/categories', icon: Package },
  { name: 'Orders', href: '/admin/dashboard/orders', icon: ShoppingBag },
  { name: 'Settings', href: '/admin/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-chocolate-900 text-white flex flex-col">
      <div className="p-6 border-b border-chocolate-800">
        <h1 className="text-xl font-bold font-serif text-gold-500">CHOCO-CELIA</h1>
        <p className="text-xs text-chocolate-400">Admin Panel</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
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
        <button className="flex items-center gap-3 px-4 py-3 w-full text-chocolate-200 hover:text-white hover:bg-chocolate-800 rounded-lg transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
