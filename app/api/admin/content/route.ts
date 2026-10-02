import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { requireAdmin, readBody, apiError, invalidateSeo } from '@/app/lib/seo-admin';
import { contentSections, contentPath, validSlug, validateSeo, localSeo } from '@/app/lib/seo-shared';
import { saveSeo } from '@/app/lib/seo';
export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  try {
    const [pages, products, categories] = await Promise.all([prisma.contentPage.findMany({orderBy: {updatedAt: 'desc'}}), prisma.product.findMany({select: {id: true, name: true, nameAr: true}}), prisma.category.findMany()]);
    return NextResponse.json({pages, products, categories});
  } catch (error) {return apiError(error);}
}
export async function POST(request: Request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  try {
    const body = await readBody(request);
    const id = typeof body.id === 'string' ? body.id : undefined;
    const existing = id ? await prisma.contentPage.findUnique({where: {id}}) : null;
    if (id && !existing) throw new Error('Unknown content');
    if (body.action === 'delete' && id) {
      await prisma.$transaction([prisma.contentPage.delete({where: {id}}), prisma.seoRecord.deleteMany({where: {entityType: 'content', entityId: id}})]);
      invalidateSeo(); return NextResponse.json({ok: true});
    }
    const input = body.restore === undefined ? body : (Array.isArray(existing?.history) ? existing.history[Number(body.restore)] : null) as Record<string, unknown>;
    if (!input) throw new Error('Invalid revision');
    const fields = ['kind', 'slug', 'titleAr', 'titleEn', 'summaryAr', 'summaryEn', 'bodyAr', 'bodyEn', 'image', 'imageAltAr', 'imageAltEn', 'status'] as const;
    const data = Object.fromEntries(fields.map(k => [k, typeof input[k] === 'string' ? input[k].trim() : ''])) as Record<typeof fields[number], string>;
    if (!contentSections[data.kind] || !validSlug(data.slug) || !data.titleAr || !data.titleEn || !['DRAFT', 'PUBLISHED'].includes(data.status)) throw new Error('Invalid content details');
    for (const key of fields) if (data[key].length > (key.startsWith('body') ? 60000 : 1000)) throw new Error(`Invalid ${key}`);
    if (data.image && !/^https:\/\//.test(data.image) && !/^\/(?!\/)/.test(data.image)) throw new Error('Invalid image URL');
    const duplicate = await prisma.contentPage.findUnique({where: {slug: data.slug}});
    if (duplicate && duplicate.id !== id) throw new Error('Slug is already used');
    const date = input.publishAt ? new Date(String(input.publishAt)) : null;
    if (date && Number.isNaN(date.getTime())) throw new Error('Invalid publication date');
    const productIds = Array.isArray(input.productIds) ? input.productIds.map(String).slice(0, 100) : [];
    const attributeKeys = Array.isArray(input.attributeKeys) ? input.attributeKeys.map(String).slice(0, 20) : [];
    const categoryId = typeof input.categoryId === 'string' && input.categoryId ? input.categoryId : null;
    if (productIds.length && await prisma.product.count({where: {id: {in: productIds}}}) !== new Set(productIds).size) throw new Error('Unknown linked product');
    if (categoryId && !await prisma.category.findUnique({where: {id: categoryId}})) throw new Error('Unknown category');
    const history = Array.isArray(existing?.history) ? existing.history : [];
    if (existing) history.push({...Object.fromEntries(fields.map(k => [k, existing[k]])), publishAt: existing.publishAt?.toISOString() || null, productIds: existing.productIds, categoryId: existing.categoryId, attributeKeys: existing.attributeKeys, at: new Date().toISOString()});
    const page = await prisma.$transaction(async tx => {
      const payload = {...data, publishAt: date, productIds, categoryId, attributeKeys, history: history.slice(-20)};
      const saved = id ? await tx.contentPage.update({where: {id}, data: payload}) : await tx.contentPage.create({data: payload});
      if (existing && contentPath(existing) !== contentPath(saved)) for (const locale of ['ar', 'en']) {
        await tx.urlRedirect.deleteMany({where: {fromPath: `/${locale}${contentPath(saved)}`}});
        await tx.urlRedirect.updateMany({where: {toPath: `/${locale}${contentPath(existing)}`}, data: {toPath: `/${locale}${contentPath(saved)}`}});
        await tx.urlRedirect.upsert({where: {fromPath: `/${locale}${contentPath(existing)}`}, create: {fromPath: `/${locale}${contentPath(existing)}`, toPath: `/${locale}${contentPath(saved)}`}, update: {toPath: `/${locale}${contentPath(saved)}`}});
      }
      return saved;
    });
    if (!existing || body.seo) {
      const values = body.seo && Object.keys(body.seo as object).length ? validateSeo(body.seo) : undefined;
      const generated = localSeo({titleAr: page.titleAr, titleEn: page.titleEn, bodyAr: page.summaryAr || page.bodyAr, bodyEn: page.summaryEn || page.bodyEn, image: page.image});
      await saveSeo('content', page.id, !values || values.source === 'local' ? {...values, ...generated} : values, session.user!.id);
    }
    invalidateSeo(); return NextResponse.json(page);
  } catch (error) {return apiError(error);}
}
