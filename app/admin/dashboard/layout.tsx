'use client';

import { Sidebar } from './components/Sidebar';
import OrderNotification from './components/OrderNotification';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/session');
      if (!res.ok) {
        router.push('/admin/login');
      }
    } catch (error) {
      router.push('/admin/login');
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-chocolate-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent lg:flex">
      <Sidebar />
      {/* Notification Bell for Desktop - Top right corner of main content area */}
      <div className="hidden lg:block lg:fixed lg:top-4 lg:right-4 z-50">
        <OrderNotification />
      </div>
      {/* Mobile Notification Bell - Bottom right corner, floating */}
      <div className="lg:hidden fixed bottom-6 right-6 z-[60]">
        <OrderNotification />
      </div>
      {/* Main content with top padding on mobile for the fixed header */}
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto pt-16 lg:pt-8 pb-24 lg:pb-8">
        {children}
      </main>
    </div>
  );
}
