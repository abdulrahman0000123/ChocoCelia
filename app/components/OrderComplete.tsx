'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Phone, MessageCircle, Home } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import Link from 'next/link';

interface OrderCompleteProps {
  orderData: {
    customerName: string;
    customerPhone: string;
    orderId: string;
    subtotal: number;
    grandTotal: number;
    deliveryFee: number;
    paymentMethod: string;
  };
}

export function OrderComplete({ orderData }: OrderCompleteProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden"
      >
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
          >
            <CheckCircle className="w-12 h-12 text-green-600" />
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-2 font-cairo">
            {t('orderPlacedSuccessfully')}
          </h2>
          <p className="text-green-50 text-lg">
            {t('thankYouOrder')}, {orderData.customerName}!
          </p>
        </div>

        {/* Order Details */}
        <div className="p-8">
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 mb-6">
            <div className="text-center mb-4">
              <p className="text-sm text-green-600 mb-1">Order Number</p>
              <p className="text-2xl font-bold text-green-800">#{orderData.orderId.slice(-8).toUpperCase()}</p>
            </div>
            
            {/* Order Summary */}
            <div className="bg-white rounded-xl p-4 mb-4 border border-green-200">
              <h4 className="font-bold text-gray-800 mb-3">{t('orderSummary')}</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{t('subtotal')}:</span>
                  <span className="font-semibold">{orderData.subtotal.toFixed(2)} EGP</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{t('deliveryFee')}:</span>
                  <span className="font-semibold">{orderData.deliveryFee.toFixed(2)} EGP</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                  <span className="font-bold text-gray-800">{t('grandTotal')}:</span>
                  <span className="text-xl font-bold text-green-600">{orderData.grandTotal.toFixed(2)} EGP</span>
                </div>
              </div>
            </div>

            <div className="text-center space-y-3">
              <p className="text-green-700 font-medium">
                {t('weWillContactYou')}
              </p>
              <p className="text-green-600 text-sm">
                {orderData.paymentMethod === 'cash_on_delivery' && t('paymentOnDelivery')}
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-6">
            <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              {t('contactInformation')}
            </h4>
            <p className="text-blue-700">
              <strong>{t('phoneNumber')}:</strong> {orderData.customerPhone}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link 
              href="/menu"
              className="flex items-center justify-center gap-3 bg-chocolate-600 text-white py-3 px-6 rounded-xl font-bold hover:bg-chocolate-700 transition-all"
            >
              <Home className="w-5 h-5" />
              {t('continueShopping')}
            </Link>
            
            <a 
              href={`https://wa.me/+201234567890?text=Hello, I just placed order #${orderData.orderId.slice(-8).toUpperCase()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-green-600 text-white py-3 px-6 rounded-xl font-bold hover:bg-green-700 transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              {t('contactUs')}
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}