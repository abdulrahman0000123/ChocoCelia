'use client';

import { useState, useEffect, use } from 'react';
import { useCart } from '../../context/CartContext';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { PaymentConfirmation } from '../../components/PaymentConfirmation';
import { OrderComplete } from '../../components/OrderComplete';

interface CheckoutPageProps {
  params: Promise<{ locale: string }>;
}

interface CheckoutProduct {
  id: string;
  name: string;
  nameAr?: string | null;
  price: number;
}

interface CheckoutOrder {
  customerName: string;
  customerPhone: string;
  orderId: string;
  subtotal: number;
  grandTotal: number;
  deliveryFee: number;
  paymentMethod: string;
}

interface ConfirmationOrder {
  customerName: string;
  subtotal: number;
  grandTotal: number;
  deliveryFee: number;
}

export default function CheckoutPage({ params }: CheckoutPageProps) {
  const { locale } = use(params);
  const { items, clearCart } = useCart();
  const [catalog, setCatalog] = useState<CheckoutProduct[]>([]);
  const [catalogReady, setCatalogReady] = useState(false);
  const [catalogError, setCatalogError] = useState(false);
  const unavailableItems = catalogReady && items.some((item) => !catalog.some((product) => product.id === item.id));
  const checkoutSubtotal = items.reduce((sum, item) => {
    const currentProduct = catalog.find((product) => product.id === item.id);
    return sum + (currentProduct?.price ?? item.price) * item.quantity;
  }, 0);
  const t = useTranslations();
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState<CheckoutOrder | null>(null);
  const [savedOrderData, setSavedOrderData] = useState<ConfirmationOrder | null>(null);
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
  const [grandTotal, setGrandTotal] = useState(checkoutSubtotal);

  useEffect(() => {
    let active = true;
    async function loadCheckoutData() {
      try {
        const [settingsResponse, productsResponse] = await Promise.all([fetch('/api/settings'), fetch('/api/products/catalog')]);
        if (productsResponse.ok) {
          const products = await productsResponse.json();
          if (active) {
            setCatalog(products);
            setCatalogReady(true);
          }
        } else if (active) {
          setCatalogError(true);
        }
        if (settingsResponse.ok) {
          const data = await settingsResponse.json();
          if (active) {
            setDeliveryFees({ beniSuef: data.deliveryFeeBeniSuef ?? 20, eastNile: data.deliveryFeeEastNile ?? 40 });
            setPaymentSettings({
              instaPayLink: data.instaPayLink || '',
              cashWalletNumber: data.cashWalletNumber || '',
              facebookPageId: data.facebook?.split('/').pop() || '61582630209700',
            });
          }
        }
      } catch {
        if (active) {
          setCatalogError(true);
          console.error('Failed to load checkout details');
        }
      }
    }
    void loadCheckoutData();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const fee = checkoutSubtotal > 0
      ? (formData.deliveryArea === 'benisuef' ? deliveryFees.beniSuef : deliveryFees.eastNile)
      : 0;
    setDeliveryFee(fee);
    setGrandTotal(checkoutSubtotal + fee);
  }, [formData.deliveryArea, deliveryFees, checkoutSubtotal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catalogReady || catalogError || unavailableItems) {
      alert(locale === 'ar' ? 'أحد المنتجات في سلتك لم يعد متاحاً أو تعذر تحديث الأسعار. حدّث السلة ثم أعد المحاولة.' : 'A product is unavailable or prices could not be refreshed. Update your cart and try again.');
      return;
    }
    setIsSubmitting(true);

    try {
      const deliveryAreaText = formData.deliveryArea === 'benisuef' 
        ? (locale === 'ar' ? 'داخل بني سويف' : 'Inside Beni Suef') 
        : (locale === 'ar' ? 'شرق النيل' : 'East Nile');

      const orderData = {
        customerName: formData.name,
        customerPhone: formData.phone,
        customerEmail: formData.email || null,
        customerAddress: `${formData.address} - ${deliveryAreaText}`,
        preferredContact: formData.method,
        specialRequests: formData.message || null,
        paymentMethod: formData.paymentMethod,
        deliveryArea: formData.deliveryArea === 'benisuef' ? 'beniSuef' : 'eastNile',
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: catalog.find((product) => product.id === item.id)?.price ?? item.price
        }))
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        const orderResult = await res.json();
        
        const orderDataForConfirmation = {
          customerName: formData.name,
          subtotal: orderResult.subtotal,
          grandTotal: orderResult.total,
          deliveryFee: orderResult.deliveryFee
        };
        
        clearCart();
        
        if (formData.paymentMethod === 'cash_on_delivery') {
          setOrderComplete({
            customerName: formData.name,
            customerPhone: formData.phone,
            orderId: orderResult.id,
            subtotal: orderDataForConfirmation.subtotal,
            grandTotal: orderDataForConfirmation.grandTotal,
            deliveryFee: orderDataForConfirmation.deliveryFee,
            paymentMethod: formData.paymentMethod
          });
        } else {
          setSavedOrderData(orderDataForConfirmation);
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
    return <OrderComplete orderData={orderComplete} />;
  }

  if (isSubmitted) {
    return (
      <PaymentConfirmation 
        orderData={savedOrderData || {
          customerName: formData.name,
          subtotal: checkoutSubtotal,
          grandTotal: grandTotal,
          deliveryFee: deliveryFee
        }}
        paymentSettings={paymentSettings}
      />
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-chocolate-950 flex flex-col items-center justify-center px-4 font-cairo">
        <h2 className="text-2xl font-bold text-chocolate-900 dark:text-chocolate-100 mb-4">{t('yourCartIsEmpty')}</h2>
        <Link 
          href="/menu"
          className="text-gold-600 hover:text-gold-700 underline font-bold"
        >
          {t('browseMenu')}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chocolate-50/20 dark:bg-chocolate-950/10 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link 
          href="/menu" 
          className="inline-flex items-center text-chocolate-600 hover:text-chocolate-800 dark:text-gold-500 dark:hover:text-gold-400 mb-8 transition-colors font-bold font-cairo cursor-pointer min-h-[44px]"
        >
          <ArrowLeft className={`w-5 h-5 ${locale === 'ar' ? 'ml-2 rotate-180' : 'mr-2'}`} />
          {t('backToMenu')}
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white dark:bg-chocolate-900 p-6 rounded-3xl shadow-lg border border-chocolate-100/50 dark:border-chocolate-800/80 h-fit">
            <h2 className="text-xl font-bold text-chocolate-900 dark:text-chocolate-100 mb-6 font-cairo border-b border-chocolate-50 dark:border-chocolate-800 pb-3">{t('orderSummary')}</h2>
            {!catalogReady && !catalogError && <p role="status" className="mb-4 text-sm text-chocolate-600 dark:text-chocolate-300">{locale === 'ar' ? 'جارٍ تحديث الأسعار…' : 'Refreshing prices…'}</p>}
            {catalogError && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800 dark:bg-red-950/40 dark:text-red-200">{locale === 'ar' ? 'تعذر تحديث الأسعار. تحقق من اتصالك ثم أعد تحميل الصفحة.' : 'Could not refresh prices. Check your connection and reload the page.'}</p>}
            {unavailableItems && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800 dark:bg-red-950/40 dark:text-red-200">{locale === 'ar' ? 'أحد المنتجات لم يعد متاحاً. أزله من السلة ثم أعد المحاولة.' : 'A product is no longer available. Remove it from your cart before continuing.'}</p>}
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm font-semibold">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-chocolate-100 dark:bg-chocolate-800 rounded-full flex items-center justify-center text-xs font-bold text-chocolate-850 dark:text-chocolate-200">
                      {item.quantity}
                    </span>
                    <span className="text-chocolate-850 dark:text-chocolate-200">{(() => {
                      const product = catalog.find((entry) => entry.id === item.id);
                      return locale === 'ar' && product?.nameAr ? product.nameAr : product?.name || item.name;
                    })()}</span>
                  </div>
                  <span className="text-chocolate-700 dark:text-chocolate-300">
                    {((catalog.find((product) => product.id === item.id)?.price ?? item.price) * item.quantity).toFixed(2)} EGP
                  </span>
                </div>
              ))}
            </div>

            {/* Shipping Info Card */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-chocolate-800 dark:to-chocolate-850 border border-amber-200 dark:border-chocolate-700 rounded-2xl p-4 mb-6">
              <div className="space-y-2 bg-white/70 dark:bg-chocolate-900/50 rounded-xl p-3">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-chocolate-700 dark:text-chocolate-300">{t('subtotal')}:</span>
                  <span className="text-chocolate-900 dark:text-white">{checkoutSubtotal.toFixed(2)} EGP</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-chocolate-700 dark:text-chocolate-300">{t('deliveryFee')}:</span>
                  <span className="text-amber-700 dark:text-gold-500">{deliveryFee.toFixed(2)} EGP</span>
                </div>
                <div className="border-t border-amber-200 dark:border-chocolate-700 pt-2 mt-2 flex justify-between items-center">
                  <span className="text-sm font-extrabold text-chocolate-900 dark:text-white">{t('grandTotal')}:</span>
                  <span className="text-lg font-extrabold text-orange-600 dark:text-gold-500">{grandTotal.toFixed(2)} EGP</span>
                </div>
              </div>
            </div>

          </div>

          {/* Contact Details Form */}
          <div className="bg-white dark:bg-chocolate-900 p-6 rounded-3xl shadow-lg border border-chocolate-100/50 dark:border-chocolate-800/80">
            <h2 className="text-xl font-bold text-chocolate-900 dark:text-chocolate-100 mb-6 font-cairo border-b border-chocolate-50 dark:border-chocolate-800 pb-3">{t('contactDetails')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4 font-cairo">
              <div>
                <label htmlFor="checkout-name" className="block text-sm font-bold text-chocolate-700 dark:text-chocolate-300 mb-2">{t('name')}</label>
                <input
                  id="checkout-name"
                  type="text"
                  required
                  autoComplete="name"
                  className="w-full px-4 py-2.5 rounded-xl border border-chocolate-200 dark:border-chocolate-700 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition-colors text-black dark:text-white bg-chocolate-50/20 dark:bg-chocolate-800/20 font-semibold text-base min-h-[44px]"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              
              <div>
                <label htmlFor="checkout-phone" className="block text-sm font-bold text-chocolate-700 dark:text-chocolate-300 mb-2">{t('phoneNumber')}</label>
                <input
                  id="checkout-phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  inputMode="tel"
                  className="w-full px-4 py-2.5 rounded-xl border border-chocolate-200 dark:border-chocolate-700 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition-colors text-black dark:text-white bg-chocolate-50/20 dark:bg-chocolate-800/20 font-semibold text-base min-h-[44px]"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="checkout-email" className="block text-sm font-bold text-chocolate-700 dark:text-chocolate-300 mb-2">{t('emailOptional')}</label>
                <input
                  id="checkout-email"
                  type="email"
                  autoComplete="email"
                  className="w-full px-4 py-2.5 rounded-xl border border-chocolate-200 dark:border-chocolate-700 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition-colors text-black dark:text-white bg-chocolate-50/20 dark:bg-chocolate-800/20 font-semibold text-base min-h-[44px]"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="checkout-address" className="block text-sm font-bold text-chocolate-700 dark:text-chocolate-300 mb-2">{t('address')} *</label>
                <textarea
                  id="checkout-address"
                  autoComplete="street-address"
                  required
                  rows={3}
                  placeholder={t('addressPlaceholder')}
                  className="w-full px-4 py-2.5 rounded-xl border border-chocolate-200 dark:border-chocolate-700 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition-colors text-black dark:text-white bg-chocolate-50/20 dark:bg-chocolate-800/20 font-semibold text-base resize-none"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-chocolate-700 dark:text-chocolate-300 mb-3">{t('selectDeliveryArea')} *</label>
                {checkoutSubtotal > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="relative flex items-center gap-3 cursor-pointer bg-white dark:bg-chocolate-850 border-2 border-chocolate-200 dark:border-chocolate-800 rounded-2xl p-4 hover:border-gold-500 transition-all">
                      <input
                        type="radio"
                        name="deliveryArea"
                        value="benisuef"
                        checked={formData.deliveryArea === 'benisuef'}
                        onChange={(e) => setFormData({ ...formData, deliveryArea: e.target.value })}
                        className="text-gold-600 focus:ring-gold-500"
                      />
                      <div className="flex-1">
                        <p className="font-bold text-chocolate-900 dark:text-white">{t('insideBeniSuef')}</p>
                        <p className="text-sm text-gold-600 font-extrabold">{deliveryFees.beniSuef} EGP</p>
                      </div>
                    </label>
                    <label className="relative flex items-center gap-3 cursor-pointer bg-white dark:bg-chocolate-850 border-2 border-chocolate-200 dark:border-chocolate-800 rounded-2xl p-4 hover:border-gold-500 transition-all">
                      <input
                        type="radio"
                        name="deliveryArea"
                        value="eastnile"
                        checked={formData.deliveryArea === 'eastnile'}
                        onChange={(e) => setFormData({ ...formData, deliveryArea: e.target.value })}
                        className="text-gold-600 focus:ring-gold-500"
                      />
                      <div className="flex-1">
                        <p className="font-bold text-chocolate-900 dark:text-white">{t('eastNile')}</p>
                        <p className="text-sm text-gold-600 font-extrabold">{deliveryFees.eastNile} EGP</p>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="bg-chocolate-50/50 dark:bg-chocolate-800/40 border border-chocolate-200/50 dark:border-chocolate-700 rounded-2xl p-4 text-center">
                    <p className="text-chocolate-500 dark:text-chocolate-400 text-sm font-semibold">
                      {t('deliveryOptionsAvailableAfterAdding')}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-chocolate-700 dark:text-chocolate-300 mb-2">{t('preferredContactMethod')}</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold">
                    <input
                      type="radio"
                      name="method"
                      value="whatsapp"
                      checked={formData.method === 'whatsapp'}
                      onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                      className="text-gold-600 focus:ring-gold-500"
                    />
                    <span className="text-chocolate-800 dark:text-chocolate-200">{t('whatsapp')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold">
                    <input
                      type="radio"
                      name="method"
                      value="call"
                      checked={formData.method === 'call'}
                      onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                      className="text-gold-600 focus:ring-gold-500"
                    />
                    <span className="text-chocolate-800 dark:text-chocolate-200">{t('phoneCall')}</span>
                  </label>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-sm font-bold text-chocolate-700 dark:text-chocolate-300 mb-3">{t('paymentMethod')} *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="relative flex items-center gap-3 cursor-pointer bg-white dark:bg-chocolate-850 border-2 border-chocolate-200 dark:border-chocolate-800 rounded-2xl p-4 hover:border-gold-500 transition-all">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash_on_delivery"
                      checked={formData.paymentMethod === 'cash_on_delivery'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="text-gold-600 focus:ring-gold-500"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-chocolate-900 dark:text-white">{t('cashOnDelivery')}</p>
                      <p className="text-xs text-chocolate-500 dark:text-chocolate-400 mt-1">{t('paymentOnDelivery')}</p>
                    </div>
                  </label>
                  <label className="relative flex items-center gap-3 cursor-pointer bg-white dark:bg-chocolate-850 border-2 border-chocolate-200 dark:border-chocolate-800 rounded-2xl p-4 hover:border-gold-500 transition-all">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online_payment"
                      checked={formData.paymentMethod === 'online_payment'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="text-gold-600 focus:ring-gold-500"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-chocolate-900 dark:text-white">{t('onlinePayment')}</p>
                      <p className="text-xs text-chocolate-500 dark:text-chocolate-400 mt-1">إنستا باي أو محفظة الكاش</p>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-chocolate-700 dark:text-chocolate-300 mb-2">{t('messageSpecialRequests')}</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-chocolate-200 dark:border-chocolate-700 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition-colors text-black dark:text-white bg-chocolate-50/20 dark:bg-chocolate-800/20 font-semibold text-base"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !catalogReady || catalogError || unavailableItems}
                className="w-full bg-gradient-to-r from-chocolate-700 to-chocolate-800 dark:from-gold-600 dark:to-gold-500 text-white py-4 rounded-full font-bold hover:shadow-lg transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
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
