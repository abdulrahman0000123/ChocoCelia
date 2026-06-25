import { prisma } from './db';

export async function getRelatedProducts(productId: string, categoryId: string, limit: number = 4) {
  try {
    // 1. Try to fetch products from the same category, excluding current product
    let related = await prisma.product.findMany({
      where: {
        categoryId,
        id: { not: productId },
        isAvailable: true,
      },
      include: {
        category: true,
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    // 2. If we don't have enough related products, fetch other available products
    if (related.length < limit) {
      const needed = limit - related.length;
      const excludeIds = [productId, ...related.map((p) => p.id)];
      
      const fillProducts = await prisma.product.findMany({
        where: {
          id: { notIn: excludeIds },
          isAvailable: true,
        },
        include: {
          category: true,
        },
        take: needed,
        orderBy: { createdAt: 'desc' },
      });
      
      related = [...related, ...fillProducts];
    }

    return related;
  } catch (error) {
    console.error('Error fetching related products:', error);
    return [];
  }
}
