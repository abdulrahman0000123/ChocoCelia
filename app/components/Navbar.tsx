'use client';

import { ShoppingCart, Menu, X, Home, UtensilsCrossed, Info, Mail, Heart, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useWishlist } from '../hooks/useWishlist';
import { SearchBar } from './SearchBar';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { toggleCart, items } = useCart();
  const { wishlist } = useWishlist();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations();

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLanguageSwitch = () => {
    const nextLocale = locale === 'en' ? 'ar' : 'en';
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <div 
      className="fixed w-full z-50 pt-3 px-2 sm:pt-4 sm:px-6 lg:px-8 transition-all duration-300"
      style={{ top: 'var(--promo-banner-height, 0px)' }}
    >
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`max-w-7xl mx-auto transition-all duration-300 rounded-full ${
          scrolled 
            ? 'bg-background/90 backdrop-blur-xl shadow-xl shadow-chocolate-900/10 ring-1 ring-border/70'
            : 'bg-background/95 backdrop-blur-lg shadow-lg shadow-chocolate-900/5 ring-1 ring-border/60'
        }`}
      >
        <div className="px-2 sm:px-8 lg:px-10 flex justify-between items-center h-16 sm:h-20">
          {/* Logo with glow effect */}
          <Link
            href="/"
            aria-label={locale === 'ar' ? 'شوكو سيليا - الرئيسية' : 'Choco Celia home'}
            className="relative flex items-center gap-1.5 sm:gap-2.5"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              className="relative flex-none"
            >
              <span className="brand-mark" aria-hidden="true" />
            </motion.div>
            <span className="brand-wordmark-wrap">
              <span className="brand-wordmark">Choco Celia</span>
              <span className="brand-caption hidden md:block">HANDMADE CHOCOLATE</span>
            </span>
          </Link>

          {/* Desktop Menu in center */}
          <div className="hidden md:flex items-center gap-4 flex-1 justify-center">
            <NavLink href="/" label={t('home')} icon={<Home className="w-5 h-5" />} />
            <NavLink href="/menu" label={t('menu')} icon={<UtensilsCrossed className="w-5 h-5" />} />
            <NavLink href="/about" label={t('about')} icon={<Info className="w-5 h-5" />} />
            <NavLink href="/contact" label={t('contact')} icon={<Mail className="w-5 h-5" />} />
          </div>
            
          <div className="hidden md:flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLanguageSwitch}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-500/40 hover:shadow-orange-500/60 transition-all cursor-pointer min-h-[44px]"
            >
              {locale === 'en' ? 'عربي' : 'EN'}
            </motion.button>
            
            <Link
              href="/wishlist"
              aria-label={t('wishlist')}
              className="relative p-3 rounded-full bg-white dark:bg-chocolate-800 text-chocolate-700 dark:text-chocolate-200 hover:text-red-500 transition-all border border-chocolate-100 dark:border-chocolate-750 shadow-md min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              title={t('wishlist')}
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md ring-2 ring-white"
                >
                  {wishlist.length}
                </motion.span>
              )}
            </Link>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSearchOpen(true)}
              aria-label={t('searchPlaceholder')}
              className="p-3 rounded-full bg-white dark:bg-chocolate-800 text-chocolate-700 dark:text-chocolate-200 hover:text-orange-600 border border-chocolate-100 dark:border-chocolate-750 shadow-md min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              title={t('searchPlaceholder')}
            >
              <Search className="w-5 h-5" />
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleCart}
              aria-label={locale === 'ar' ? 'سلة التسوق' : 'Shopping cart'}
              className="relative p-3 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg ring-2 ring-white"
                >
                  {itemCount}
                </motion.span>
              )}
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLanguageSwitch}
              className="px-3 py-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs shadow-md cursor-pointer min-h-[44px] flex items-center"
            >
              {locale === 'en' ? 'AR' : 'EN'}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSearchOpen(true)}
              aria-label={t('searchPlaceholder')}
              className="p-2 rounded-full bg-surface text-chocolate-700 dark:text-chocolate-100 shadow-sm border border-border min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleCart}
              aria-label={locale === 'ar' ? 'سلة التسوق' : 'Shopping cart'}
              className="relative p-2 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <ShoppingCart className="w-4 h-4" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center ring-1 ring-white">
                  {itemCount}
                </span>
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? (locale === 'ar' ? 'إغلاق القائمة' : 'Close menu') : (locale === 'ar' ? 'فتح القائمة' : 'Open menu')}
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
              className="p-2 rounded-full bg-surface/90 backdrop-blur-sm text-foreground shadow-sm border border-border cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu with glass effect */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            id="mobile-navigation"
            className="md:hidden mt-2 bg-background/95 backdrop-blur-xl rounded-3xl overflow-hidden shadow-xl shadow-chocolate-900/10 border border-border"
          >
            <div className="px-4 pt-2 pb-4 space-y-1">
              <MobileNavLink href="/" label={t('home')} icon={<Home className="w-5 h-5" />} onClick={() => setIsOpen(false)} />
              <MobileNavLink href="/menu" label={t('menu')} icon={<UtensilsCrossed className="w-5 h-5" />} onClick={() => setIsOpen(false)} />
              <MobileNavLink href="/wishlist" label={t('wishlist')} icon={<Heart className="w-5 h-5" />} onClick={() => setIsOpen(false)} />
              <MobileNavLink href="/about" label={t('about')} icon={<Info className="w-5 h-5" />} onClick={() => setIsOpen(false)} />
              <MobileNavLink href="/contact" label={t('contact')} icon={<Mail className="w-5 h-5" />} onClick={() => setIsOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSearchOpen && <SearchBar onClose={() => setIsSearchOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}

// Desktop nav link component
function NavLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className="px-6 py-2.5 text-base font-bold text-foreground hover:text-chocolate-600 dark:hover:text-chocolate-300 transition-colors duration-200 rounded-full flex items-center gap-2"
    >
      {icon}
      {label}
    </Link>
  );
}

// Mobile nav link component
function MobileNavLink({ href, label, icon, onClick }: { href: string; label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 px-5 py-4 text-base text-foreground font-bold hover:bg-surface-muted rounded-xl transition-colors border border-transparent hover:border-border"
      onClick={onClick}
    >
      {icon}
      {label}
    </Link>
  );
}
