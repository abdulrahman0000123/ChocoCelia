'use client';

import Link from 'next/link';
import { ShoppingCart, Menu, X, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { toggleCart, items } = useCart();
  const { locale, setLocale, t } = useLanguage();

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed w-full z-50 pt-4 px-4 sm:px-6 lg:px-8">
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`max-w-7xl mx-auto transition-all duration-300 rounded-full ${
          scrolled 
            ? 'bg-white/70 backdrop-blur-xl shadow-2xl shadow-amber-900/20' 
            : 'bg-white/80 backdrop-blur-lg shadow-xl shadow-amber-900/10'
        }`}
      >
        <div className="px-6 sm:px-8 lg:px-10 flex justify-between items-center h-20">
          {/* Logo with glow effect */}
          <Link href="/" className="relative flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-orange-400/20 blur-xl group-hover:bg-orange-500/30 transition-all rounded-full" />
              <img 
                src="/logo.svg" 
                alt="CHOCO-CELIA" 
                className="relative h-20 w-auto max-w-xs object-contain drop-shadow-xl"
                style={{ minHeight: '64px', maxHeight: '80px' }}
              />
            </motion.div>
          </Link>

          {/* Desktop Menu in center */}
          <div className="hidden md:flex items-center gap-4 flex-1 justify-center">
            <NavLink href="/" label={t('home')} />
            <NavLink href="/menu" label={t('menu')} />
            <NavLink href="/about" label={t('about')} />
            <NavLink href="/contact" label={t('contact')} />
          </div>
            
          <div className="hidden md:flex items-center gap-2">
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
      </motion.nav>

      {/* Mobile Menu with glass effect */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden mt-2 bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl shadow-amber-900/20 border border-amber-200/50"
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
    </div>
  );
}

// Desktop nav link component
function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className="relative"
    >
      <Link 
        href={href} 
        className="relative block px-7 py-3.5 text-lg font-bold text-amber-900 transition-all duration-300 rounded-full group"
      >
        {/* Rotating gradient border on hover */}
        <motion.div 
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100"
          style={{
            background: 'conic-gradient(from 0deg, #f97316, #fb923c, #fbbf24, #fb923c, #f97316)',
            padding: '2px',
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <div className="w-full h-full bg-white/95 rounded-full" />
        </motion.div>
        
        {/* Text */}
        <span className="relative z-10 drop-shadow-sm group-hover:text-orange-600 transition-colors duration-300">{label}</span>
        
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-400 opacity-0 group-hover:opacity-30 blur-xl -z-10 transition-all duration-500 rounded-full" />
      </Link>
    </motion.div>
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
