import { prisma } from '@/app/lib/db';
import { NextResponse } from 'next/server';
import { financeDateFilter, paymentState, type FinanceLine } from '@/app/lib/finance';
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

    const status = searchParams.get('status');
    if (status && !['PENDING','PROCESSING','COMPLETED','CANCELLED'].includes(status)) throw new Error('Invalid status');
    const dateFilter = {...financeDateFilter(startDate, endDate), ...(status ? {status} : {})};

    // Fetch orders with items
    const orders = await prisma.order.findMany({
      where: dateFilter,
      include: {
        finance: true,
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
    csv += 'Order ID,Date,Status,Customer Name,Phone,Email,Address,Contact Via,Items,Quantities,Unit Prices,Total Price,Special Requests,Requested Delivery Date (Cairo),Requested Delivery Time (Cairo),Subtotal,Delivery Fee,Coupon Code,Discount Percent,Discount Amount,Net Product Sales,Product Cost,Advertising Percent,Advertising Allocation,Delivery Cost,Profit After Advertising And Delivery,Development Percent,Development Allocation,After Allocations,Received,Refunded,Collection Status,Finance Complete\n';
    
    orders.forEach(order => {
      // TypeScript workaround for Prisma types
      const orderData = order as any;
      
      // Format items details
      const snapshot = order.finance?.lines as FinanceLine[] | undefined;
      const itemNames = snapshot ? snapshot.map(line => line.name).join('; ') : order.items.map(item => item.product.name).join('; ');
      const itemQuantities = snapshot ? snapshot.map(line => `x${line.quantity}`).join('; ') : order.items.map(item => `x${item.quantity}`).join('; ');
      const itemPrices = snapshot ? snapshot.map(line => `${line.price} EGP`).join('; ') : order.items.map(item => `${item.price} EGP`).join('; ');
      
      const row = [
        order.id,
        new Date(order.createdAt).toLocaleString('en-GB', {timeZone:'Africa/Cairo'}),
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
        orderData.specialRequests ? `"${orderData.specialRequests.replace(/"/g, '""')}"` : 'N/A',
        order.requestedDeliveryDate || 'N/A',
        order.requestedDeliveryTime || 'N/A',
        order.subtotal?.toFixed(2) ?? 'N/A',
        order.deliveryFee?.toFixed(2) ?? 'N/A',
        `"${(order.couponCode || '').replace(/"/g, '""')}"`,
        order.discountPct,
        order.discountAmount.toFixed(2),
        order.finance?.netSales ?? 'N/A', order.finance?.productCost ?? 'N/A',
        order.finance?.advertisingPct ?? 'N/A', order.finance?.advertising ?? 'N/A',
        order.finance?.deliveryCost ?? 'N/A', order.finance?.profit ?? 'N/A',
        order.finance?.developmentPct ?? 'N/A', order.finance?.development ?? 'N/A',
        order.finance?.available ?? 'N/A', order.finance?.received ?? 'N/A', order.finance?.refunded ?? 'N/A',
        order.finance ? paymentState(order.total, order.finance.received, order.finance.refunded) : 'UNKNOWN',
        order.finance?.profit != null ? 'YES' : 'NO'
      ].map(value => {
        const text = String(value);
        // Existing quoted fields are already escaped; guard formula-like text too.
        const raw = text.startsWith('"') && text.endsWith('"') ? text.slice(1,-1).replaceAll('""','"') : text;
        const safe = /^[=+@\-\t\r]/.test(raw) && !/^-?\d+(\.\d+)?$/.test(raw) ? `'${raw}` : raw;
        return text.startsWith('"') || /[,"\r\n]/.test(safe) ? `"${safe.replaceAll('"','""')}"` : safe;
      }).join(',');
      
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
    return apiError(error);
  }
}
