/**
 * Fetch existing orders from local database
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./dev.db'
    }
  }
});

async function fetchOrders() {
  try {
    console.log('🔍 Fetching orders from local database...\n');
    
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`📦 Total orders found: ${orders.length}\n`);
    
    if (orders.length > 0) {
      // Save to file
      const outputPath = path.join(__dirname, 'orders-export.json');
      fs.writeFileSync(outputPath, JSON.stringify(orders, null, 2), 'utf8');
      
      console.log('✅ Orders exported successfully!');
      console.log(`📄 Output file: ${outputPath}\n`);
      
      // Show summary
      console.log('📊 Orders Summary:');
      console.log('='.repeat(50));
      orders.forEach((order, index) => {
        console.log(`\n${index + 1}. Order #${order.id}`);
        console.log(`   Customer: ${order.customerName}`);
        console.log(`   Email: ${order.customerEmail}`);
        console.log(`   Phone: ${order.customerPhone}`);
        console.log(`   Total: ${order.total} EGP`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Date: ${order.createdAt}`);
        console.log(`   Items: ${order.items.length} products`);
        order.items.forEach(item => {
          console.log(`      - ${item.product.name} x${item.quantity} (${item.price} EGP)`);
        });
      });
    } else {
      console.log('ℹ️  No orders found in local database.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fetchOrders();
