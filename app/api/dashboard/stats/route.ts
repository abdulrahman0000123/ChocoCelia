import { Prisma } from '@prisma/client';
import { prisma } from '@/app/lib/db';
import { NextResponse } from 'next/server';
import { financeDateFilter, historicalNetSales } from '@/app/lib/finance';
import { apiError } from '@/app/lib/seo-admin';
import { getSession } from '@/app/lib/auth';

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters for date filtering
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const dateFilter = financeDateFilter(startDate, endDate);

    // Get total orders count
    const totalOrders = await prisma.order.count({
      where: dateFilter
    });

    // Get total revenue (only from COMPLETED orders)
    const completedOrdersWithTotal = await prisma.order.findMany({
      where: {
        ...dateFilter,
        status: 'COMPLETED'
      },
      select: {
        total: true, subtotal: true, discountAmount: true, deliveryFee: true, finance: {select: {netSales: true}}
      }
    });
    const totalRevenue = Number(completedOrdersWithTotal.reduce((sum, order) => sum.plus(order.finance?.netSales ?? historicalNetSales(order)), new Prisma.Decimal(0)));

    // Get total products count (not filtered by date)
    const totalProducts = await prisma.product.count();

    // Get orders by status
    const pendingOrders = await prisma.order.count({
      where: {
        ...dateFilter,
        status: 'PENDING'
      }
    });

    const completedOrders = await prisma.order.count({
      where: {
        ...dateFilter,
        status: 'COMPLETED'
      }
    });

    const cancelledOrders = await prisma.order.count({
      where: {
        ...dateFilter,
        status: 'CANCELLED'
      }
    });

    return NextResponse.json({
      totalOrders,
      totalRevenue,
      totalProducts,
      pendingOrders,
      completedOrders,
      cancelledOrders
    });
  } catch (error) {
    return apiError(error);
  }
}
