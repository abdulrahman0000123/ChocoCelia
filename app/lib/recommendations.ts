import { prisma } from './db';
import { toPublicProduct } from './productImages';
function attributeKeys(attributes: unknown): string[] {
  return Array.isArray(attributes) ? attributes.filter(a => a && typeof a.key === 'string').map(a => a.key) : [];
}
export async function getRelatedProducts(productId: string, categoryId: string, limit = 4) {
  try {
    const current = await prisma.product.findUnique({where: {id: productId}, select: {attributes: true}});
    const keys = attributeKeys(current?.attributes);
    const candidates = await prisma.product.findMany({where: {published: true, isAvailable: true, id: {not: productId}, OR: [{categoryId}, ...keys.map(key => ({attributes: {array_contains: [{key}]}}))]}, include: {category: true}, take: 30, orderBy: {createdAt: 'desc'}});
    const ranked = candidates.sort((a, b) => {
      const score = (p: typeof a) => attributeKeys(p.attributes).filter(key => keys.includes(key)).length * 2 + (p.categoryId === categoryId ? 1 : 0);
      return score(b) - score(a);
    }).slice(0, limit);
    if (ranked.length < limit) {
      const fill = await prisma.product.findMany({where: {published: true, isAvailable: true, id: {notIn: [productId, ...ranked.map(p => p.id)]}}, include: {category: true}, take: limit - ranked.length, orderBy: {createdAt: 'desc'}});
      ranked.push(...fill);
    }
    return ranked.map(toPublicProduct);
  } catch {return [];}
}
