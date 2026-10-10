import { cairoNow, validateRequestedDelivery, normalizeCouponCode, validateCoupon, calculateCheckout } from '@/app/lib/checkoutRules';

const now = new Date('2026-10-10T12:00:00Z');
const coupon = { isActive: true, expiry: null, maxUses: null, uses: 0, discountPct: 10 };

test('Cairo time follows seasonal offsets rather than the browser timezone', () => {
  expect(cairoNow(now)).toEqual({ date: '2026-10-10', time: '15:00' });
  expect(cairoNow(new Date('2026-01-10T23:30:00Z'))).toEqual({ date: '2026-01-11', time: '01:30' });
});

test.each([
  ['2026-10-10', '14:59', 'pastSchedule'],
  ['2026-10-10', '15:00', 'pastSchedule'],
  ['2026-02-30', '12:00', 'invalidSchedule'],
  ['2026-10-11', '24:00', 'invalidSchedule'],
  ['', '', 'invalidSchedule'],
])('rejects invalid or elapsed schedules: %s %s', (date, time, error) => {
  expect(() => validateRequestedDelivery(date, time, now)).toThrow(error);
});

test('accepts a future date and a future time today', () => {
  expect(() => validateRequestedDelivery('2026-10-10', '15:01', now)).not.toThrow();
  expect(() => validateRequestedDelivery('2026-10-11', '00:00', now)).not.toThrow();
});

test('normalizes optional coupon input and rejects malformed input', () => {
  expect(normalizeCouponCode('  save10 ')).toBe('SAVE10');
  expect(normalizeCouponCode(null)).toBe('');
  expect(() => normalizeCouponCode({ code: 'SAVE10' })).toThrow('invalidCoupon');
  expect(() => normalizeCouponCode('x'.repeat(81))).toThrow('invalidCoupon');
});

test.each([
  [null, 'invalidCoupon'],
  [{ ...coupon, isActive: false }, 'inactiveCoupon'],
  [{ ...coupon, expiry: now }, 'expiredCoupon'],
  [{ ...coupon, maxUses: 1, uses: 1 }, 'exhaustedCoupon'],
  [{ ...coupon, maxUses: 0 }, 'exhaustedCoupon'],
  [{ ...coupon, discountPct: 101 }, 'invalidCoupon'],
  [{ ...coupon, discountPct: NaN }, 'invalidCoupon'],
])('rejects unavailable coupons', (value, error) => {
  expect(() => validateCoupon(value, now)).toThrow(error);
});

test('discounts products only, rounds currency and preserves delivery on a 100% coupon', () => {
  expect(calculateCheckout(185, 25, 10)).toEqual({ discountAmount: 18.5, total: 191.5 });
  expect(calculateCheckout(19.99, 25, 15)).toEqual({ discountAmount: 3, total: 41.99 });
  expect(calculateCheckout(185, 25, 100)).toEqual({ discountAmount: 185, total: 25 });
  expect(calculateCheckout(185, 25)).toEqual({ discountAmount: 0, total: 210 });
});
