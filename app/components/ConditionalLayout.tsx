'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';
import ChocolatePreloader from './ChocolatePreloader';

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Check if we're in admin routes
  const isAdminRoute = pathname?.startsWith('/admin');
  
  // Check if we're in checkout route (locale-prefixed or not)
  const isCheckoutRoute = pathname === '/checkout' || pathname?.endsWith('/checkout');

  if (isAdminRoute || isCheckoutRoute) {
    // Admin layout or checkout: no navbar, no footer, no cart
    return <>{children}</>;
  }

  // Public layout: with navbar, footer, and cart
  return (
    <>
      <ChocolatePreloader />
      <Navbar />
      <CartDrawer />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </>
  );
}
