import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/auth';
import { prisma } from '@/app/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    if (all) {
      const session = await getSession();
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const testimonials = await prisma.testimonial.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(testimonials);
    } else {
      const testimonials = await prisma.testimonial.findMany({
        where: { approved: true },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(testimonials);
    }
  } catch (error) {
    console.error('Testimonials GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch testimonials' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const body = await request.json();
    const { customerName, city, quoteAr, quoteEn, rating } = body;

    if (!customerName || !city || !quoteAr || !quoteEn) {
      return NextResponse.json(
        { error: 'Customer name, city, and both English/Arabic quotes are required' },
        { status: 400 }
      );
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        customerName,
        city,
        quoteAr,
        quoteEn,
        rating: rating !== undefined ? parseInt(rating) : 5,
        approved: session ? true : false, // Auto-approve if created by admin
      },
    });

    return NextResponse.json(testimonial);
  } catch (error) {
    console.error('Testimonial POST error:', error);
    return NextResponse.json(
      { error: 'Failed to submit testimonial' },
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
    const { id, customerName, city, quoteAr, quoteEn, rating, approved } = body;

    if (!id || !customerName || !city || !quoteAr || !quoteEn) {
      return NextResponse.json(
        { error: 'ID, customer name, city, and quotes are required' },
        { status: 400 }
      );
    }

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        customerName,
        city,
        quoteAr,
        quoteEn,
        rating: rating !== undefined ? parseInt(rating) : 5,
        approved: approved !== undefined ? Boolean(approved) : false,
      },
    });

    return NextResponse.json(testimonial);
  } catch (error) {
    console.error('Testimonial PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update testimonial' },
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
      return NextResponse.json({ error: 'Testimonial ID is required' }, { status: 400 });
    }

    await prisma.testimonial.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    console.error('Testimonial DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete testimonial' },
      { status: 500 }
    );
  }
}
