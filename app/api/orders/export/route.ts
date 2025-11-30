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
        lte: new Date(endDate + 'T23:59:59.999Z')
      };
    }

    // Fetch orders with items
    const orders = await prisma.order.findMany({
      where: dateFilter,
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Create CSV content with UTF-8 BOM for Excel compatibility
    let csv = '\ufeff'; // UTF-8 BOM for proper Arabic display in Excel
    csv += 'Order ID,Date,Status,Customer Name,Phone,Email,Address,Contact Via,Items,Quantities,Unit Prices,Total Price,Special Requests\n';
    
    orders.forEach(order => {
      // TypeScript workaround for Prisma types
      const orderData = order as any;
      
      // Format items details
      const itemNames = order.items.map(item => item.product.name).join('; ');
      const itemQuantities = order.items.map(item => `x${item.quantity}`).join('; ');
      const itemPrices = order.items.map(item => `${item.price} EGP`).join('; ');
      
      const row = [
        order.id,
        new Date(order.createdAt).toLocaleString('en-GB'),
        order.status,
        order.customerName,
        order.customerPhone,
        orderData.customerEmail || 'N/A',
        `"${orderData.customerAddress?.replace(/"/g, '""') || 'N/A'}"`,
        orderData.preferredContact || 'N/A',
        `"${itemNames.replace(/"/g, '""')}"`,
        itemQuantities,
        itemPrices,
        `${order.total.toFixed(2)} EGP`,
        orderData.specialRequests ? `"${orderData.specialRequests.replace(/"/g, '""')}"` : 'N/A'
      ].join(',');
      
      csv += row + '\n';
    });

    // Return CSV with proper headers
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="orders_${startDate || 'all'}_to_${endDate || 'all'}.csv"`
      }
    });
  } catch (error) {
    console.error('Failed to export orders:', error);
    return NextResponse.json(
      { error: 'Failed to export orders' },
      { status: 500 }
    );
  }
}
