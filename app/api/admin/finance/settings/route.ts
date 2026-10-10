import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { requireAdmin, readBody, apiError } from '@/app/lib/seo-admin';
import { amount } from '@/app/lib/finance';

export async function GET(request: Request) {
  if (!await requireAdmin(request)) return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  try {return NextResponse.json(await prisma.financeSettings.findUnique({where: {id: 1}}) ?? {advertisingPct: '10', developmentPct: '20', deliveryCostBeniSuef: null, deliveryCostEastNile: null});}
  catch (error) {return apiError(error);}
}
export async function PUT(request: Request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  try {
    const body = await readBody(request);
    const advertisingPct = amount(body.advertisingPct, 'advertising percentage');
    const developmentPct = amount(body.developmentPct, 'development percentage');
    if (advertisingPct.gt(50) || developmentPct.gt(50)) throw new Error('Invalid percentage: maximum 50');
    const deliveryCostBeniSuef = body.deliveryCostBeniSuef == null || body.deliveryCostBeniSuef === '' ? null : amount(body.deliveryCostBeniSuef, 'delivery cost');
    const deliveryCostEastNile = body.deliveryCostEastNile == null || body.deliveryCostEastNile === '' ? null : amount(body.deliveryCostEastNile, 'delivery cost');
    const data = {advertisingPct, developmentPct, deliveryCostBeniSuef, deliveryCostEastNile};
    return NextResponse.json(await prisma.financeSettings.upsert({where: {id: 1}, create: {id: 1, ...data}, update: data}));
  } catch (error) { return apiError(error); }
}
