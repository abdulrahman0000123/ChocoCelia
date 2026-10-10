import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { createHash } from 'node:crypto';
import { prisma } from '@/app/lib/db';
import { requireAdmin, readBody, apiError } from '@/app/lib/seo-admin';
import { amount, calculateFinance, money, parseCosts, snapshotLine, type FinanceLine } from '@/app/lib/finance';
import { normalizePhoneNumber, validatePhone } from '@/app/lib/validation';

// Optional admin-only special orders. Storefront orders use the existing checkout.
export async function POST(request: Request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({error:'Unauthorized'}, {status:401});
  try {
    const body = await readBody(request);
    const key = request.headers.get('Idempotency-Key');
    if (!key || !/^[a-zA-Z0-9-]{16,80}$/.test(key)) throw new Error('Invalid request key');
    const requestKey = `admin-${key}`, requestHash = createHash('sha256').update(JSON.stringify(body)).digest('hex');
    const name = typeof body.customerName === 'string' ? body.customerName.trim() : '';
    const phone = typeof body.customerPhone === 'string' ? normalizePhoneNumber(body.customerPhone) : '';
    const address = typeof body.customerAddress === 'string' ? body.customerAddress.trim() : '';
    if (!name || name.length > 200 || !validatePhone(phone) || !address || address.length > 1000) throw new Error('Invalid customer details');
    if (!Array.isArray(body.lines) || !body.lines.length || body.lines.length > 50) throw new Error('Invalid order lines');
    const reason = typeof body.reason === 'string' ? body.reason.trim() : '';
    if (reason.length < 3 || reason.length > 500) throw new Error('Invalid order reason');
    const order = await prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${requestKey}, 0))`;
      const previous = await tx.order.findUnique({where: {requestKey}, include: {finance: true}});
      if (previous) {
        if (previous.requestHash !== requestHash) throw new Error('Conflict: request key already used');
        return previous;
      }
      const lines: FinanceLine[] = [];
      for (const input of body.lines as Record<string, unknown>[]) {
        if (!input || !Number.isInteger(input.quantity) || Number(input.quantity) < 1 || Number(input.quantity) > 99) throw new Error('Invalid quantity');
        if (typeof input.productId === 'string' && input.productId) {
          if (lines.some(l => l.productId === input.productId)) throw new Error('Invalid duplicate product');
          const product = await tx.product.findUnique({where: {id: input.productId}, include: {costing: true}});
          if (!product) throw new Error('Missing product');
          lines.push(snapshotLine(product, Number(input.quantity)));
        } else {
          const name = typeof input.name === 'string' ? input.name.trim() : '';
          if (!name || name.length > 200) throw new Error('Invalid custom product name');
          const costs = parseCosts(input.costs);
          lines.push({productId:null, name, nameAr:name, quantity:Number(input.quantity), price:amount(input.price,'price').toFixed(2),
            costs:costs ? Object.fromEntries(Object.entries(costs).map(([k,v]) => [k,v.toFixed(2)])) as FinanceLine['costs'] : null});
        }
      }
      const settings = await tx.financeSettings.findUnique({where:{id:1}}) ?? {advertisingPct:10,developmentPct:20};
      const subtotal = money(lines.reduce((sum,line) => sum.plus(new Prisma.Decimal(line.price).times(line.quantity)),new Prisma.Decimal(0)));
      const deliveryFee = amount(body.deliveryFee,'delivery fee');
      const deliveryCost = body.deliveryCost == null || body.deliveryCost === '' ? null : amount(body.deliveryCost,'delivery cost');
      const finance = calculateFinance(lines,0,deliveryFee,settings,deliveryCost);
      const saved = await tx.order.create({data:{customerName:name,customerPhone:phone,customerAddress:address,subtotal:Number(subtotal),total:Number(subtotal.plus(deliveryFee)),deliveryFee:Number(deliveryFee),requestKey,requestHash,
        items:{create:lines.filter(l => l.productId).map(l => ({productId:l.productId!,quantity:l.quantity,price:Number(l.price)}))},
        finance:{create:{...finance,lines:lines as unknown as Prisma.InputJsonValue}},
      },include:{finance:true}});
      await tx.financeEvent.create({data:{orderId:saved.id,actorId:session.user!.id,action:'SPECIAL_ORDER',reason,before:{},after:JSON.parse(JSON.stringify(saved))}});
      return saved;
    });
    return NextResponse.json(order);
  } catch(error) {
    if(error instanceof Error && error.message.startsWith('Conflict:')) return NextResponse.json({error:error.message},{status:409});
    return apiError(error);
  }
}
