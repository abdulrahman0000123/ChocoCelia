'use client';

import Link from 'next/link';
import { ShoppingCart, Menu, X, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
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
          ? 'bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 backdrop-blur-xl shadow-xl shadow-amber-900/10' 
          : 'bg-gradient-to-r from-amber-100/90 via-orange-100/90 to-amber-100/90 backdrop-blur-md'
      }`}
    >
      {/* Decorative gradient line at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400" />
      
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
                <div className="absolute inset-0 bg-orange-400/20 blur-xl group-hover:bg-orange-500/30 transition-all rounded-full" />
                <img 
                  src={logo} 
                  alt="CHOCO-CELIA" 
                  className="relative h-20 w-auto max-w-xs object-contain drop-shadow-xl"
                  style={{ minHeight: '64px', maxHeight: '80px' }}
                />
              </motion.div>
            ) : (
              <span className="text-2xl font-bold bg-gradient-to-r from-amber-800 via-orange-600 to-amber-800 bg-clip-text text-transparent font-serif relative drop-shadow-md">
                CHOCO-CELIA
                <Sparkles className="absolute -top-1 -right-6 w-4 h-4 text-orange-500 animate-pulse" />
              </span>
            )}
          </Link>

          {/* Desktop Menu with modern gradient styling */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-1 px-3 py-2 bg-white/60 backdrop-blur-md rounded-full shadow-lg border border-amber-200/50">
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
                className="px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-500/40 hover:shadow-orange-500/60 transition-all"
              >
                {locale === 'en' ? 'عربي' : 'EN'}
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleCart}
                className="relative p-3 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50"
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
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
              className="px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm shadow-md"
            >
              {locale === 'en' ? 'AR' : 'EN'}
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleCart}
              className="relative p-2.5 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ring-2 ring-white">
                  {itemCount}
                </span>
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 rounded-full bg-white/80 backdrop-blur-sm text-amber-800 shadow-md border border-amber-200"
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
            className="md:hidden bg-gradient-to-br from-white via-amber-50 to-orange-50 backdrop-blur-xl border-t-2 border-orange-300 overflow-hidden shadow-2xl"
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
      className="relative px-4 py-2 text-sm font-bold text-amber-800 hover:text-orange-600 transition-colors rounded-full group"
    >
      <span className="relative z-10">{label}</span>
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-amber-400/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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
      className="block px-4 py-3 text-amber-900 font-bold hover:bg-gradient-to-r hover:from-orange-400/20 hover:to-amber-400/20 rounded-xl transition-all border-2 border-transparent hover:border-orange-300"
      onClick={onClick}
    >
      {label}
    </Link>
  );
}
