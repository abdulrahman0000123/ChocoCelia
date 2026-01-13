/**
 * Read orders directly from SQLite database
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'dev.db');

console.log('🔍 Opening SQLite database...');
console.log(`   Path: ${dbPath}\n`);

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    return;
  }
  
  console.log('✅ Database opened successfully!\n');
  
  // First, check if Order table exists
  db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
    if (err) {
      console.error('❌ Error fetching tables:', err.message);
      db.close();
      return;
    }
    
    console.log('📋 Tables in database:');
    tables.forEach(table => {
      console.log(`   - ${table.name}`);
    });
    
    // Check if Order table exists
    const hasOrderTable = tables.some(t => t.name === 'Order');
    
    if (!hasOrderTable) {
      console.log('\nℹ️  No Order table found. Database might be empty.');
      db.close();
      return;
    }
    
    console.log('\n🔍 Fetching orders...\n');
    
    // Fetch all orders
    db.all('SELECT * FROM "Order"', [], (err, orders) => {
      if (err) {
        console.error('❌ Error fetching orders:', err.message);
        db.close();
        return;
      }
      
      console.log(`📦 Total orders found: ${orders.length}\n`);
      
      if (orders.length === 0) {
        console.log('ℹ️  No orders found in database.');
        db.close();
        return;
      }
      
      // Fetch order items for each order
      let processedOrders = 0;
      const ordersWithItems = [];
      
      orders.forEach((order, index) => {
        db.all('SELECT * FROM "OrderItem" WHERE "orderId" = ?', [order.id], (err, items) => {
          if (err) {
            console.error(`❌ Error fetching items for order ${order.id}:`, err.message);
          } else {
            ordersWithItems.push({
              ...order,
              items: items
            });
          }
          
          processedOrders++;
          
          // When all orders are processed
          if (processedOrders === orders.length) {
            // Save to file
            const outputPath = path.join(__dirname, 'orders-export.json');
            fs.writeFileSync(outputPath, JSON.stringify(ordersWithItems, null, 2), 'utf8');
            
            console.log('✅ Orders exported successfully!');
            console.log(`📄 Output file: ${outputPath}\n`);
            
            // Show summary
            console.log('📊 Orders Summary:');
            console.log('='.repeat(60));
            ordersWithItems.forEach((order, idx) => {
              console.log(`\n${idx + 1}. Order #${order.id}`);
              console.log(`   Customer: ${order.customerName}`);
              console.log(`   Email: ${order.customerEmail}`);
              console.log(`   Phone: ${order.customerPhone}`);
              console.log(`   Total: ${order.total} EGP`);
              console.log(`   Status: ${order.status}`);
              console.log(`   Date: ${order.createdAt}`);
              console.log(`   Items: ${order.items.length} products`);
            });
            
            db.close();
          }
        });
      });
    });
  });
});
