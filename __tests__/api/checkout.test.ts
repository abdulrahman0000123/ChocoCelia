/** @jest-environment node */
import { POST } from '@/app/api/orders/route';
import { GET as checkCoupon } from '@/app/api/coupons/route';
import { prisma } from '@/app/lib/db';
import { getSession } from '@/app/lib/auth';
import { GET as exportOrders } from '@/app/api/orders/export/route';

jest.mock('@/app/lib/auth', () => ({ getSession: jest.fn() }));
jest.mock('@/app/lib/db', () => ({ prisma: {
  financeSettings: {findUnique: jest.fn()},
  product: { findMany: jest.fn() }, siteSettings: { findFirst: jest.fn() },
  coupon: { findUnique: jest.fn() }, $transaction: jest.fn(),
  order: { findMany: jest.fn() },
} }));

const tx = { $queryRaw: jest.fn(), coupon: { update: jest.fn() }, order: { create: jest.fn() } };
const coupon = { id: 'coupon', code: 'SAVE10', discountPct: 10, isActive: true, expiry: null, uses: 0, maxUses: 1 };
const body = { customerName: 'Checkout test', customerPhone: '01012345678', customerAddress: 'Test address',
  deliveryArea: 'beniSuef', requestedDeliveryDate: '2099-01-10', requestedDeliveryTime: '12:30',
  items: [{ productId: 'p1', quantity: 1, price: 1 }], couponCode: ' save10 ', total: 1, discountPct: 100 };
const request = (data = body) => new Request('http://localhost/api/orders', { method: 'POST', body: JSON.stringify(data) });

beforeEach(() => {
  jest.clearAllMocks();
  (prisma.product.findMany as jest.Mock).mockResolvedValue([{ id: 'p1', price: 185 }]);
  (prisma.siteSettings.findFirst as jest.Mock).mockResolvedValue({ deliveryFeeBeniSuef: 25, deliveryFeeEastNile: 45 });
  (prisma.$transaction as jest.Mock).mockImplementation((callback) => callback(tx));
  (prisma.coupon.findUnique as jest.Mock).mockResolvedValue(coupon);
  tx.$queryRaw.mockResolvedValue([coupon]);
  tx.order.create.mockImplementation(({ data }) => Promise.resolve({ id: 'order', ...data }));
});

test('ignores submitted prices and discounts, saves the snapshot and consumes the coupon inside the transaction', async () => {
  const res = await POST(request());
  expect(res.status).toBe(200);
  const order = await res.json();
  expect(order).toMatchObject({ subtotal: 185, deliveryFee: 25, discountAmount: 18.5, discountPct: 10,
    couponCode: 'SAVE10', total: 191.5, requestedDeliveryDate: '2099-01-10', requestedDeliveryTime: '12:30' });
  expect(tx.order.create.mock.calls[0][0].data.items.create[0].price).toBe(185);
  expect(order).not.toHaveProperty('finance');
  expect(order).not.toHaveProperty('requestHash');
  expect(tx.$queryRaw.mock.calls[0][0].join('?')).toContain('FOR UPDATE');
  expect(tx.coupon.update).toHaveBeenCalledWith({ where: { id: 'coupon' }, data: { uses: { increment: 1 } } });
});

test('rejects an exhausted coupon at submission even if the preview was valid', async () => {
  tx.$queryRaw.mockResolvedValue([{ ...coupon, uses: 1 }]);
  const res = await POST(request());
  expect(res.status).toBe(400);
  expect((await res.json()).code).toBe('exhaustedCoupon');
  expect(tx.order.create).not.toHaveBeenCalled();
  expect(tx.coupon.update).not.toHaveBeenCalled();
});

test('rejects missing or past schedules before any database transaction', async () => {
  const res = await POST(request({ ...body, requestedDeliveryDate: '2000-01-01' }));
  expect(res.status).toBe(400);
  expect((await res.json()).code).toBe('pastSchedule');
  expect(prisma.$transaction).not.toHaveBeenCalled();
});

test('creates a full-price order without a coupon and without consuming a coupon', async () => {
  const res = await POST(request({ ...body, couponCode: '' }));
  expect((await res.json()).total).toBe(210);
  expect(tx.coupon.update).not.toHaveBeenCalled();
  expect(tx.$queryRaw).not.toHaveBeenCalled();
});
test('rejects malformed or oversized bodies even without a Content-Length header', async () => {
  expect((await POST(new Request('http://localhost/api/orders',{method:'POST',body:'{bad'}))).status).toBe(400);
  expect((await POST(new Request('http://localhost/api/orders',{method:'POST',body:JSON.stringify({...body,customerName:'x'.repeat(70000)})}))).status).toBe(413);
  expect(prisma.$transaction).not.toHaveBeenCalled();
});

test('public coupon validation normalizes codes and only returns code and percentage', async () => {
  const res = await checkCoupon(new Request('http://localhost/api/coupons?code=%20save10%20'));
  expect(await res.json()).toEqual({ code: 'SAVE10', discountPct: 10 });
  expect(prisma.coupon.findUnique).toHaveBeenCalledWith({ where: { code: 'SAVE10' } });
});

test('exports the saved schedule and discount and preserves unknown historical values', async () => {
  (getSession as jest.Mock).mockResolvedValue({ user: { id: 'admin' } });
  const base = { id: 'order', createdAt: new Date('2026-10-10'), status: 'PENDING', customerName: 'Test',
    customerPhone: '01012345678', customerAddress: 'Test', total: 191.5, items: [], discountPct: 10, discountAmount: 18.5 };
  (prisma.order.findMany as jest.Mock).mockResolvedValue([
    { ...base, subtotal: 185, deliveryFee: 25, couponCode: 'SAVE10', requestedDeliveryDate: '2099-01-10', requestedDeliveryTime: '12:30' },
    { ...base, id: 'legacy', discountPct: 0, discountAmount: 0, subtotal: null, deliveryFee: null, couponCode: null },
  ]);
  const response = await exportOrders(new Request('http://localhost/api/orders/export'));
  const csv = await response.text();
  expect(csv).toContain('Requested Delivery Date (Cairo)');
  expect(csv).toContain('2099-01-10,12:30,185.00,25.00,"SAVE10",10,18.50');
  expect(csv).toContain('N/A,N/A,N/A,N/A,"",0,0.00');
});
