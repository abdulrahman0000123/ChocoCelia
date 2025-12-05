'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import Image from 'next/image';
import Link from 'next/link';

export function CartDrawer() {
  const { items, removeItem, updateQuantity, total, isOpen, toggleCart } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-black z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-chocolate-900 shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-chocolate-100">
              <h2 className="text-2xl font-bold font-serif text-chocolate-900 flex items-center gap-2">
                <ShoppingBag className="w-6 h-6" />
                Your Cart
              </h2>
              <button
                onClick={toggleCart}
                className="p-2 hover:bg-chocolate-50 rounded-full text-chocolate-500 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-chocolate-400 space-y-4">
                  <ShoppingBag className="w-16 h-16 opacity-20" />
                  <p className="text-lg">Your cart is empty</p>
                  <button
                    onClick={toggleCart}
                    className="text-chocolate-600 font-semibold hover:underline"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-20 h-20 bg-chocolate-50 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl">🍫</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-chocolate-900">{item.name}</h3>
                      <p className="text-chocolate-600 text-sm mb-2">
                        {item.price.toFixed(2)} EGP
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center bg-chocolate-50 rounded-full">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-white rounded-full text-chocolate-600 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-chocolate-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-white rounded-full text-chocolate-600 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-400 hover:text-red-600 transition-colors ml-auto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-chocolate-100 bg-chocolate-50/30">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-semibold text-chocolate-600">Total</span>
                  <span className="text-2xl font-bold text-chocolate-900">
                    {total.toFixed(2)} EGP
                  </span>
                </div>
                <Link
                  href="/checkout"
                  onClick={toggleCart}
                  className="block w-full bg-chocolate-600 text-white text-center py-4 rounded-full font-bold hover:bg-chocolate-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Proceed to Checkout
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
