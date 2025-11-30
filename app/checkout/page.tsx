'use client';

import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    message: '',
    method: 'whatsapp'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const orderData = {
        customerName: formData.name,
        customerPhone: formData.phone,
        customerEmail: formData.email || null,
        customerAddress: formData.address,
        preferredContact: formData.method,
        specialRequests: formData.message || null,
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        total: total
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        setIsSubmitted(true);
        clearCart();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Order submission error:', error);
      alert('Failed to place order. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
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

            {/* Shipping Info */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="bg-amber-500 text-white rounded-full p-2 mt-0.5">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-chocolate-900 mb-2 text-base">Delivery Charges</h3>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center justify-between bg-white/70 px-3 py-2 rounded-lg">
                      <span className="font-semibold text-chocolate-800">داخل بني سويف</span>
                      <span className="font-bold text-amber-700">20 جنيه</span>
                    </div>
                    <div className="flex items-center justify-between bg-white/70 px-3 py-2 rounded-lg">
                      <span className="font-semibold text-chocolate-800">شرق النيل</span>
                      <span className="font-bold text-amber-700">35 جنيه</span>
                    </div>
                  </div>
                  <p className="text-xs text-chocolate-600 mt-2 italic">
                    * سيتم إضافة رسوم التوصيل عند التأكيد
                  </p>
                </div>
              </div>
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
                <label className="block text-sm font-medium text-chocolate-700 mb-1">Delivery Address</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your full address"
                  className="w-full px-4 py-2 rounded-lg border border-chocolate-200 focus:border-chocolate-500 focus:ring-1 focus:ring-chocolate-500 outline-none transition-colors"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
                disabled={isSubmitting}
                className="w-full bg-chocolate-600 text-white py-3 rounded-full font-bold hover:bg-chocolate-700 transition-all shadow-lg mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Placing Order...
                  </>
                ) : (
                  'Place Order'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
