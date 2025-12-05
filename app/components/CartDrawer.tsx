'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, Trash2, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../lib/translations';
import Image from 'next/image';
import Link from 'next/link';

export function CartDrawer() {
  const { items, removeItem, updateQuantity, total, isOpen, toggleCart } = useCart();
  const { locale } = useLanguage();
  const t = (key: string) => translations[locale][key] || key;
  
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modern Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-gradient-to-b from-white to-chocolate-50/30 dark:from-chocolate-900 dark:to-chocolate-950 shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header with gradient */}
            <div className="relative bg-gradient-to-r from-chocolate-600 via-chocolate-700 to-chocolate-800 dark:from-gold-600 dark:via-gold-700 dark:to-gold-800 p-6 pb-8">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                    <ShoppingBag className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold font-cairo text-white">
                      {t('yourCart')}
                    </h2>
                    <p className="text-white/80 text-sm">{itemCount} {t('items')}</p>
                  </div>
                </div>
                <button
                  onClick={toggleCart}
                  className="p-2.5 hover:bg-white/20 rounded-full text-white transition-all active:scale-95"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
              {items.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="h-full flex flex-col items-center justify-center text-chocolate-400 dark:text-chocolate-500 space-y-6 py-20"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-chocolate-200 dark:bg-chocolate-800 rounded-full blur-2xl opacity-50"></div>
                    <ShoppingBag className="relative w-20 h-20 opacity-30" />
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-chocolate-800 dark:text-chocolate-200 mb-2">{t('yourCartIsEmpty')}</p>
                    <p className="text-sm text-chocolate-500">اكتشف منتجاتنا المميزة</p>
                  </div>
                  <button
                    onClick={toggleCart}
                    className="px-8 py-3 bg-gradient-to-r from-chocolate-600 to-chocolate-700 dark:from-gold-600 dark:to-gold-700 text-white rounded-full font-bold hover:shadow-lg transition-all active:scale-95"
                  >
                    {t('startShopping')}
                  </button>
                </motion.div>
              ) : (
                items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white dark:bg-chocolate-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="relative w-24 h-24 bg-gradient-to-br from-chocolate-100 to-chocolate-200 dark:from-chocolate-700 dark:to-chocolate-800 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden group">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <span className="text-3xl">🍫</span>
                        )}
                        <div className="absolute top-2 right-2">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full transition-all shadow-lg active:scale-90"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-chocolate-900 dark:text-chocolate-100 mb-1 truncate font-cairo">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-3">
                          <Tag className="w-4 h-4 text-gold-500" />
                          <span className="text-lg font-bold text-chocolate-700 dark:text-gold-400">
                            {item.price.toFixed(2)} EGP
                          </span>
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-chocolate-100 dark:bg-chocolate-700 rounded-full shadow-inner">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-2 hover:bg-chocolate-200 dark:hover:bg-chocolate-600 rounded-full text-chocolate-700 dark:text-chocolate-200 transition-all active:scale-90"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-10 text-center text-base font-bold text-chocolate-900 dark:text-chocolate-100">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-2 hover:bg-chocolate-200 dark:hover:bg-chocolate-600 rounded-full text-chocolate-700 dark:text-chocolate-200 transition-all active:scale-90"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex-1 text-right">
                            <span className="text-sm text-chocolate-500 dark:text-chocolate-400">المجموع</span>
                            <p className="text-lg font-bold text-chocolate-800 dark:text-chocolate-200">
                              {(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer with Total */}
            {items.length > 0 && (
              <div className="border-t border-chocolate-200 dark:border-chocolate-800 bg-white dark:bg-chocolate-900 p-6 space-y-4">
                {/* Subtotal */}
                <div className="bg-gradient-to-r from-chocolate-50 to-chocolate-100 dark:from-chocolate-800 dark:to-chocolate-700 rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-chocolate-600 dark:text-chocolate-300">المجموع الفرعي</span>
                    <span className="text-lg font-semibold text-chocolate-800 dark:text-chocolate-200">
                      {total.toFixed(2)} EGP
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-chocolate-900 dark:text-chocolate-100">{t('total')}</span>
                    <span className="text-2xl font-bold text-gold-600 dark:text-gold-400">
                      {total.toFixed(2)} EGP
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Link
                  href="/checkout"
                  onClick={toggleCart}
                  className="block w-full"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-chocolate-600 via-chocolate-700 to-chocolate-800 dark:from-gold-600 dark:via-gold-700 dark:to-gold-800 text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    <ShoppingBag className="w-6 h-6 relative z-10" />
                    <span className="relative z-10">{t('proceedToCheckout')}</span>
                  </motion.button>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
