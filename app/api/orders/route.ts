import { prisma } from '@/app/lib/db';
import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/auth';
import { normalizePhoneNumber, validateOrderInput } from '@/app/lib/validation';
import { toPublicProduct } from '@/app/lib/productImages';
import { CheckoutError, validateRequestedDelivery, normalizeCouponCode, validateCoupon, calculateCheckout } from '@/app/lib/checkoutRules';
import { Prisma, type Coupon } from '@prisma/client';
import { createHash } from 'node:crypto';
import { calculateFinance, snapshotLine, money } from '@/app/lib/finance';

interface OrderLineInput { productId: string; quantity: number; price?: number }
interface OrderRequest {
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  customerAddress: string;
  preferredContact?: 'whatsapp' | 'call';
  specialRequests?: string | null;
  paymentMethod?: 'cash_on_delivery' | 'online_payment';
  deliveryArea: 'beniSuef' | 'eastNile';
  items: OrderLineInput[];
  requestedDeliveryDate: string;
  requestedDeliveryTime: string;
  couponCode?: string;
}

// GET all orders (Admin only)
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const orders = await prisma.order.findMany({
      include: {
        finance: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(orders.map((order) => ({
      ...order,
      items: order.items.map((item) => ({ ...item, product: toPublicProduct(item.product) })),
    })));
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST create new order
export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > 64 * 1024) {
      return NextResponse.json({ error: 'Order details are too large.' }, { status: 413 });
    }
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > 64 * 1024) return NextResponse.json({error: 'Order details are too large.'}, {status: 413});
    let body: Record<string, unknown>;
    try {body = JSON.parse(raw);} catch {return NextResponse.json({error: 'Invalid order details.'}, {status: 400});}
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid order details.' }, { status: 400 });
    }
    const input = body as unknown as OrderRequest;
    const requestKey = request.headers.get('Idempotency-Key');
    if (requestKey && !/^[a-zA-Z0-9-]{16,80}$/.test(requestKey)) return NextResponse.json({error: 'Invalid request key'}, {status: 400});
    const requestHash = createHash('sha256').update(JSON.stringify(input)).digest('hex');
    const publicOrder = (saved: {id: string; customerName: string; subtotal: number | null; total: number; deliveryFee: number | null; requestedDeliveryDate: string | null; requestedDeliveryTime: string | null; couponCode: string | null; discountPct: number; discountAmount: number; items?: {productId: string; quantity: number; price: number; product?: {name: string}}[]}) => ({
      id: saved.id, customerName: saved.customerName, subtotal: saved.subtotal, total: saved.total, deliveryFee: saved.deliveryFee,
      requestedDeliveryDate: saved.requestedDeliveryDate, requestedDeliveryTime: saved.requestedDeliveryTime,
      couponCode: saved.couponCode, discountPct: saved.discountPct, discountAmount: saved.discountAmount,
      items: Array.isArray(saved.items) ? saved.items.map(item => ({productId: item.productId, quantity: item.quantity, price: item.price, product: {name: item.product?.name}})) : [],
    });
    if (requestKey) {
      const previous = await prisma.order.findUnique({where: {requestKey}, include: {items: {include: {product: {select: {name: true}}}}}});
      if (previous) return previous.requestHash === requestHash ? NextResponse.json(publicOrder(previous)) : NextResponse.json({error: 'Request key already used for another order.'}, {status: 409});
    }
    const {
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      preferredContact,
      specialRequests,
      paymentMethod,
      items,
      deliveryArea
    } = input;
    const normalizedCustomerPhone = typeof customerPhone === 'string'
      ? normalizePhoneNumber(customerPhone)
      : customerPhone;

    // Validate input
    try {
      validateOrderInput(body);
      validateRequestedDelivery(input.requestedDeliveryDate, input.requestedDeliveryTime);
      normalizeCouponCode(input.couponCode);
    } catch (error: unknown) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Invalid order details.', code: error instanceof CheckoutError ? error.code : undefined },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length > 50 ||
        !items.every((item) => item !== null && typeof item === 'object' && typeof item.productId === 'string' &&
          Number.isInteger(item.quantity) && item.quantity >= 1 && item.quantity <= 99) ||
        !['beniSuef', 'eastNile'].includes(deliveryArea) ||
        !['whatsapp', 'call'].includes(preferredContact || 'whatsapp') ||
        !['cash_on_delivery', 'online_payment'].includes(paymentMethod || 'cash_on_delivery')) {
      return NextResponse.json({ error: 'Invalid order details' }, { status: 400 });
    }

    const productIds = [...new Set(items.map((item) => item.productId))];
    const existingProducts = await prisma.product.findMany({
      where: { id: { in: productIds }, isAvailable: true, published: true },
      select: { id: true, price: true, name: true, nameAr: true, costing: true }
    });

    if (existingProducts.length !== productIds.length || items.length !== productIds.length) {
      return NextResponse.json(
        { error: 'One or more products not found. Please refresh the page and try again.' },
        { status: 400 }
      );
    }

    const priceById = new Map(existingProducts.map((product) => [product.id, Number(money(product.price))]));
    const subtotal = Math.round(items.reduce((sum, item) => sum + priceById.get(item.productId)! * item.quantity, 0) * 100) / 100;
    const settings = await prisma.siteSettings.findFirst({
      select: { deliveryFeeBeniSuef: true, deliveryFeeEastNile: true }
    });
    const deliveryFee = deliveryArea === 'beniSuef'
      ? settings?.deliveryFeeBeniSuef ?? 20
      : settings?.deliveryFeeEastNile ?? 40;
    const financeSettings = await prisma.financeSettings.findUnique({where: {id: 1}}) ?? {advertisingPct: 10, developmentPct: 20, deliveryCostBeniSuef: null, deliveryCostEastNile: null};
    const financeLines = items.map(item => snapshotLine(existingProducts.find(product => product.id === item.productId)!, item.quantity));
    const deliveryCost = deliveryArea === 'beniSuef' ? financeSettings.deliveryCostBeniSuef : financeSettings.deliveryCostEastNile;
    const couponCode = normalizeCouponCode(input.couponCode);

    // Create order with items
    const order = await prisma.$transaction(async (tx) => {
      if (requestKey) {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${requestKey}, 0))`;
        const previous = await tx.order.findUnique({where: {requestKey}, include: {items: {include: {product: {select: {name: true}}}}}});
        if (previous) {
          if (previous.requestHash !== requestHash) throw new CheckoutError('requestConflict');
          return previous;
        }
      }
      validateRequestedDelivery(input.requestedDeliveryDate, input.requestedDeliveryTime);
      let discountPct = 0;
      if (couponCode) {
        // Serialize competing requests so the usage limit cannot be exceeded.
        const coupons = await tx.$queryRaw<Coupon[]>`SELECT * FROM "Coupon" WHERE "code" = ${couponCode} FOR UPDATE`;
        const coupon = coupons[0] ?? null;
        validateCoupon(coupon);
        discountPct = coupon!.discountPct;
        await tx.coupon.update({ where: { id: coupon!.id }, data: { uses: { increment: 1 } } });
      }
      const { discountAmount, total } = calculateCheckout(subtotal, deliveryFee, discountPct);
      return tx.order.create({
        data: {
          requestKey, requestHash: requestKey ? requestHash : null,
          finance: {create: {...calculateFinance(financeLines, discountAmount, deliveryFee, financeSettings, deliveryCost), lines: financeLines as unknown as Prisma.InputJsonValue}},
          customerName,
          customerPhone: normalizedCustomerPhone,
          customerEmail,
          customerAddress,
          preferredContact: preferredContact || 'whatsapp',
          specialRequests,
          paymentMethod: paymentMethod || 'cash_on_delivery',
          subtotal, deliveryFee, total,
          requestedDeliveryDate: input.requestedDeliveryDate,
          requestedDeliveryTime: input.requestedDeliveryTime,
          couponCode: couponCode || null, discountPct, discountAmount,
          status: 'PENDING',
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: priceById.get(item.productId)!
            }))
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });
    });

    return NextResponse.json(publicOrder(order));
  } catch (error: unknown) {
    if (error instanceof CheckoutError) return NextResponse.json({ error: error.message, code: error.code }, { status: error.code === 'requestConflict' ? 409 : 400 });
    console.error('Failed to create order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
