'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Copy, ExternalLink, MessageCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import Link from 'next/link';

interface PaymentConfirmationProps {
  orderData: {
    customerName: string;
    subtotal: number;
    grandTotal: number;
    deliveryFee: number;
  };
  paymentSettings: {
    instaPayLink: string;
    cashWalletNumber: string;
    facebookPageId: string;
  };
}

export function PaymentConfirmation({ orderData, paymentSettings }: PaymentConfirmationProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(paymentSettings.cashWalletNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToFacebook = () => {
    // Open Facebook Messenger to the page
    const messengerUrl = `https://m.me/${paymentSettings.facebookPageId}`;
    window.open(messengerUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-chocolate-50 flex items-center justify-center px-4 py-12">
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
            {t('orderReceived')}
          </h2>
          <p className="text-green-50 text-lg">
            {t('thankYouOrder')}, {orderData.customerName}!
          </p>
        </div>

        {/* Payment Details */}
        <div className="p-8">
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 mb-6">
            <h3 className="text-xl font-bold text-chocolate-900 mb-4 font-cairo">
              {t('paymentInstructions')}
            </h3>
            <p className="text-chocolate-700 mb-4">
              {t('paymentConfirmationMsg')}
            </p>
            
            {/* Total Amount */}
            <div className="bg-white rounded-xl p-4 mb-6 border-2 border-amber-300">
              <div className="flex justify-between items-center mb-2">
                <span className="text-chocolate-700">{t('subtotal')}:</span>
                <span className="text-chocolate-900 font-semibold">
                  {orderData.subtotal.toFixed(2)} EGP
                </span>
              </div>
              <div className="flex justify-between items-center mb-3 pb-3 border-b border-amber-200">
                <span className="text-chocolate-700">{t('deliveryFee')}:</span>
                <span className="text-chocolate-900 font-semibold">
                  {orderData.deliveryFee.toFixed(2)} EGP
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-chocolate-900">{t('grandTotal')}:</span>
                <span className="text-2xl font-bold text-orange-600">
                  {orderData.grandTotal.toFixed(2)} EGP
                </span>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-4">
              {/* InstaPay */}
              {paymentSettings.instaPayLink && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-purple-600 text-white rounded-full p-2">
                      <ExternalLink className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-chocolate-900 text-lg">{t('payWithInstaPay')}</h4>
                  </div>
                  <a
                    href={paymentSettings.instaPayLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-bold text-center hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {t('instaPay')} →
                  </a>
                </div>
              )}

              {/* Cash Wallet */}
              {paymentSettings.cashWalletNumber && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-green-600 text-white rounded-full p-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-chocolate-900 text-lg">{t('transferToWallet')}</h4>
                  </div>
                  <div className="bg-white rounded-lg p-4 mb-3 border border-green-300">
                    <p className="text-sm text-chocolate-600 mb-2">{t('cashWallet')}:</p>
                    <p className="text-2xl font-bold text-chocolate-900 text-center tracking-wider" dir="ltr">
                      {paymentSettings.cashWalletNumber}
                    </p>
                  </div>
                  <button
                    onClick={handleCopyWallet}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Copy className="w-5 h-5" />
                    {copied ? t('walletNumberCopied') : t('copyWalletNumber')}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Send Receipt to Facebook */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-600 text-white rounded-full p-2">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-chocolate-900 text-lg">{t('sendReceiptToFacebook')}</h4>
                <p className="text-sm text-chocolate-600">أرسل صورة الإيصال لتأكيد الدفع</p>
              </div>
            </div>
            <button
              onClick={handleSendToFacebook}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              فتح Messenger
            </button>
          </div>

          {/* Continue Shopping */}
          <Link 
            href="/menu"
            className="block w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white py-4 rounded-xl font-bold text-center hover:from-orange-600 hover:to-amber-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {t('continueShopping')}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
