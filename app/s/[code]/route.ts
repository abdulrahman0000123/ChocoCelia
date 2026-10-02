import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { isPublished } from '@/app/lib/seo-shared';
import { getSiteUrl } from '@/app/lib/productImages';
export async function GET(_request: Request, {params}: {params: Promise<{code: string}>}) {
  const {code} = await params;
  if (!/^[A-Za-z0-9_-]{8}$/.test(code)) return new NextResponse('Not found', {status: 404});
  const row = await prisma.urlRedirect.findUnique({where: {fromPath: `/s/${code}`}});
  if (!row || !/^\/(ar|en)\/[a-z]+\/[\p{L}\p{N}_-]+$/u.test(row.toPath)) return new NextResponse('Not found', {status: 404});
  const [, , section, slug] = row.toPath.split('/');
  const publicTarget = section === 'menu' ? await prisma.product.findFirst({where: {OR: [{id: slug}, {slug}], published: true}}) : await prisma.contentPage.findUnique({where: {slug}});
  if (!publicTarget || ('status' in publicTarget && !isPublished(publicTarget))) return new NextResponse('Not found', {status: 404});
  return NextResponse.redirect(new URL(row.toPath, getSiteUrl()), {status: 307, headers: {'X-Robots-Tag': 'noindex', 'Cache-Control': 'no-store'}});
}
