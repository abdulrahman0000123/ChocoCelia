import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/auth';
import { prisma } from '@/app/lib/db';

export async function GET() {
  try {
    const faqs = await prisma.fAQ.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(faqs);
  } catch (error) {
    console.error('FAQ GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch FAQs' },
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
    const { questionAr, questionEn, answerAr, answerEn, order } = body;

    if (!questionAr || !questionEn || !answerAr || !answerEn) {
      return NextResponse.json(
        { error: 'All question and answer fields are required' },
        { status: 400 }
      );
    }

    const faq = await prisma.fAQ.create({
      data: {
        questionAr,
        questionEn,
        answerAr,
        answerEn,
        order: order !== undefined ? parseInt(order) : 0,
      },
    });

    return NextResponse.json(faq);
  } catch (error) {
    console.error('FAQ POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create FAQ' },
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
    const { id, questionAr, questionEn, answerAr, answerEn, order } = body;

    if (!id || !questionAr || !questionEn || !answerAr || !answerEn) {
      return NextResponse.json(
        { error: 'ID and all question/answer fields are required' },
        { status: 400 }
      );
    }

    const faq = await prisma.fAQ.update({
      where: { id },
      data: {
        questionAr,
        questionEn,
        answerAr,
        answerEn,
        order: order !== undefined ? parseInt(order) : 0,
      },
    });

    return NextResponse.json(faq);
  } catch (error) {
    console.error('FAQ PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update FAQ' },
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
      return NextResponse.json({ error: 'FAQ ID is required' }, { status: 400 });
    }

    await prisma.fAQ.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    console.error('FAQ DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete FAQ' },
      { status: 500 }
    );
  }
}
