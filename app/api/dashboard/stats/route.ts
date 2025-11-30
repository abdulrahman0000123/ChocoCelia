import { prisma } from '@/app/lib/db';
import { NextResponse } from 'next/server';
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

    // Build date filter
    const dateFilter = {} as any;
    if (startDate && endDate) {
      dateFilter.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate + 'T23:59:59.999Z') // End of day
      };
    }

    // Get total orders count
    const totalOrders = await prisma.order.count({
      where: dateFilter
    });

    // Get total revenue
    const ordersWithTotal = await prisma.order.findMany({
      where: dateFilter,
      select: {
        total: true
      }
    });
    const totalRevenue = ordersWithTotal.reduce((sum, order) => sum + order.total, 0);

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
    console.error('Failed to fetch dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
