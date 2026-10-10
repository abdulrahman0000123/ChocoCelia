'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useCart } from '../../context/CartContext';
import { ArrowLeft, ShoppingBag, Truck, CreditCard, Package, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { PaymentConfirmation } from '../../components/PaymentConfirmation';
import { OrderComplete } from '../../components/OrderComplete';
import { ThemeToggle } from '../../components/ThemeToggle';
import { cairoNow, validateRequestedDelivery, CheckoutError, calculateCheckout } from '@/app/lib/checkoutRules';
import type { CheckoutExtrasData } from '../../components/CheckoutExtras';
import { trackCheckoutStart, trackPurchase } from '@/app/lib/analytics';
import styles from './Checkout.module.css';

interface CheckoutPageProps {
  params: Promise<{ locale: string }>;
}

interface CheckoutProduct {
  id: string;
  name: string;
  nameAr?: string | null;
  price: number;
}

interface CheckoutOrder extends CheckoutExtrasData {
  customerName: string;
  customerPhone: string;
  orderId: string;
  subtotal: number;
  grandTotal: number;
  deliveryFee: number;
  paymentMethod: string;
}

interface ConfirmationOrder extends CheckoutExtrasData {
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
  const checkoutSubtotal = Math.round(items.reduce((sum, item) => {
    const currentProduct = catalog.find((product) => product.id === item.id);
    return sum + (currentProduct?.price ?? item.price) * item.quantity;
  }, 0) * 100) / 100;
  const t = useTranslations();
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPct: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const couponVersion = useRef(0);
  const submittedRequest = useRef<{payload: string; key: string} | null>(null);
  const [cairoClock, setCairoClock] = useState(() => cairoNow());

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
    requestedDeliveryDate: '',
    requestedDeliveryTime: '',
    paymentMethod: 'cash_on_delivery'
  });
  const deliveryFee = checkoutSubtotal > 0
    ? (formData.deliveryArea === 'benisuef' ? deliveryFees.beniSuef : deliveryFees.eastNile)
    : 0;
  const { discountAmount, total: grandTotal } = calculateCheckout(checkoutSubtotal, deliveryFee, appliedCoupon?.discountPct ?? 0);

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
    const timer = setInterval(() => setCairoClock(cairoNow()), 30000);
    return () => clearInterval(timer);
  }, []);

  const checkoutErrorMessage = (code?: string) => {
    const known = ['invalidCoupon', 'inactiveCoupon', 'expiredCoupon', 'exhaustedCoupon', 'invalidSchedule', 'pastSchedule'];
    return t(`checkoutFields.${code && known.includes(code) ? code : 'orderFailed'}`);
  };
  const resetCoupon = (value = '') => {
    couponVersion.current += 1;
    setCouponInput(value);
    setAppliedCoupon(null);
    setCouponError('');
    setCouponLoading(false);
    setSubmitError('');
  };
  const applyCoupon = async () => {
    const version = ++couponVersion.current;
    const code = couponInput.trim().toUpperCase();
    if (!code) { setCouponError(t('checkoutFields.invalidCoupon')); return; }
    setCouponLoading(true);
    setCouponError('');
    setSubmitError('');
    try {
      const res = await fetch(`/api/coupons?code=${encodeURIComponent(code)}`, { cache: 'no-store' });
      const result = await res.json();
      if (version !== couponVersion.current) return;
      if (!res.ok) {
        setAppliedCoupon(null);
        setCouponError(result.code ? checkoutErrorMessage(result.code) : t('checkoutFields.couponUnavailable'));
      } else {
        setAppliedCoupon(result);
        setCouponInput(result.code);
      }
    } catch {
      if (version === couponVersion.current) setCouponError(t('checkoutFields.couponUnavailable'));
    } finally {
      if (version === couponVersion.current) setCouponLoading(false);
    }
  };

  const checkoutTracked = useRef(false);
  useEffect(() => {if(catalogReady && items.length && !checkoutTracked.current) {checkoutTracked.current = true; trackCheckoutStart(items.map(item => ({...item, price: catalog.find(p => p.id === item.id)?.price ?? item.price})), checkoutSubtotal);}}, [catalogReady, items, catalog, checkoutSubtotal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catalogReady || catalogError || unavailableItems) {
      alert(locale === 'ar' ? 'أحد المنتجات في سلتك لم يعد متاحاً أو تعذر تحديث الأسعار. حدّث السلة ثم أعد المحاولة.' : 'A product is unavailable or prices could not be refreshed. Update your cart and try again.');
      return;
    }
    setSubmitError('');
    try {
      validateRequestedDelivery(formData.requestedDeliveryDate, formData.requestedDeliveryTime);
    } catch (error) {
      setSubmitError(checkoutErrorMessage(error instanceof CheckoutError ? error.code : undefined));
      return;
    }
    if (isSubmitting || couponLoading) return;
    setIsSubmitting(true);

    try {
      const deliveryAreaText = formData.deliveryArea === 'benisuef' 
        ? (locale === 'ar' ? 'داخل بني سويف' : 'Inside Beni Suef') 
        : (locale === 'ar' ? 'شرق النيل' : 'East Nile');

      const orderData = {
        requestedDeliveryDate: formData.requestedDeliveryDate,
        requestedDeliveryTime: formData.requestedDeliveryTime,
        couponCode: appliedCoupon?.code,
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

      const payload = JSON.stringify(orderData);
      const digest = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload)))).map(b => b.toString(16).padStart(2,'0')).join('');
      if (submittedRequest.current?.payload !== payload) {
        let previous: {digest: string; key: string} | null = null;
        try {previous = JSON.parse(sessionStorage.getItem('checkout-request') || 'null');} catch {}
        const key = previous?.digest === digest && /^[a-zA-Z0-9-]{16,80}$/.test(previous.key) ? previous.key : crypto.randomUUID();
        submittedRequest.current = {payload,key};
        try {sessionStorage.setItem('checkout-request',JSON.stringify({digest,key}));} catch {}
      }
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': submittedRequest.current.key },
        body: payload
      });

      if (res.ok) {
        const orderResult = await res.json();
        trackPurchase(orderResult);
        
        const orderDataForConfirmation = {
          customerName: formData.name,
          subtotal: orderResult.subtotal,
          grandTotal: orderResult.total,
          deliveryFee: orderResult.deliveryFee,
          requestedDeliveryDate: orderResult.requestedDeliveryDate,
          requestedDeliveryTime: orderResult.requestedDeliveryTime,
          couponCode: orderResult.couponCode,
          discountPct: orderResult.discountPct,
          discountAmount: orderResult.discountAmount
        };
        
        clearCart();
        
        if (formData.paymentMethod === 'cash_on_delivery') {
          setOrderComplete({
            ...orderDataForConfirmation,
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
        setSubmitError(error.code ? checkoutErrorMessage(error.code) : (error.error || t('checkoutFields.orderFailed')));
        if (error.code?.endsWith('Coupon')) setAppliedCoupon(null);
      }
    } catch (error) {
      console.error('Order submission error:', error);
      setSubmitError(t('checkoutFields.orderFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderComplete) {
    return <><div className="flex justify-end max-w-4xl mx-auto px-4 pt-4"><ThemeToggle locale={locale} /></div><OrderComplete orderData={orderComplete} /></>;
  }

  if (isSubmitted) {
    return (
      <>
      <div className="flex justify-end max-w-4xl mx-auto px-4 pt-4"><ThemeToggle locale={locale} /></div>
      <PaymentConfirmation 
        orderData={savedOrderData || {
          customerName: formData.name,
          subtotal: checkoutSubtotal,
          grandTotal: grandTotal,
          deliveryFee: deliveryFee
        }}
        paymentSettings={paymentSettings}
      />
      </>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`${styles.checkout} ${styles.empty}`}>
        <ThemeToggle locale={locale} className="absolute top-4 end-4" />
        <ShoppingBag size={48} strokeWidth={1.3} aria-hidden="true" />
        <p className={styles.eyebrow}>CHOCO CELIA</p>
        <h2 className="text-2xl font-bold text-chocolate-900 dark:text-chocolate-100 mb-4">{t('yourCartIsEmpty')}</h2>
        <Link 
          href="/menu"
          className="text-gold-600 dark:text-gold-300 hover:text-gold-700 dark:hover:text-gold-400 underline font-bold"
        >
          {t('browseMenu')}
        </Link>
      </div>
    );
  }

  return (
    <main className={styles.checkout}>
      <header className={styles.topbar}>
        <Link href="/menu" className={styles.back}>
          <ArrowLeft size={18} className={locale === 'ar' ? 'rotate-180' : ''} aria-hidden="true" />
          {t('backToMenu')}
        </Link>
        <Link href="/" className={styles.brand} aria-label="Choco Celia">Choco <span>Celia</span></Link>
        <ThemeToggle locale={locale} />
      </header>
      <div className={styles.intro}>
        <div>
          <p className={styles.eyebrow}>CHOCO CELIA · {locale === 'ar' ? 'صُنعت بحب' : 'MADE WITH LOVE'}</p>
          <h1>{locale === 'ar' ? 'لمسة أخيرة، وفرحتك في الطريق' : 'A final touch. A little joy on its way.'}</h1>
          <p>{locale === 'ar' ? 'أضف بياناتك، واختر موعد التوصيل وطريقة الدفع.' : 'Add your details, then choose your delivery time and payment method.'}</p>
        </div>
        <div className={styles.orderBadge}><ShoppingBag size={20} aria-hidden="true" /><span>{locale === 'ar' ? 'طلبك' : 'Your order'}</span><strong>{items.reduce((sum, item) => sum + item.quantity, 0)}</strong></div>
      </div>
      <div className={styles.workspace}>
        <form id="checkout-form" onSubmit={handleSubmit} className={styles.form}>
          <section className={styles.details} aria-labelledby="details-title">
            <div className={styles.contact}>
            <h2 id="details-title" className={styles.sectionHeading}><span>01</span>{t('contactDetails')}</h2>
            <div className={styles.contactGrid}>
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


            </div>
            </div>
            <div className={styles.delivery}>
            <h2 className={styles.sectionHeading}><Truck size={20} aria-hidden="true" />{locale === 'ar' ? 'تفاصيل التوصيل' : 'Delivery details'}</h2>
            <div className={styles.fields}>
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
                        <p className="text-sm text-chocolate-700 dark:text-gold-300 font-extrabold tabular-nums">{deliveryFees.beniSuef} EGP</p>
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
                        <p className="text-sm text-chocolate-700 dark:text-gold-300 font-extrabold tabular-nums">{deliveryFees.eastNile} EGP</p>
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

              <fieldset aria-describedby="schedule-note" className="min-w-0">
                <legend className="text-sm font-bold text-chocolate-700 dark:text-chocolate-300 mb-3">{t('checkoutFields.requestedSchedule')} *</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="min-w-0">
                    <label htmlFor="delivery-date" className="block text-sm font-semibold text-chocolate-700 dark:text-chocolate-200 mb-2">{t('checkoutFields.deliveryDate')}</label>
                    <input id="delivery-date" type="date" required min={cairoClock.date} value={formData.requestedDeliveryDate}
                      onChange={(e) => { setSubmitError(''); setFormData({ ...formData, requestedDeliveryDate: e.target.value }); }}
                      className="w-full min-w-0 min-h-[44px] px-3 py-2.5 rounded-xl border border-chocolate-200 dark:border-chocolate-700 bg-chocolate-50/20 dark:bg-chocolate-800 text-chocolate-900 dark:text-chocolate-100 focus:outline-none focus:ring-2 focus:ring-gold-500" />
                  </div>
                  <div className="min-w-0">
                    <label htmlFor="delivery-time" className="block text-sm font-semibold text-chocolate-700 dark:text-chocolate-200 mb-2">{t('checkoutFields.deliveryTime')}</label>
                    <input id="delivery-time" type="time" required step={60}
                      min={formData.requestedDeliveryDate === cairoClock.date ? cairoClock.time : undefined}
                      value={formData.requestedDeliveryTime} onChange={(e) => { setSubmitError(''); setFormData({ ...formData, requestedDeliveryTime: e.target.value }); }}
                      className="w-full min-w-0 min-h-[44px] px-3 py-2.5 rounded-xl border border-chocolate-200 dark:border-chocolate-700 bg-chocolate-50/20 dark:bg-chocolate-800 text-chocolate-900 dark:text-chocolate-100 focus:outline-none focus:ring-2 focus:ring-gold-500" />
                  </div>
                </div>
                <p id="schedule-note" className="mt-2 text-xs text-chocolate-600 dark:text-chocolate-300">{t('checkoutFields.scheduleNote')}</p>
              </fieldset>

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


            </div>
            </div>
          </section>
          <section className={styles.payment} aria-labelledby="payment-title">
            <h2 id="payment-title" className={styles.sectionHeading}><span>02</span>{t('paymentMethod')}</h2>
            <div className={styles.fields}>

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
                      <p className="text-xs text-chocolate-500 dark:text-chocolate-400 mt-1">{locale === 'ar' ? 'إنستا باي أو محفظة الكاش' : 'InstaPay or cash wallet'}</p>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="checkout-message" className="block text-sm font-bold text-chocolate-700 dark:text-chocolate-300 mb-2">{t('messageSpecialRequests')}</label>
                <textarea
                  id="checkout-message"
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-chocolate-200 dark:border-chocolate-700 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition-colors text-black dark:text-white bg-chocolate-50/20 dark:bg-chocolate-800/20 font-semibold text-base"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>


            </div>
            <div className={styles.paymentNote}><CreditCard size={20} aria-hidden="true" /><p>{locale === 'ar' ? 'راجع تفاصيل طلبك قبل التأكيد. ستظهر تعليمات التحويل بعد إتمام الطلب إذا اخترت الدفع الإلكتروني.' : 'Review your order before confirming. Transfer instructions will appear after placing an order with online payment.'}</p></div>
          </section>
          <div className={styles.actionbar}>
            <div className={styles.actionTotal}><span>{t('grandTotal')}</span><strong dir="ltr">{grandTotal.toFixed(2)} <small>EGP</small></strong></div>
            {submitError && <p role="alert" className={styles.submitError}>{submitError}</p>}
              <button
                type="submit"
                disabled={couponLoading || isSubmitting || !catalogReady || catalogError || unavailableItems}
                className={styles.submit}
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
                  <>{t('placeOrder')}<ArrowRight size={18} className={locale === 'ar' ? 'rotate-180' : ''} aria-hidden="true" /></>
                )}
              </button>

          </div>
        </form>
        <aside className={styles.summary} aria-labelledby="summary-title">
          <div className={styles.summaryHeading}><h2 id="summary-title">{t('orderSummary')}</h2><ShoppingBag size={20} aria-hidden="true" /></div>
            {!catalogReady && !catalogError && <p role="status" className="mb-4 text-sm text-chocolate-600 dark:text-chocolate-300">{locale === 'ar' ? 'جارٍ تحديث الأسعار…' : 'Refreshing prices…'}</p>}
            {catalogError && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800 dark:bg-red-950/40 dark:text-red-200">{locale === 'ar' ? 'تعذر تحديث الأسعار. تحقق من اتصالك ثم أعد تحميل الصفحة.' : 'Could not refresh prices. Check your connection and reload the page.'}</p>}
            {unavailableItems && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800 dark:bg-red-950/40 dark:text-red-200">{locale === 'ar' ? 'أحد المنتجات لم يعد متاحاً. أزله من السلة ثم أعد المحاولة.' : 'A product is no longer available. Remove it from your cart before continuing.'}</p>}
            <div className={styles.products}>
              {items.map((item) => (
                <div key={item.id} className={styles.product}>
                  <div className={styles.productIdentity}>
                    <span className={styles.productImage}><Package size={24} aria-hidden="true" /></span>
                    <span className="w-6 h-6 bg-chocolate-100 dark:bg-chocolate-800 rounded-full flex items-center justify-center text-xs font-bold text-chocolate-850 dark:text-chocolate-200">
                      {item.quantity}
                    </span>
                    <span className="text-chocolate-850 dark:text-chocolate-200">{(() => {
                      const product = catalog.find((entry) => entry.id === item.id);
                      return locale === 'ar' && product?.nameAr ? product.nameAr : product?.name || item.name;
                    })()}</span>
                  </div>
                  <span className="text-chocolate-700 dark:text-chocolate-300 shrink-0 tabular-nums" dir="ltr">
                    {((catalog.find((product) => product.id === item.id)?.price ?? item.price) * item.quantity).toFixed(2)} EGP
                  </span>
                </div>
              ))}
            </div>

            <div className="mb-5">
              <label htmlFor="checkout-coupon" className="block text-sm font-bold text-chocolate-700 dark:text-chocolate-200 mb-2">{t('checkoutFields.couponCode')}</label>
              <div className="flex gap-2">
                <input id="checkout-coupon" type="text" maxLength={80} autoComplete="off" dir="ltr"
                  disabled={isSubmitting} value={couponInput} onChange={(e) => resetCoupon(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void applyCoupon(); } }}
                  aria-describedby="coupon-feedback" aria-invalid={!!couponError}
                  className="w-full min-w-0 min-h-[44px] px-3 rounded-xl border border-chocolate-200 dark:border-chocolate-700 bg-chocolate-50/20 dark:bg-chocolate-800 text-chocolate-900 dark:text-chocolate-100 focus:outline-none focus:ring-2 focus:ring-gold-500" />
                <button type="button" disabled={couponLoading || isSubmitting || !catalogReady || catalogError || !!appliedCoupon}
                  onClick={() => void applyCoupon()} className="min-h-[44px] px-4 shrink-0 rounded-xl bg-chocolate-600 text-white font-bold disabled:opacity-50 cursor-pointer focus-visible:outline-2 focus-visible:outline-gold-500">
                  {t(couponLoading ? 'checkoutFields.applying' : 'checkoutFields.apply')}
                </button>
              </div>
              <div id="coupon-feedback" className="mt-2 text-sm" aria-live="polite">
                {couponError && <p role="alert" className="text-red-700 dark:text-red-300">{couponError}</p>}
                {appliedCoupon && <div className="flex flex-wrap items-center gap-2 text-green-800 dark:text-green-300">
                  <span>{t('checkoutFields.couponApplied')}: <b dir="ltr">{appliedCoupon.code}</b> ({appliedCoupon.discountPct}%)</span>
                  <button type="button" disabled={isSubmitting} onClick={() => resetCoupon()} className="underline min-h-[44px] px-2 cursor-pointer">{t('checkoutFields.remove')}</button>
                  <p className="w-full text-xs text-chocolate-600 dark:text-chocolate-300">{t('checkoutFields.discountNote')}</p>
                </div>}
              </div>
            </div>

            {/* Shipping Info Card */}
            <div className={styles.totals}>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-chocolate-700 dark:text-chocolate-300">{t('subtotal')}:</span>
                  <span className="text-chocolate-900 dark:text-white">{checkoutSubtotal.toFixed(2)} EGP</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-chocolate-700 dark:text-chocolate-300">{t('deliveryFee')}:</span>
                  <span className="text-chocolate-700 dark:text-gold-300 tabular-nums">{deliveryFee.toFixed(2)} EGP</span>
                </div>
                {appliedCoupon && <div className="flex justify-between gap-2 text-xs font-bold text-green-800 dark:text-green-300">
                  <span>{t('checkoutFields.discount')} ({appliedCoupon.discountPct}%):</span>
                  <span dir="ltr">-{discountAmount.toFixed(2)} EGP</span>
                </div>}
                <div className="border-t border-amber-200 dark:border-chocolate-700 pt-2 mt-2 flex justify-between items-center">
                  <span className="text-sm font-extrabold text-chocolate-900 dark:text-white">{t('grandTotal')}:</span>
                  <span className="text-lg font-extrabold text-chocolate-700 dark:text-gold-300 tabular-nums">{grandTotal.toFixed(2)} EGP</span>
                </div>
              </div>
            </div>


          <Link href="/menu" className={styles.editOrder}>{locale === 'ar' ? 'إضافة منتجات من القائمة' : 'Add products from the menu'}<ArrowRight size={16} className={locale === 'ar' ? 'rotate-180' : ''} aria-hidden="true" /></Link>
        </aside>
      </div>
    </main>
  );
}
