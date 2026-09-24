import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { toPublicProduct } from '@/app/lib/productImages';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isAvailable: true },
      select: {
        id: true,
        name: true,
        nameAr: true,
        price: true,
        image: true,
        images: true,
        updatedAt: true,
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(products.map(toPublicProduct), {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to load product catalog.' }, { status: 500 });
  }
}
