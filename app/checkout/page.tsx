'use client';

import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import { PaymentConfirmation } from '../components/PaymentConfirmation';
import { OrderComplete } from '../components/OrderComplete';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { t } = useLanguage();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState<any>(null);
  const [deliveryFees, setDeliveryFees] = useState({
    beniSuef: 20,
    eastNile: 40
  });
  const [paymentSettings, setPaymentSettings] = useState({
    instaPayLink: '',
    cashWalletNumber: '',
    facebookPageId: '61582630209700'
  });
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    deliveryArea: 'benisuef',
    message: '',
    method: 'whatsapp',
    paymentMethod: 'cash_on_delivery'
  });
  const [deliveryFee, setDeliveryFee] = useState(20);
  const [grandTotal, setGrandTotal] = useState(total);

  useEffect(() => {
    fetchDeliveryFees();
  }, []);

  useEffect(() => {
    // Update delivery fee and grand total when delivery area changes
    // Only apply delivery fee if the subtotal is greater than 0
    const fee = total > 0 
      ? (formData.deliveryArea === 'benisuef' ? deliveryFees.beniSuef : deliveryFees.eastNile)
      : 0;
    setDeliveryFee(fee);
    setGrandTotal(total + fee);
  }, [formData.deliveryArea, deliveryFees, total]);

  const fetchDeliveryFees = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setDeliveryFees({
          beniSuef: data.deliveryFeeBeniSuef || 20,
          eastNile: data.deliveryFeeEastNile || 40
        });
        setPaymentSettings({
          instaPayLink: data.instaPayLink || '',
          cashWalletNumber: data.cashWalletNumber || '',
          facebookPageId: data.facebook?.split('/').pop() || '61582630209700'
        });
        // Set initial delivery fee - only if subtotal > 0
        const initialFee = total > 0 ? (data.deliveryFeeBeniSuef || 20) : 0;
        setDeliveryFee(initialFee);
        setGrandTotal(total + initialFee);
      }
    } catch (error) {
      console.error('Failed to fetch delivery fees');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const deliveryAreaText = formData.deliveryArea === 'benisuef' ? 'داخل بني سويف' : 'شرق النيل';
      const orderData = {
        customerName: formData.name,
        customerPhone: formData.phone,
        customerEmail: formData.email || null,
        customerAddress: `${formData.address} - ${deliveryAreaText}`,
        preferredContact: formData.method,
        specialRequests: formData.message || null,
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        total: grandTotal
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        const orderResult = await res.json();
        clearCart();
        
        // Check payment method to determine next step
        if (formData.paymentMethod === 'cash_on_delivery') {
          // For cash on delivery, show order complete page
          setOrderComplete({
            customerName: formData.name,
            customerPhone: formData.phone,
            orderId: orderResult.id,
            subtotal: total,
            grandTotal: grandTotal,
            deliveryFee: deliveryFee,
            paymentMethod: formData.paymentMethod
          });
        } else {
          // For online payment, show payment confirmation page
          setIsSubmitted(true);
        }
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

  if (orderComplete) {
    return (
      <OrderComplete 
        orderData={orderComplete}
      />
    );
  }

  if (isSubmitted) {
    return (
      <PaymentConfirmation 
        orderData={{
          customerName: formData.name,
          subtotal: total,
          grandTotal: grandTotal,
          deliveryFee: deliveryFee
        }}
        paymentSettings={paymentSettings}
      />
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-chocolate-950 flex flex-col items-center justify-center px-4">
        <h2 className="text-2xl font-bold text-chocolate-900 mb-4">{t('yourCartIsEmpty')}</h2>
        <Link 
          href="/menu"
          className="text-chocolate-600 hover:text-chocolate-800 underline"
        >
          {t('browseMenu')}
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
          {t('backToMenu')}
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-chocolate-100 h-fit">
            <h2 className="text-xl font-bold text-chocolate-900 mb-6 font-cairo">{t('orderSummary')}</h2>
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
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4 mb-4">
              <h3 className="font-bold text-chocolate-900 mb-3 text-base flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('orderSummary')}
              </h3>
              <div className="space-y-2 bg-white/70 rounded-lg p-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-chocolate-700">{t('subtotal')}:</span>
                  <span className="font-semibold text-chocolate-900">{total.toFixed(2)} EGP</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-chocolate-700">{t('deliveryFee')}:</span>
                  <span className="font-semibold text-amber-700">{deliveryFee.toFixed(2)} EGP</span>
                </div>
                <div className="border-t border-amber-200 pt-2 mt-2 flex justify-between items-center">
                  <span className="text-base font-bold text-chocolate-900">{t('grandTotal')}:</span>
                  <span className="text-xl font-bold text-orange-600">{grandTotal.toFixed(2)} EGP</span>
                </div>
              </div>
            </div>

            <div className="border-t border-chocolate-100 pt-4 flex justify-between items-center">
              <span className="text-lg font-bold text-chocolate-900">{t('total')}</span>
              <span className="text-2xl font-bold text-chocolate-900">{grandTotal.toFixed(2)} EGP</span>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-chocolate-100">
            <h2 className="text-xl font-bold text-chocolate-900 mb-6 font-cairo">{t('contactDetails')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-chocolate-700 mb-1">{t('name')}</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-chocolate-200 focus:border-chocolate-500 focus:ring-1 focus:ring-chocolate-500 outline-none transition-colors text-black"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-chocolate-700 mb-1">{t('phoneNumber')}</label>
                <input
                  type="tel"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-chocolate-200 focus:border-chocolate-500 focus:ring-1 focus:ring-chocolate-500 outline-none transition-colors text-black"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-chocolate-700 mb-1">{t('emailOptional')}</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 rounded-lg border border-chocolate-200 focus:border-chocolate-500 focus:ring-1 focus:ring-chocolate-500 outline-none transition-colors text-black"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-chocolate-700 mb-1">{t('address')} *</label>
                <textarea
                  required
                  rows={3}
                  placeholder={t('addressPlaceholder')}
                  className="w-full px-4 py-2 rounded-lg border border-chocolate-200 focus:border-chocolate-500 focus:ring-1 focus:ring-chocolate-500 outline-none transition-colors text-black resize-none"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-chocolate-700 mb-2">{t('selectDeliveryArea')} *</label>
                {total > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    <label className="relative flex items-center gap-3 cursor-pointer bg-white border-2 border-chocolate-200 rounded-xl p-4 hover:border-amber-500 transition-all">
                      <input
                        type="radio"
                        name="deliveryArea"
                        value="benisuef"
                        checked={formData.deliveryArea === 'benisuef'}
                        onChange={(e) => setFormData({ ...formData, deliveryArea: e.target.value })}
                        className="text-chocolate-600 focus:ring-chocolate-500"
                      />
                      <div className="flex-1">
                        <p className="font-bold text-chocolate-900">{t('insideBeniSuef')}</p>
                        <p className="text-sm text-amber-700 font-semibold">{deliveryFees.beniSuef} EGP</p>
                      </div>
                    </label>
                    <label className="relative flex items-center gap-3 cursor-pointer bg-white border-2 border-chocolate-200 rounded-xl p-4 hover:border-amber-500 transition-all">
                      <input
                        type="radio"
                        name="deliveryArea"
                        value="eastnile"
                        checked={formData.deliveryArea === 'eastnile'}
                        onChange={(e) => setFormData({ ...formData, deliveryArea: e.target.value })}
                        className="text-chocolate-600 focus:ring-chocolate-500"
                      />
                      <div className="flex-1">
                      <p className="font-bold text-chocolate-900">{t('eastNile')}</p>
                      <p className="text-sm text-amber-700 font-semibold">{deliveryFees.eastNile} EGP</p>
                    </div>
                  </label>
                </div>
                ) : (
                  <div className="bg-gray-100 border border-gray-300 rounded-xl p-4 text-center">
                    <p className="text-gray-500 text-sm">
                      {t('deliveryOptionsAvailableAfterAdding')}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-chocolate-700 mb-1">{t('preferredContactMethod')}</label>
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
                    <span className="text-chocolate-700">{t('whatsapp')}</span>
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
                    <span className="text-chocolate-700">{t('phoneCall')}</span>
                  </label>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-medium text-chocolate-700 mb-2">{t('paymentMethod')} *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="relative flex items-center gap-3 cursor-pointer bg-white border-2 border-chocolate-200 rounded-xl p-4 hover:border-amber-500 transition-all">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash_on_delivery"
                      checked={formData.paymentMethod === 'cash_on_delivery'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="text-chocolate-600 focus:ring-chocolate-500"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-chocolate-900">{t('cashOnDelivery')}</p>
                      <p className="text-xs text-chocolate-600 mt-1">{t('paymentOnDelivery')}</p>
                    </div>
                  </label>
                  <label className="relative flex items-center gap-3 cursor-pointer bg-white border-2 border-chocolate-200 rounded-xl p-4 hover:border-amber-500 transition-all">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online_payment"
                      checked={formData.paymentMethod === 'online_payment'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="text-chocolate-600 focus:ring-chocolate-500"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-chocolate-900">{t('onlinePayment')}</p>
                      <p className="text-xs text-chocolate-600 mt-1">إنستا باي أو محفظة الكاش</p>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-chocolate-700 mb-1">{t('messageSpecialRequests')}</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-chocolate-200 focus:border-chocolate-500 focus:ring-1 focus:ring-chocolate-500 outline-none transition-colors text-black"
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
                    {t('placingOrder')}
                  </>
                ) : (
                  t('placeOrder')
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
