// سكربت لنسخ المنتجات بالصور من ملف SQL مباشرة إلى Neon
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_i6F5TXVnkumK@ep-super-credit-a4yy917g-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
});

async function extractProductsFromSQL() {
  const sqlPath = path.join(__dirname, 'seed-neon-complete.sql');
  const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
  
  const products = [];
  
  // البحث عن كل INSERT INTO "Product"
  const productInserts = sqlContent.split('INSERT INTO "Product"');
  
  console.log(`\n📋 Found ${productInserts.length - 1} product INSERT statements`);
  
  for (let i = 1; i < productInserts.length; i++) {
    const insert = productInserts[i];
    
    // استخراج VALUES
    const valuesMatch = insert.match(/VALUES\s*\(/);
    if (!valuesMatch) continue;
    
    const valuesStart = insert.indexOf('VALUES');
    const openParen = insert.indexOf('(', valuesStart);
    
    // البحث عن الـ closing parenthesis
    let depth = 0;
    let closeParen = -1;
    for (let j = openParen; j < insert.length; j++) {
      if (insert[j] === '(') depth++;
      else if (insert[j] === ')') {
        depth--;
        if (depth === 0) {
          closeParen = j;
          break;
        }
      }
    }
    
    if (closeParen === -1) continue;
    
    const valuesContent = insert.substring(openParen + 1, closeParen);
    
    // Parse values
    const values = [];
    let currentValue = '';
    let inQuote = false;
    let escapeNext = false;
    
    for (let j = 0; j < valuesContent.length; j++) {
      const char = valuesContent[j];
      
      if (escapeNext) {
        currentValue += char;
        escapeNext = false;
        continue;
      }
      
      if (char === '\\') {
        escapeNext = true;
        currentValue += char;
        continue;
      }
      
      if (char === "'" && !inQuote) {
        inQuote = true;
        continue;
      }
      
      if (char === "'" && inQuote) {
        // Check for escaped quote
        if (valuesContent[j + 1] === "'") {
          currentValue += "'";
          j++;
          continue;
        }
        inQuote = false;
        continue;
      }
      
      if (char === ',' && !inQuote) {
        values.push(currentValue.trim());
        currentValue = '';
        continue;
      }
      
      currentValue += char;
    }
    values.push(currentValue.trim());
    
    // Extract product data
    if (values.length >= 9) {
      const product = {
        id: values[0],
        name: values[1],
        nameAr: values[2] === 'NULL' ? null : values[2],
        description: values[3],
        descriptionAr: values[4] === 'NULL' ? null : values[4],
        price: parseFloat(values[5]),
        image: values[6],
        categoryId: values[7],
        isAvailable: values[8] === 'true'
      };
      
      products.push(product);
      
      const hasRealImage = product.image.startsWith('data:image');
      console.log(`  ${i}. ${product.name} - ${hasRealImage ? '✅ Has image' : '⚠️ Placeholder'}`);
    }
  }
  
  return products;
}

async function extractCategoriesFromSQL() {
  const sqlPath = path.join(__dirname, 'seed-neon-complete.sql');
  const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
  
  const categories = [];
  
  // البحث عن Category INSERT
  const catMatches = sqlContent.matchAll(/'(cmit[^']+)',\s*'([^']+)',\s*(NULL|'[^']*'),\s*NOW\(\),\s*NOW\(\)/g);
  
  for (const match of catMatches) {
    categories.push({
      id: match[1],
      name: match[2],
      nameAr: match[3] === 'NULL' ? null : match[3].replace(/'/g, '')
    });
  }
  
  return categories;
}

async function main() {
  console.log('🔄 Starting Neon database seed with real images...');
  console.log('📡 Connecting to:', DATABASE_URL.split('@')[1]?.split('/')[0] || 'database');

  try {
    // 1. Extract data from SQL
    const categories = await extractCategoriesFromSQL();
    console.log(`\n📁 Found ${categories.length} categories in SQL`);
    categories.forEach(c => console.log(`  - ${c.name} (${c.id})`));
    
    const products = await extractProductsFromSQL();
    console.log(`\n🍫 Found ${products.length} products in SQL`);
    
    const withImages = products.filter(p => p.image.startsWith('data:image')).length;
    console.log(`📸 Products with real images: ${withImages}/${products.length}`);

    // 2. Clear old data
    console.log('\n🗑️ Clearing old data...');
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('✅ Old data cleared');

    // 3. Create admin user
    console.log('👤 Creating admin user...');
    await prisma.user.create({
      data: {
        id: 'admin-user-id',
        username: 'admin',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
      }
    });
    console.log('✅ Admin user created');

    // 4. Create categories
    console.log('📁 Creating categories...');
    for (const cat of categories) {
      await prisma.category.create({ data: cat });
    }
    console.log(`✅ Created ${categories.length} categories`);

    // 5. Create products with images
    console.log('🍫 Creating products with images...');
    
    let createdCount = 0;
    let withImageCount = 0;
    
    for (const product of products) {
      await prisma.product.create({ data: product });
      
      const hasImage = product.image.startsWith('data:image');
      if (hasImage) {
        console.log(`  ✅ ${product.name} (${(product.image.length / 1024).toFixed(1)}KB image)`);
        withImageCount++;
      } else {
        console.log(`  ⚠️ ${product.name} (placeholder)`);
      }
      createdCount++;
    }
    
    console.log(`✅ Created ${createdCount} products`);

    // 6. Final verification
    console.log('\n📊 Final verification:');
    const totalProducts = await prisma.product.count();
    const productsWithImages = await prisma.product.count({
      where: {
        image: {
          startsWith: 'data:image'
        }
      }
    });
    const totalCategories = await prisma.category.count();
    const totalUsers = await prisma.user.count();

    console.log(`  - Products: ${totalProducts}`);
    console.log(`  - Products with real images: ${productsWithImages}`);
    console.log(`  - Categories: ${totalCategories}`);
    console.log(`  - Users: ${totalUsers}`);

    if (productsWithImages === totalProducts) {
      console.log('\n🎉 All products have real images!');
    } else {
      console.log(`\n⚠️ ${totalProducts - productsWithImages} products still have placeholder images`);
    }

    console.log('\n🎉 Neon database seeded successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
