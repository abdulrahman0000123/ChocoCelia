import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/auth';
import { CheckoutError, normalizeCouponCode, validateCoupon } from '@/app/lib/checkoutRules';
import { prisma } from '@/app/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (code) {
      // Public coupon validation endpoint
      const coupon = await prisma.coupon.findUnique({ where: { code: normalizeCouponCode(code) } });
      validateCoupon(coupon);

      return NextResponse.json({
        code: coupon!.code,
        discountPct: coupon!.discountPct,
      });
    }

    // Admin get all
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(coupons);
  } catch (error) {
    if (error instanceof CheckoutError) return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
    console.error('Coupons GET error:', error);
    return NextResponse.json(
      { error: 'Failed to process coupon query' },
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
    const { code, discountPct, maxUses, expiry, isActive } = body;

    if (!code || discountPct === undefined) {
      return NextResponse.json(
        { error: 'Coupon code and discount percentage are required' },
        { status: 400 }
      );
    }

    const percentage = Number(discountPct);
    const limit = maxUses === '' || maxUses == null ? null : Number(maxUses);
    if (typeof code !== 'string' || !code.trim() || code.trim().length > 80 ||
        !Number.isFinite(percentage) || percentage <= 0 || percentage > 100 ||
        (limit !== null && (!Number.isInteger(limit) || limit < 1)) ||
        (expiry && !Number.isFinite(new Date(expiry).getTime()))) {
      return NextResponse.json({ error: 'Invalid coupon details' }, { status: 400 });
    }

    // Check if code already exists
    const existing = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A coupon with this code already exists' },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.trim().toUpperCase(),
        discountPct: percentage,
        maxUses: limit,
        expiry: expiry ? new Date(expiry) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json(coupon);
  } catch (error) {
    console.error('Coupon POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create coupon' },
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
    const { id, code, discountPct, maxUses, expiry, isActive } = body;

    if (!id || !code || discountPct === undefined) {
      return NextResponse.json(
        { error: 'ID, code, and discount percentage are required' },
        { status: 400 }
      );
    }

    const percentage = Number(discountPct);
    const limit = maxUses === '' || maxUses == null ? null : Number(maxUses);
    if (typeof code !== 'string' || !code.trim() || code.trim().length > 80 ||
        !Number.isFinite(percentage) || percentage <= 0 || percentage > 100 ||
        (limit !== null && (!Number.isInteger(limit) || limit < 1)) ||
        (expiry && !Number.isFinite(new Date(expiry).getTime()))) {
      return NextResponse.json({ error: 'Invalid coupon details' }, { status: 400 });
    }

    // Check if code is taken by another coupon
    const existing = await prisma.coupon.findFirst({
      where: {
        code: code.trim().toUpperCase(),
        id: { not: id },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Another coupon with this code already exists' },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        code: code.trim().toUpperCase(),
        discountPct: percentage,
        maxUses: limit,
        expiry: expiry ? new Date(expiry) : null,
        isActive: Boolean(isActive),
      },
    });

    return NextResponse.json(coupon);
  } catch (error) {
    console.error('Coupon PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update coupon' },
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
      return NextResponse.json({ error: 'Coupon ID is required' }, { status: 400 });
    }

    await prisma.coupon.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Coupon DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete coupon' },
      { status: 500 }
    );
  }
}
