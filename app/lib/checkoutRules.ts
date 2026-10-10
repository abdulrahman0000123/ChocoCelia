export class CheckoutError extends Error {
  constructor(public code: string) {
    super(code);
  }
}

// Keep the requested wall-clock date/time in Cairo, independent of the customer's timezone.
export function cairoNow(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Cairo', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)!.value;
  return { date: `${get('year')}-${get('month')}-${get('day')}`, time: `${get('hour')}:${get('minute')}` };
}

export function validateRequestedDelivery(date: unknown, time: unknown, now = new Date()) {
  if (typeof date !== 'string' || typeof time !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    throw new CheckoutError('invalidSchedule');
  }
  const parsed = new Date(`${date}T00:00:00Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new CheckoutError('invalidSchedule');
  }
  const current = cairoNow(now);
  if (`${date}T${time}` <= `${current.date}T${current.time}`) throw new CheckoutError('pastSchedule');
}

export function normalizeCouponCode(value: unknown): string {
  if (value === undefined || value === null || value === '') return '';
  if (typeof value !== 'string' || value.trim().length > 80) throw new CheckoutError('invalidCoupon');
  return value.trim().toUpperCase();
}

type CouponRules = { isActive: boolean; expiry: Date | string | null; maxUses: number | null; uses: number; discountPct: number };
export function validateCoupon(coupon: CouponRules | null, now = new Date()) {
  if (!coupon) throw new CheckoutError('invalidCoupon');
  if (!coupon.isActive) throw new CheckoutError('inactiveCoupon');
  if (coupon.expiry && new Date(coupon.expiry) <= now) throw new CheckoutError('expiredCoupon');
  if (coupon.maxUses !== null && coupon.uses >= coupon.maxUses) throw new CheckoutError('exhaustedCoupon');
  if (!Number.isFinite(coupon.discountPct) || coupon.discountPct <= 0 || coupon.discountPct > 100) {
    throw new CheckoutError('invalidCoupon');
  }
}

export function calculateCheckout(subtotal: number, deliveryFee: number, discountPct = 0) {
  const discountAmount = Math.round(subtotal * discountPct) / 100;
  const total = Math.round((subtotal - discountAmount + deliveryFee) * 100) / 100;
  return { discountAmount, total };
}
