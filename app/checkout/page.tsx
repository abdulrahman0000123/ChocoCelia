'use client';

import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
    method: 'whatsapp'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate order submission
    console.log('Order submitted:', { ...formData, items, total });
    setIsSubmitted(true);
    clearCart();
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-chocolate-50 flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-chocolate-900 mb-4 font-serif">Order Received!</h2>
          <p className="text-chocolate-600 mb-8">
            Thank you for your order, {formData.name}. We will contact you shortly to confirm the details.
          </p>
          <Link 
            href="/menu"
            className="block w-full bg-chocolate-600 text-white py-3 rounded-full font-bold hover:bg-chocolate-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-chocolate-950 flex flex-col items-center justify-center px-4">
        <h2 className="text-2xl font-bold text-chocolate-900 mb-4">Your cart is empty</h2>
        <Link 
          href="/menu"
          className="text-chocolate-600 hover:text-chocolate-800 underline"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chocolate-50/30 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link 
          href="/menu" 
          className="inline-flex items-center text-chocolate-600 hover:text-chocolate-800 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Menu
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-chocolate-100 h-fit">
            <h2 className="text-xl font-bold text-chocolate-900 mb-6 font-serif">Order Summary</h2>
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-chocolate-100 rounded-full flex items-center justify-center text-xs font-bold text-chocolate-800">
                      {item.quantity}
                    </span>
                    <span className="text-chocolate-800">{item.name}</span>
                  </div>
                  <span className="text-chocolate-600 font-medium">
                    {(item.price * item.quantity).toFixed(2)} EGP
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-chocolate-100 pt-4 flex justify-between items-center">
              <span className="text-lg font-bold text-chocolate-900">Total</span>
              <span className="text-2xl font-bold text-chocolate-900">{total.toFixed(2)} EGP</span>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-chocolate-100">
            <h2 className="text-xl font-bold text-chocolate-900 mb-6 font-serif">Contact Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-chocolate-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-chocolate-200 focus:border-chocolate-500 focus:ring-1 focus:ring-chocolate-500 outline-none transition-colors"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-chocolate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-chocolate-200 focus:border-chocolate-500 focus:ring-1 focus:ring-chocolate-500 outline-none transition-colors"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-chocolate-700 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 rounded-lg border border-chocolate-200 focus:border-chocolate-500 focus:ring-1 focus:ring-chocolate-500 outline-none transition-colors"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-chocolate-700 mb-1">Preferred Contact Method</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="method"
                      value="whatsapp"
                      checked={formData.method === 'whatsapp'}
                      onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                      className="text-chocolate-600 focus:ring-chocolate-500"
                    />
                    <span className="text-chocolate-700">WhatsApp</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="method"
                      value="call"
                      checked={formData.method === 'call'}
                      onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                      className="text-chocolate-600 focus:ring-chocolate-500"
                    />
                    <span className="text-chocolate-700">Phone Call</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-chocolate-700 mb-1">Message / Special Requests</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-chocolate-200 focus:border-chocolate-500 focus:ring-1 focus:ring-chocolate-500 outline-none transition-colors"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-chocolate-600 text-white py-3 rounded-full font-bold hover:bg-chocolate-700 transition-all shadow-lg mt-4"
              >
                Place Order
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
