import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/auth';
import { prisma } from '@/app/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    if (activeOnly) {
      const activeBanner = await prisma.banner.findFirst({
        where: { isActive: true },
      });
      return NextResponse.json(activeBanner);
    }

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const banners = await prisma.banner.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(banners);
  } catch (error) {
    console.error('Banners GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { textAr, textEn, ctaAr, ctaEn, link, isActive, startsAt, endsAt } = body;

    if (!textAr || !textEn) {
      return NextResponse.json(
        { error: 'Missing English or Arabic banner text' },
        { status: 400 }
      );
    }

    // If making this active, deactivate all other banners
    if (isActive) {
      await prisma.banner.updateMany({
        data: { isActive: false },
      });
    }

    const banner = await prisma.banner.create({
      data: {
        textAr,
        textEn,
        ctaAr: ctaAr || null,
        ctaEn: ctaEn || null,
        link: link || null,
        isActive: Boolean(isActive),
        startsAt: startsAt ? new Date(startsAt) : null,
        endsAt: endsAt ? new Date(endsAt) : null,
      },
    });

    return NextResponse.json(banner);
  } catch (error) {
    console.error('Banner POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create banner' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, textAr, textEn, ctaAr, ctaEn, link, isActive, startsAt, endsAt } = body;

    if (!id || !textAr || !textEn) {
      return NextResponse.json(
        { error: 'Missing banner ID or text fields' },
        { status: 400 }
      );
    }

    // If making this active, deactivate all other banners
    if (isActive) {
      await prisma.banner.updateMany({
        where: { id: { not: id } },
        data: { isActive: false },
      });
    }

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        textAr,
        textEn,
        ctaAr: ctaAr || null,
        ctaEn: ctaEn || null,
        link: link || null,
        isActive: Boolean(isActive),
        startsAt: startsAt ? new Date(startsAt) : null,
        endsAt: endsAt ? new Date(endsAt) : null,
      },
    });

    return NextResponse.json(banner);
  } catch (error) {
    console.error('Banner PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update banner' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 });
    }

    await prisma.banner.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    console.error('Banner DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete banner' },
      { status: 500 }
    );
  }
}
