import { prisma } from '@/app/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim() === '') {
      return NextResponse.json([]);
    }

    const cleanQuery = query.trim();

    // Fetch products that match the query in English or Arabic name/description
    const products = await prisma.product.findMany({
      where: {
        isAvailable: true,
        OR: [
          { name: { contains: cleanQuery, mode: 'insensitive' } },
          { nameAr: { contains: cleanQuery, mode: 'insensitive' } },
          { description: { contains: cleanQuery, mode: 'insensitive' } },
          { descriptionAr: { contains: cleanQuery, mode: 'insensitive' } },
          { tags: { contains: cleanQuery, mode: 'insensitive' } },
        ],
      },
      include: {
        category: true,
      },
      take: 20,
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Failed to search products' }, { status: 500 });
  }
}
