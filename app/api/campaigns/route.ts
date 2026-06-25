import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/auth';
import { prisma } from '@/app/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    if (activeOnly) {
      const activeCampaign = await prisma.campaign.findFirst({
        where: { isActive: true },
      });
      return NextResponse.json(activeCampaign);
    }

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Campaigns GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
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
    const { 
      name, heroImage, heroTitleAr, heroTitleEn, 
      heroCtaAr, heroCtaEn, heroCtaLink, accentColor, 
      collectionLink, isActive, startsAt, endsAt 
    } = body;

    if (!name || !heroImage || !heroTitleAr || !heroTitleEn || !heroCtaAr || !heroCtaEn || !heroCtaLink) {
      return NextResponse.json(
        { error: 'Missing required campaign fields' },
        { status: 400 }
      );
    }

    // If making this active, deactivate all other campaigns
    if (isActive) {
      await prisma.campaign.updateMany({
        data: { isActive: false },
      });
    }

    const campaign = await prisma.campaign.create({
      data: {
        name,
        heroImage,
        heroTitleAr,
        heroTitleEn,
        heroCtaAr,
        heroCtaEn,
        heroCtaLink,
        accentColor: accentColor || null,
        collectionLink: collectionLink || null,
        isActive: Boolean(isActive),
        startsAt: startsAt ? new Date(startsAt) : null,
        endsAt: endsAt ? new Date(endsAt) : null,
      },
    });

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Campaign POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
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
    const { 
      id, name, heroImage, heroTitleAr, heroTitleEn, 
      heroCtaAr, heroCtaEn, heroCtaLink, accentColor, 
      collectionLink, isActive, startsAt, endsAt 
    } = body;

    if (!id || !name || !heroImage || !heroTitleAr || !heroTitleEn || !heroCtaAr || !heroCtaEn || !heroCtaLink) {
      return NextResponse.json(
        { error: 'Missing campaign ID or required fields' },
        { status: 400 }
      );
    }

    // If making this active, deactivate all other campaigns
    if (isActive) {
      await prisma.campaign.updateMany({
        where: { id: { not: id } },
        data: { isActive: false },
      });
    }

    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        name,
        heroImage,
        heroTitleAr,
        heroTitleEn,
        heroCtaAr,
        heroCtaEn,
        heroCtaLink,
        accentColor: accentColor || null,
        collectionLink: collectionLink || null,
        isActive: Boolean(isActive),
        startsAt: startsAt ? new Date(startsAt) : null,
        endsAt: endsAt ? new Date(endsAt) : null,
      },
    });

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Campaign PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign' },
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
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
    }

    await prisma.campaign.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Campaign DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    );
  }
}
