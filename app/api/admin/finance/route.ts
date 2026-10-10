import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/app/lib/db';
import { requireAdmin, apiError } from '@/app/lib/seo-admin';
import { financeDateFilter, historicalNetSales, ORDER_STATUSES, paymentState } from '@/app/lib/finance';

export async function GET(request: Request) {
  if (!await requireAdmin(request)) return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  try {
    const params = new URL(request.url).searchParams;
    const status = params.get('status');
    if (status && !(ORDER_STATUSES as readonly string[]).includes(status)) throw new Error('Invalid order status');
    const where = {...financeDateFilter(params.get('startDate'), params.get('endDate')), ...(status ? {status} : {})};
    // Aggregate on the server; the UI never computes totals from a paginated subset.
    const orders = await prisma.order.findMany({where, select: {id:true,customerName:true,customerPhone:true,createdAt:true,status:true,total:true,subtotal:true,deliveryFee:true,discountAmount:true,finance:{select:{version:true,netSales:true,productCost:true,advertisingPct:true,developmentPct:true,advertising:true,deliveryCost:true,profit:true,development:true,available:true,received:true,refunded:true}}}, orderBy: {createdAt: 'desc'}});
    const initial = () => ({count: 0, complete: 0, missing: 0, sales: new Prisma.Decimal(0), costs: new Prisma.Decimal(0), advertising: new Prisma.Decimal(0), profit: new Prisma.Decimal(0), development: new Prisma.Decimal(0), available: new Prisma.Decimal(0)});
    const expected = initial(), completed = initial();
    let received = new Prisma.Decimal(0), refunded = new Prisma.Decimal(0), outstanding = new Prisma.Decimal(0);
    for (const order of orders) {
      const f = order.finance;
      received = received.plus(f?.received ?? 0); refunded = refunded.plus(f?.refunded ?? 0);
      if (order.status === 'CANCELLED') continue;
      outstanding = outstanding.plus(new Prisma.Decimal(order.total).minus(f?.received ?? 0));
      const group = order.status === 'COMPLETED' ? completed : expected;
      group.count++;
      group.sales = group.sales.plus(f?.netSales ?? historicalNetSales(order));
      if (!f || f.profit === null) { group.missing++; continue; }
      group.complete++;
      group.costs = group.costs.plus(f.productCost!);
      group.advertising = group.advertising.plus(f.advertising);
      group.profit = group.profit.plus(f.profit);
      group.development = group.development.plus(f.development!);
      group.available = group.available.plus(f.available!);
    }
    const page = Math.max(1, Math.min(100000, Number.parseInt(params.get('page') || '1', 10) || 1));
    const serialize = (order: typeof orders[number]) => ({...order, paymentState: paymentState(order.total, order.finance?.received ?? 0, order.finance?.refunded ?? 0)});
    return NextResponse.json({expected, completed, cash: {received, refunded, net: received.minus(refunded), outstanding},
      count: orders.length, page, pages: Math.ceil(orders.length / 25), orders: orders.slice((page - 1) * 25, page * 25).map(serialize),
      recent: orders.filter(o => o.status !== 'CANCELLED').slice(0, 10).reverse().map(serialize),
      setup: {products: await prisma.product.count({where: {published: true}}), missingCosts: await prisma.product.count({where: {published: true, costing: null}})}});
  } catch (error) { return apiError(error); }
}
