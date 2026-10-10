import { prisma } from '@/app/lib/db';
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { reviseOrder } from '@/app/lib/finance-server';
import { requireAdmin, readBody, apiError } from '@/app/lib/seo-admin';
import { getSession } from '@/app/lib/auth';

// GET single order
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireAdmin(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        finance: {include: {events: {orderBy: {createdAt: 'desc'}}}},
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Failed to fetch order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

// PUT update order status
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireAdmin(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await readBody(request);
    const order = await prisma.$transaction(tx => reviseOrder(tx, id, session.user!.id, body), {maxWait: 10000, timeout: 15000});

    return NextResponse.json(order);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return NextResponse.json({error: 'Conflict: order changed, refresh first'}, {status: 409});
    if (error instanceof Error && error.message.startsWith('Conflict:')) return NextResponse.json({error: error.message}, {status: 409});
    return apiError(error);

  }
}

// DELETE order
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json({error: 'Use cancellation to preserve order and financial history.'}, {status: 409});
  } catch (error) {
    console.error('Failed to delete order:', error);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}
