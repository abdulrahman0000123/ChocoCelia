import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/app/lib/db';
import { ensureSettings, extraSettings, getSettings } from '@/app/lib/products';
import { validateUrl } from '@/app/lib/validation';
import { requireAdmin, invalidateSeo, apiError, readBody } from '@/app/lib/seo-admin';
export async function GET() {
  try {return NextResponse.json(await getSettings());} catch {return NextResponse.json({error: 'Could not load settings'}, {status: 500});}
}
export async function POST(request: Request) {
  if (!await requireAdmin(request)) return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  try {
    const body = await readBody(request);
    const data: Prisma.SiteSettingsUpdateInput = {};
    for (const field of ['phone', 'facebook', 'instagram', 'instaPayLink', 'cashWalletNumber'] as const) if (body[field] !== undefined) {
      const value = body[field];
      if (value !== null && (typeof value !== 'string' || value.length > 1000)) throw new Error(`Invalid ${field}`);
      if (['facebook', 'instagram', 'instaPayLink'].includes(field) && value && !validateUrl(String(value))) throw new Error(`Invalid ${field} URL`);
      data[field] = value ? String(value) : null;
    }
    for (const field of ['deliveryFeeBeniSuef', 'deliveryFeeEastNile'] as const) if (body[field] !== undefined) {
      const value = Number(body[field]); if (!Number.isFinite(value) || value < 0) throw new Error('Invalid delivery fee'); data[field] = value;
    }
    const settings = await ensureSettings();
    const extra: Record<string, string | string[]> = {...settings.extra as Record<string, string | string[]>};
    for (const field of Object.keys(extraSettings)) if (body[field] !== undefined) {
      const value = body[field];
      if (field === 'heroSlides') {
        if (!Array.isArray(value) || value.length > 20 || value.some(v => typeof v !== 'string' || v.length > 2000 || (!v.startsWith('/') && !validateUrl(v)))) throw new Error('Invalid hero slides');
        extra[field] = value;
      } else {
        if (typeof value !== 'string' || value.length > 20000) throw new Error(`Invalid ${field}`);
        extra[field] = value;
      }
    }
    await prisma.siteSettings.update({where: {id: settings.id}, data: {...data, extra}});
    invalidateSeo(); return NextResponse.json(await getSettings());
  } catch(error) {return apiError(error);}
}
