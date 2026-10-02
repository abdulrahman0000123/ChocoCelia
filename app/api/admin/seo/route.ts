import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { requireAdmin, readBody, apiError, invalidateSeo } from '@/app/lib/seo-admin';
import { validateSeo, seoAudit, localSeo } from '@/app/lib/seo-shared';
import { saveSeo } from '@/app/lib/seo';
import { sealSecret } from '@/app/lib/secret-store';
import { randomBytes } from 'node:crypto';
import { contentPath, isPublished } from '@/app/lib/seo-shared';

export async function GET(request: Request) {
  if (!await requireAdmin()) return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  try {
    const query = new URL(request.url).searchParams;
    if (query.get('entityType') && query.get('entityId')) {
      const record = await prisma.seoRecord.findUnique({where: {entityType_entityId: {entityType: query.get('entityType')!, entityId: query.get('entityId')!}}});
      return NextResponse.json(record || {values: {}, history: []});
    }
    const [settings, ai, records, products, content, keywords] = await Promise.all([
      prisma.seoSettings.findUnique({where: {id: 1}}), prisma.aiSettings.findUnique({where: {id: 1}}),
      prisma.seoRecord.findMany({orderBy: {updatedAt: 'desc'}}),
      prisma.product.findMany({select: {id: true, name: true, nameAr: true, image: true, published: true}}),
      prisma.contentPage.findMany({select: {id: true, titleAr: true, titleEn: true, kind: true, slug: true, status: true}}),
      prisma.targetKeyword.findMany({orderBy: {updatedAt: 'desc'}}),
    ]);
    for (const product of products) if (!records.some(r => r.entityType === 'product' && r.entityId === product.id)) records.push({id: `missing:${product.id}`, entityType: 'product', entityId: product.id, values: {}, history: [], updatedAt: new Date(0)});
    const titles = new Map<string, number>();
    records.forEach(r => { const v = validateSeo(r.values); for (const t of [v.titleAr, v.titleEn]) if (t) titles.set(t, (titles.get(t) || 0) + 1); });
    return NextResponse.json({settings: settings?.values || {}, ai: {enabled: ai?.enabled || false, model: ai?.model || 'gpt-4o-mini', hasKey: !!ai?.encryptedKey, hasGoogle: !!ai?.encryptedGoogle}, records: records.map(r => {const values = validateSeo(r.values); const audit = seoAudit(values); return {...r, audit: {...audit, issues: [...audit.issues, ...[values.titleAr, values.titleEn].filter(t => t && (titles.get(t) || 0) > 1).map(() => 'Duplicate title')]}};}), products: products.map(p => ({id: p.id, name: p.name, nameAr: p.nameAr, published: p.published})), content, keywords});
  } catch (error) { return apiError(error); }
}
export async function POST(request: Request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  try {
    const body = await readBody(request);
    if (body.action === 'settings') {
      const values = validateSeo(body.values);
      await prisma.seoSettings.upsert({where: {id: 1}, create: {id: 1, values: {...values}}, update: {values: {...values}}});
    } else if (body.action === 'share') {
      const locale = body.locale === 'ar' ? 'ar' : 'en';
      let path = '';
      if (body.entityType === 'product') {
        const p = await prisma.product.findUnique({where: {id: String(body.entityId)}});
        if (!p?.published) throw new Error('Cannot share an unpublished product');
        path = `/menu/${p.slug || p.id}`;
      } else if (body.entityType === 'content') {
        const p = await prisma.contentPage.findUnique({where: {id: String(body.entityId)}});
        if (!p || !isPublished(p)) throw new Error('Cannot share unpublished content');
        path = contentPath(p);
      } else throw new Error('Invalid share target');
      const fromPath = `/s/${randomBytes(6).toString('base64url')}`;
      await prisma.urlRedirect.create({data: {fromPath, toPath: `/${locale}${path}`}});
      return NextResponse.json({path: fromPath});
    } else if (body.action === 'ai') {
      if (typeof body.enabled !== 'boolean' || typeof body.model !== 'string' || !/^[a-zA-Z0-9._-]{1,100}$/.test(body.model)) throw new Error('Invalid AI settings');
      const updates: {enabled: boolean; model: string; encryptedKey?: string | null} = {enabled: body.enabled, model: body.model};
      if (body.clearKey === true) {updates.encryptedKey = null; updates.enabled = false;}
      else if (body.apiKey) {
        if (typeof body.apiKey !== 'string' || !/^sk-[a-zA-Z0-9_-]{20,}$/.test(body.apiKey) || body.apiKey.length > 500) throw new Error('Invalid API key');
        updates.encryptedKey = sealSecret(body.apiKey);
      }
      await prisma.aiSettings.upsert({where: {id: 1}, create: {id: 1, ...updates}, update: updates});
    } else if (body.action === 'record') {
      const entityType = String(body.entityType), entityId = String(body.entityId);
      if (!['product', 'content', 'page'].includes(entityType) || entityId.length > 160) throw new Error('Invalid SEO target');
      if (entityType === 'product' && !await prisma.product.findUnique({where: {id: entityId}})) throw new Error('Unknown product');
      if (entityType === 'content' && !await prisma.contentPage.findUnique({where: {id: entityId}})) throw new Error('Unknown content');
      if (entityType === 'page' && !['home', 'menu', 'about', 'contact', 'journal', 'collections', 'occasions', 'campaigns', 'categories', 'pages'].includes(entityId)) throw new Error('Unknown page');
      await saveSeo(entityType, entityId, validateSeo(body.values), session.user!.id);
    } else if (body.action === 'keyword') {
      const {term, locale, entityType, entityId} = body;
      if (typeof term !== 'string' || !term.trim() || term.length > 200 || !['ar', 'en'].includes(String(locale)) || !['product', 'content', 'page'].includes(String(entityType)) || typeof entityId !== 'string' || entityId.length > 160) throw new Error('Invalid keyword');
      const metrics: {clicks?: number; impressions?: number; position?: number} = {};
      for (const key of ['clicks', 'impressions', 'position'] as const) if (body[key] !== undefined && body[key] !== '') {
        const value = Number(body[key]);
        if (!Number.isFinite(value) || value < 0 || (key !== 'position' && !Number.isInteger(value))) throw new Error('Invalid metric');
        metrics[key] = value;
      }
      const data = {term: term.trim(), locale: String(locale), entityType: String(entityType), entityId, intent: typeof body.intent === 'string' ? body.intent.slice(0, 200) : '', source: 'manual', ...metrics};
      await prisma.targetKeyword.upsert({where: {term_locale_entityType_entityId: {term: data.term, locale: data.locale, entityType: data.entityType, entityId}}, create: data, update: data});
    } else if (body.action === 'deleteKeyword' && typeof body.id === 'string') {
      await prisma.targetKeyword.delete({where: {id: body.id}});
    } else if (body.action === 'fillMissing') {
      const products = await prisma.product.findMany();
      for (const p of products) {
        const existing = await prisma.seoRecord.findUnique({where: {entityType_entityId: {entityType: 'product', entityId: p.id}}});
        if (!existing) await saveSeo('product', p.id, localSeo({titleAr: p.nameAr || p.name, titleEn: p.name, bodyAr: p.descriptionAr || p.description, bodyEn: p.description}), session.user!.id);
      }
    } else throw new Error('Invalid action');
    invalidateSeo();
    return NextResponse.json({ok: true});
  } catch (error) { return apiError(error); }
}
