'use client';

import Link from 'next/link';
import { ShoppingCart, Menu, X, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { ThemeToggle } from './ThemeToggle';
import { useLanguage } from '../context/LanguageContext';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [logo, setLogo] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const { toggleCart, items } = useCart();
  const { locale, setLocale, t } = useLanguage();

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    fetchLogo();
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchLogo = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        console.log('Logo fetched:', data.logo ? 'Logo exists (length: ' + data.logo.length + ')' : 'No logo');
        setLogo(data.logo || '');
      }
    } catch (error) {
      console.error('Failed to fetch logo');
    }
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 dark:bg-chocolate-950/95 backdrop-blur-xl shadow-lg shadow-chocolate-900/10' 
          : 'bg-gradient-to-b from-white/90 to-white/70 dark:from-chocolate-950/90 dark:to-chocolate-950/70 backdrop-blur-md'
      }`}
    >
      {/* Gradient accent line */}
      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-gold-500 to-transparent opacity-70" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo with glow effect */}
          <Link href="/" className="relative flex items-center gap-3 group">
            {logo ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gold-500/20 blur-xl group-hover:bg-gold-500/30 transition-all rounded-full" />
                <img 
                  src={logo} 
                  alt="CHOCO-CELIA" 
                  className="relative h-20 w-auto max-w-xs object-contain"
                  style={{ minHeight: '64px', maxHeight: '80px' }}
                />
              </motion.div>
            ) : (
              <span className="text-2xl font-bold bg-gradient-to-r from-chocolate-800 via-gold-600 to-chocolate-800 dark:from-gold-400 dark:via-gold-200 dark:to-gold-400 bg-clip-text text-transparent font-serif relative">
                CHOCO-CELIA
                <Sparkles className="absolute -top-1 -right-6 w-4 h-4 text-gold-500 animate-pulse" />
              </span>
            )}
          </Link>

          {/* Desktop Menu with modern styling */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1.5 bg-chocolate-50/50 dark:bg-chocolate-900/30 rounded-full backdrop-blur-sm">
              <NavLink href="/" label={t('home')} />
              <NavLink href="/menu" label={t('menu')} />
              <NavLink href="/about" label={t('about')} />
              <NavLink href="/contact" label={t('contact')} />
            </div>
            
            <div className="flex items-center gap-2 ml-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
                className="px-3 py-1.5 rounded-full bg-gradient-to-r from-gold-500 to-gold-600 text-white font-medium text-sm shadow-lg shadow-gold-500/30 hover:shadow-gold-500/50 transition-all"
              >
                {locale === 'en' ? 'AR' : 'EN'}
              </motion.button>

              <ThemeToggle />
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleCart}
                className="relative p-2.5 rounded-full bg-chocolate-100 dark:bg-chocolate-800 text-chocolate-700 dark:text-chocolate-200 hover:bg-chocolate-200 dark:hover:bg-chocolate-700 transition-all shadow-md hover:shadow-lg"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-gradient-to-r from-gold-500 to-gold-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
              className="px-3 py-1.5 rounded-full bg-gradient-to-r from-gold-500 to-gold-600 text-white font-medium text-sm"
            >
              {locale === 'en' ? 'AR' : 'EN'}
            </motion.button>
            <ThemeToggle />
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleCart}
              className="relative p-2 rounded-full bg-chocolate-100 dark:bg-chocolate-800 text-chocolate-700 dark:text-chocolate-200"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-gold-500 to-gold-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-full bg-chocolate-100 dark:bg-chocolate-800 text-chocolate-700 dark:text-chocolate-200"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu with glass effect */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 dark:bg-chocolate-900/95 backdrop-blur-xl border-t border-chocolate-100 dark:border-chocolate-800 overflow-hidden shadow-xl"
          >
            <div className="px-4 pt-2 pb-4 space-y-1">
              <MobileNavLink href="/" label={t('home')} onClick={() => setIsOpen(false)} />
              <MobileNavLink href="/menu" label={t('menu')} onClick={() => setIsOpen(false)} />
              <MobileNavLink href="/about" label={t('about')} onClick={() => setIsOpen(false)} />
              <MobileNavLink href="/contact" label={t('contact')} onClick={() => setIsOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// Desktop nav link component
function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link 
      href={href} 
      className="relative px-4 py-2 text-sm font-medium text-chocolate-700 dark:text-chocolate-200 hover:text-chocolate-900 dark:hover:text-white transition-colors rounded-full group"
    >
      <span className="relative z-10">{label}</span>
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-gold-500/20 to-gold-600/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        layoutId="navHover"
      />
    </Link>
  );
}

// Mobile nav link component
function MobileNavLink({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      className="block px-4 py-3 text-chocolate-700 dark:text-chocolate-200 hover:bg-gradient-to-r hover:from-gold-500/10 hover:to-gold-600/10 rounded-xl font-medium transition-all border border-transparent hover:border-gold-500/20"
      onClick={onClick}
    >
      {label}
    </Link>
  );
}
