import { prisma } from '@/app/lib/db';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const index = Number(searchParams.get('index') || 0);
  if (!Number.isInteger(index) || index < 0 || index > 20) {
    return new NextResponse('Not found', { status: 404 });
  }

  const product = await prisma.product.findUnique({
    where: { id },
    select: { image: true, images: true, updatedAt: true },
  });
  if (!product) return new NextResponse('Not found', { status: 404 });

  const image = index === 0 ? product.image : product.images[index - 1];
  if (!image) return new NextResponse('Not found', { status: 404 });
  const version = searchParams.get('v');
  const actualVersion = String(product.updatedAt.getTime());
  if (version && version !== actualVersion) return new NextResponse('Not found', { status: 404 });

  const dataUri = image.match(/^data:(image\/(?:jpeg|png|webp|gif|avif));base64,([A-Za-z0-9+/=\r\n]+)$/i);
  const rawBase64 = !dataUri && /^[A-Za-z0-9+/=\r\n]+$/.test(image) ? image : null;
  if (!dataUri && !rawBase64) {
    return new NextResponse('Not found', { status: 404 });
  }

  const bytes = Buffer.from(dataUri?.[2] || rawBase64 || '', 'base64');
  if (!bytes.length || bytes.length > 12 * 1024 * 1024) {
    return new NextResponse('Invalid image', { status: 415 });
  }
  return new NextResponse(bytes, {
    headers: {
      'Content-Type': dataUri?.[1].toLowerCase() || 'image/jpeg',
      'Cache-Control': version ? 'public, max-age=31536000, immutable' : 'public, max-age=300, s-maxage=300, stale-while-revalidate=1800',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
