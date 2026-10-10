import { Prisma } from '@prisma/client';

const D = Prisma.Decimal;
export const money = (value: Prisma.Decimal.Value) => new D(value).toDecimalPlaces(2, D.ROUND_HALF_UP);
export const COST_KEYS = ['chocolate', 'packaging', 'nuts', 'decoration'] as const;
export type Costs = Record<typeof COST_KEYS[number], Prisma.Decimal.Value>;
export type FinanceLine = { productId: string | null; name: string; nameAr: string; quantity: number; price: string; costs: Record<typeof COST_KEYS[number], string> | null };
export function amount(value: unknown, label = 'amount') {
  if ((typeof value !== 'number' && typeof value !== 'string') || String(value).trim() === '') throw new Error(`Invalid ${label}`);
  let n: Prisma.Decimal;
  try { n = new D(value); } catch { throw new Error(`Invalid ${label}`); }
  if (!n.isFinite() || n.isNegative() || n.gt(999999999.99) || n.decimalPlaces() > 2) throw new Error(`Invalid ${label}`);
  return n;
}
export function parseCosts(value: unknown) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid product costs');
  const input = value as Record<string, unknown>;
  return Object.fromEntries(COST_KEYS.map(key => [key, amount(input[key], key)])) as Record<typeof COST_KEYS[number], Prisma.Decimal>;
}
export function costTotal(costs: Costs) { return COST_KEYS.reduce((sum, key) => sum.plus(costs[key]), new D(0)); }
export function snapshotLine(product: {id: string; name: string; nameAr?: string | null; price: number; costing?: Costs | null}, quantity: number): FinanceLine {
  return { productId: product.id, name: product.name, nameAr: product.nameAr || product.name, quantity, price: money(product.price).toFixed(2),
    costs: product.costing ? Object.fromEntries(COST_KEYS.map(key => [key, money(product.costing![key]).toFixed(2)])) as FinanceLine['costs'] : null };
}
export function calculateFinance(lines: FinanceLine[], discount: Prisma.Decimal.Value, deliveryFee: Prisma.Decimal.Value, settings: {advertisingPct: Prisma.Decimal.Value; developmentPct: Prisma.Decimal.Value}, deliveryCost: Prisma.Decimal.Value | null) {
  const gross = money(lines.reduce((sum, line) => sum.plus(new D(line.price).times(line.quantity)), new D(0)));
  const netSales = money(gross.minus(discount));
  if (netSales.isNegative()) throw new Error('Invalid discount');
  const advertisingPct = amount(settings.advertisingPct.toString(), 'advertising percentage');
  const developmentPct = amount(settings.developmentPct.toString(), 'development percentage');
  if (advertisingPct.gt(50) || developmentPct.gt(50)) throw new Error('Invalid finance percentage');
  const advertising = money(netSales.times(advertisingPct).div(100));
  const productCost = lines.length > 0 && lines.every(line => line.costs !== null)
    ? money(lines.reduce((sum, line) => sum.plus(costTotal(line.costs!).times(line.quantity)), new D(0))) : null;
  const shippingCost = deliveryCost === null ? null : money(deliveryCost);
  const profit = productCost !== null && shippingCost !== null ? money(netSales.minus(productCost).minus(advertising).plus(deliveryFee).minus(shippingCost)) : null;
  const development = profit === null ? null : money(D.max(profit, 0).times(developmentPct).div(100));
  return { netSales, productCost, advertisingPct, developmentPct, advertising, deliveryCost: shippingCost, profit, development,
    available: profit === null ? null : money(profit.minus(development!)) };
}
export function paymentState(total: Prisma.Decimal.Value, received: Prisma.Decimal.Value, refunded: Prisma.Decimal.Value) {
  const paid = money(received).minus(refunded);
  if (new D(refunded).gt(0) && paid.eq(0)) return 'REFUNDED';
  if (new D(refunded).gt(0)) return 'PARTIALLY_REFUNDED';
  if (paid.eq(0)) return 'UNPAID';
  return paid.gte(total) ? 'PAID' : 'PARTIAL';
}
export function historicalNetSales(order: {subtotal: number|null; total: number; discountAmount: number; deliveryFee?: number|null}) {
  return order.subtotal !== null ? money(new D(order.subtotal).minus(order.discountAmount)) : money(new D(order.total).minus(order.deliveryFee ?? 0));
}
export function calculateAfterRefund(lines: FinanceLine[], discount: Prisma.Decimal.Value, deliveryFee: Prisma.Decimal.Value, settings: {advertisingPct: Prisma.Decimal.Value; developmentPct: Prisma.Decimal.Value}, deliveryCost: Prisma.Decimal.Value | null, refunded: Prisma.Decimal.Value) {
  const gross = money(lines.reduce((sum,line) => sum.plus(new D(line.price).times(line.quantity)),new D(0)));
  const productSales = money(gross.minus(discount));
  const total = productSales.plus(deliveryFee);
  // Allocate refunds proportionally between products and delivery; costs already incurred remain.
  const productRefund = total.eq(0) ? money(0) : money(new D(refunded).times(productSales).div(total));
  const deliveryRefund = money(new D(refunded).minus(productRefund));
  return calculateFinance(lines, new D(discount).plus(productRefund), new D(deliveryFee).minus(deliveryRefund), settings, deliveryCost);
}
export const ORDER_STATUSES = ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'] as const;
export function financeDateFilter(start: string | null, end: string | null) {
  // Convert Cairo calendar boundaries using Intl, including seasonal UTC offsets.
  function boundary(date: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Invalid date range');
    const nominal = new Date(`${date}T00:00:00Z`);
    if (!Number.isFinite(nominal.getTime()) || nominal.toISOString().slice(0, 10) !== date) throw new Error('Invalid date range');
    const parts = new Intl.DateTimeFormat('en-GB', {timeZone: 'Africa/Cairo', timeZoneName: 'longOffset'}).formatToParts(nominal);
    const offset = parts.find(p => p.type === 'timeZoneName')!.value.match(/GMT([+-])(\d{2}):(\d{2})/);
    const minutes = offset ? (Number(offset[2]) * 60 + Number(offset[3])) * (offset[1] === '-' ? -1 : 1) : 0;
    return new Date(nominal.getTime() - minutes * 60000);
  }
  if (start && end && start > end) throw new Error('Invalid date range');
  const range: {gte?: Date; lt?: Date} = {};
  if (start) range.gte = boundary(start);
  if (end) {
    boundary(end);
    const next = new Date(`${end}T00:00:00Z`); next.setUTCDate(next.getUTCDate() + 1);
    range.lt = boundary(next.toISOString().slice(0, 10));
  }
  return Object.keys(range).length ? {createdAt: range} : {};
}
