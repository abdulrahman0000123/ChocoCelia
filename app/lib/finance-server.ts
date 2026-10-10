import { Prisma } from '@prisma/client';
import { amount, calculateAfterRefund, historicalNetSales, money, parseCosts, ORDER_STATUSES, type FinanceLine } from './finance';

export async function reviseOrder(tx: Prisma.TransactionClient, orderId: string, actorId: string, input: Record<string, unknown>) {
  const order = await tx.order.findUnique({where: {id: orderId}, include: {finance: true, items: {include: {product: true}}}});
  if (!order) throw new Error('Missing order');
  if (!Number.isInteger(input.version) || input.version !== (order.finance?.version ?? 0)) throw new Error('Conflict: order changed, refresh first');
  const status = input.status === undefined ? order.status : String(input.status);
  if (!(ORDER_STATUSES as readonly string[]).includes(status)) throw new Error('Invalid order status');
  if (order.status === 'CANCELLED' && status !== 'CANCELLED') throw new Error('Invalid cancelled order transition');
  const reason = typeof input.reason === 'string' ? input.reason.trim() : '';
  if (reason.length < 3 || reason.length > 500) throw new Error('Invalid revision reason');
  // Historical orders get an explicitly unknown cost snapshot, never today's costs.
  const previous = order.finance;
  let lines = (previous?.lines ?? order.items.map(item => ({productId: item.productId, name: item.product.name, nameAr: item.product.nameAr || item.product.name,
    quantity: item.quantity, price: item.price.toFixed(2), costs: null}))) as FinanceLine[];
  if (input.lines !== undefined) {
    if (!Array.isArray(input.lines) || input.lines.length !== lines.length || order.status === 'CANCELLED') throw new Error('Invalid order lines');
    lines = input.lines.map((value, index) => {
      if (!value || typeof value !== 'object' || value.productId !== lines[index].productId || !Number.isInteger(value.quantity) || value.quantity < 1 || value.quantity > 99) throw new Error('Invalid order line');
      const costs = parseCosts(value.costs);
      const price = amount(value.price, 'unit price').toFixed(2);
      return {...lines[index], price, quantity: value.quantity, costs: costs ? Object.fromEntries(Object.entries(costs).map(([k,v]) => [k,v.toFixed(2)])) as FinanceLine['costs'] : null};
    });
  }
  const subtotal = money(lines.reduce((sum, line) => sum.plus(new Prisma.Decimal(line.price).times(line.quantity)), new Prisma.Decimal(0)));
  const discountAmount = money(subtotal.times(order.discountPct).div(100));
  const total = input.lines !== undefined ? Number(money(subtotal.minus(discountAmount).plus(order.deliveryFee ?? 0))) : order.total;
  if (previous && previous.received.gt(0) && total !== order.total) throw new Error('Invalid price revision after collection; record a refund instead');
  const received = input.received === undefined ? previous?.received ?? amount(0) : amount(input.received, 'received amount');
  const refunded = input.refunded === undefined ? previous?.refunded ?? amount(0) : amount(input.refunded, 'refund amount');
  if (received.gt(total) || refunded.gt(received)) throw new Error('Invalid collection or refund amount');
  if (order.status === 'CANCELLED' && received.gt(previous?.received ?? 0)) throw new Error('Invalid collection on cancelled order');
  const deliveryCost = input.deliveryCost === undefined ? previous?.deliveryCost ?? null : input.deliveryCost === null ? null : amount(input.deliveryCost, 'delivery cost');
  // Preserve historical revenue even when item details are unavailable; costs stay unknown.
  const calculationLines = lines.length ? lines : [{productId:null,name:'Legacy revenue',nameAr:'مبيعات تاريخية',quantity:1,price:historicalNetSales(order).toFixed(2),costs:null}];
  const calculated = calculateAfterRefund(calculationLines, lines.length ? input.lines !== undefined ? discountAmount : order.discountAmount : 0, order.deliveryFee ?? 0, previous ?? {advertisingPct: 10, developmentPct: 20}, deliveryCost, refunded);
  const completedAt = status === 'COMPLETED' ? previous?.completedAt ?? new Date() : null;
  const data = { ...calculated, lines: lines as unknown as Prisma.InputJsonValue, received, refunded, completedAt };
  if (previous) {
    const updated = await tx.orderFinance.updateMany({where: {orderId, version: previous.version}, data: {...data, version: {increment: 1}}});
    if (updated.count !== 1) throw new Error('Conflict: order changed, refresh first');
  } else {
    await tx.orderFinance.create({data: {orderId, ...data}});
  }
  await tx.financeEvent.create({data: {orderId, actorId, action: status !== order.status ? 'STATUS' : 'PAYMENT_OR_COST', reason,
    before: JSON.parse(JSON.stringify({status: order.status, total: order.total, subtotal: order.subtotal, finance: previous})),
    after: JSON.parse(JSON.stringify({status, total, ...data})) }});
  if (input.lines !== undefined) {
    for (const line of lines) if (line.productId) await tx.orderItem.updateMany({where: {orderId, productId: line.productId}, data: {quantity: line.quantity, price: Number(line.price)}});
  }
  return tx.order.update({where: {id: orderId}, data: {status, ...(input.lines !== undefined ? {subtotal: Number(subtotal), discountAmount: Number(discountAmount), total} : {})}, include: {finance: true, items: {include: {product: true}}}});
}
