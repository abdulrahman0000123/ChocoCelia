import type { Prisma } from '@prisma/client';
import { prisma } from './db';
import { validSlug, validateSeo } from './seo-shared';
export interface ProductAttribute {key: string; type: string; valueAr: string; valueEn: string; aliases: string}
export function productSeoInput(body: Record<string, unknown>) {
  const result: {slug?: string | null; published?: boolean; imageAltAr?: string; imageAltEn?: string; attributes?: Prisma.InputJsonValue; attributeSearch?: string} = {};
  if (body.slug !== undefined) {
    if (body.slug !== null && (typeof body.slug !== 'string' || (body.slug && !validSlug(body.slug)))) throw new Error('Invalid product slug');
    result.slug = body.slug || null;
  }
  if (body.published !== undefined) {
    if (typeof body.published !== 'boolean') throw new Error('Invalid publication state');
    result.published = body.published;
  }
  for (const field of ['imageAltAr', 'imageAltEn'] as const) if (body[field] !== undefined) {
    if (typeof body[field] !== 'string' || body[field].length > 300) throw new Error('Invalid image description');
    result[field] = body[field];
  }
  if (body.attributes !== undefined) {
    if (!Array.isArray(body.attributes) || body.attributes.length > 30) throw new Error('Invalid product attributes');
    result.attributes = body.attributes.map(a => {
      if (!a || typeof a !== 'object' || !['type', 'flavour', 'filling', 'weight', 'packaging', 'occasion', 'dietary'].includes(a.type) || !validSlug(a.key)) throw new Error('Invalid product attribute');
      for (const field of ['valueAr', 'valueEn', 'aliases']) if (typeof a[field] !== 'string' || a[field].length > 300) throw new Error('Invalid attribute value');
      return {key: a.key, type: a.type, valueAr: a.valueAr, valueEn: a.valueEn, aliases: a.aliases};
    });
    result.attributeSearch = body.attributes.flatMap(a => [a.valueAr, a.valueEn, a.aliases]).join(' ');
  }
  const seo = body.seo === undefined ? undefined : validateSeo(body.seo);
  return {fields: result, seo};
}
export async function validateProductSlug(slug: string | null | undefined, id?: string) {
  if (!slug) return;
  const duplicate = await prisma.product.findFirst({where: {OR: [{slug}, {id: slug}]}});
  if (duplicate && duplicate.id !== id) throw new Error('Slug is already used');
}
