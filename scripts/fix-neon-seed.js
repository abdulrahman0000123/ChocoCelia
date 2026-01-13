// سكربت لتصحيح وتنفيذ seed على قاعدة بيانات Neon
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

async function main() {
  console.log('🔄 Starting Neon database seed...');
  console.log('📡 Connecting to:', DATABASE_URL.split('@')[1]?.split('/')[0] || 'database');

  try {
    // 1. قراءة الصور من الملف
    const sqlPath = path.join(__dirname, 'seed-neon-complete.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
    
    // استخراج الصور
    const imageMap = {};
    const productInserts = sqlContent.split('INSERT INTO "Product"');
    
    for (let i = 1; i < productInserts.length; i++) {
      const insert = productInserts[i];
      const idMatch = insert.match(/'(cmj[^']+)'/);
      const imageStart = insert.indexOf("'data:image/jpeg;base64,");
      
      if (idMatch && imageStart !== -1) {
        const productId = idMatch[1];
        let imageEnd = imageStart + 1;
        let quoteCount = 0;
        
        for (let j = imageStart + 1; j < insert.length; j++) {
          if (insert[j] === "'") {
            imageEnd = j;
            break;
          }
        }
        
        const imageData = insert.substring(imageStart + 1, imageEnd);
        imageMap[productId] = imageData;
        console.log(`📸 Found image for product ${productId}: ${(imageData.length / 1024).toFixed(1)}KB`);
      }
    }

    console.log(`\n📊 Found ${Object.keys(imageMap).length} images total\n`);

    // 2. مسح البيانات القديمة
    console.log('🗑️ Clearing old data...');
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
    // Skip SiteSettings if not exists
    try {
      await prisma.siteSettings.deleteMany({});
    } catch (e) {
      console.log('  ⚠️ SiteSettings table not found, skipping...');
    }
    await prisma.user.deleteMany({});
    console.log('✅ Old data cleared');

    // 3. إنشاء Admin user
    console.log('👤 Creating admin user...');
    await prisma.user.create({
      data: {
        id: 'admin-user-id',
        username: 'admin',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
      }
    });
    console.log('✅ Admin user created');

    // 4. إنشاء Categories
    console.log('📁 Creating categories...');
    const categories = [
      { id: 'cmit4kevr0005ze2af4eb77wy', name: 'Mixes', nameAr: null },
      { id: 'cmit4kevh0004ze2ak43hjqhb', name: 'Boxes', nameAr: null },
      { id: 'cmit4kev50003ze2apdnlo1w5', name: 'White', nameAr: null },
      { id: 'cmit4keut0002ze2a4agha3zn', name: 'Milk', nameAr: null },
      { id: 'cmit4keu70001ze2apjec1a3g', name: 'Dark', nameAr: null }
    ];
    
    for (const cat of categories) {
      await prisma.category.create({ data: cat });
    }
    console.log('✅ Categories created');

    // 5. إنشاء المنتجات مع الصور
    console.log('🍫 Creating products with images...');
    
    const products = [
      {
        id: 'cmjxb27df0001yk7m38losy37',
        name: 'Stuffed dates with mixed nuts',
        nameAr: 'تمر بالمكسرات والشوكولاتة',
        description: 'Stuffed dates with mixed nuts, coated in chocolate (white, milk, and dark) (24 pec)',
        descriptionAr: 'تمر محشو مكسرات ومغطي بالشوكولاته ( وايت، بني بالحليب، دارك) ( 24 قطعة)',
        price: 170,
        categoryId: 'cmit4kevr0005ze2af4eb77wy',
        isAvailable: true
      },
      {
        id: 'cmjxb27dr0002yk7mw2z3l5zc',
        name: 'Chocolate Bomb',
        nameAr: 'قنبلة الشوكولاتة',
        description: 'Hollow chocolate ball with hot chocolate powder inside. Just add hot milk!',
        descriptionAr: 'كرة شوكولاتة مجوفة بها بودرة هوت شوكوليت. فقط أضف الحليب الساخن!',
        price: 45,
        categoryId: 'cmit4keut0002ze2a4agha3zn',
        isAvailable: true
      },
      {
        id: 'cmjxb27e30003yk7mhq5w9x8k',
        name: 'Assorted Chocolate Box',
        nameAr: 'علبة شوكولاتة متنوعة',
        description: 'Assorted luxury chocolates in a beautiful gift box (20 pieces)',
        descriptionAr: 'شوكولاتة فاخرة متنوعة في علبة هدايا جميلة (20 قطعة)',
        price: 250,
        categoryId: 'cmit4kevh0004ze2ak43hjqhb',
        isAvailable: true
      },
      {
        id: 'cmjxb27ef0004yk7m9n2k7p4m',
        name: 'Dark Chocolate Truffles',
        nameAr: 'ترافل الشوكولاتة الداكنة',
        description: 'Handmade dark chocolate truffles with cocoa coating (12 pieces)',
        descriptionAr: 'ترافل شوكولاتة داكنة مصنوعة يدوياً مع غطاء كاكاو (12 قطعة)',
        price: 120,
        categoryId: 'cmit4keu70001ze2apjec1a3g',
        isAvailable: true
      },
      {
        id: 'cmjxb27er0005yk7m4l8j2n6h',
        name: 'White Chocolate Hearts',
        nameAr: 'قلوب الشوكولاتة البيضاء',
        description: 'Creamy white chocolate hearts with strawberry filling (15 pieces)',
        descriptionAr: 'قلوب شوكولاتة بيضاء كريمية بحشوة الفراولة (15 قطعة)',
        price: 95,
        categoryId: 'cmit4kev50003ze2apdnlo1w5',
        isAvailable: true
      },
      {
        id: 'cmjxb27f30006yk7m1p3h5r2q',
        name: 'Milk Chocolate Almonds',
        nameAr: 'لوز بالشوكولاتة بالحليب',
        description: 'Roasted almonds covered in milk chocolate (200g)',
        descriptionAr: 'لوز محمص مغطى بشوكولاتة الحليب (200 جرام)',
        price: 85,
        categoryId: 'cmit4keut0002ze2a4agha3zn',
        isAvailable: true
      },
      {
        id: 'cmjxb27ff0007yk7m6k2n8t5w',
        name: 'Dark Chocolate Bar 70%',
        nameAr: 'لوح شوكولاتة داكنة 70%',
        description: 'Premium 70% dark chocolate bar (100g)',
        descriptionAr: 'لوح شوكولاتة داكنة فاخرة 70% (100 جرام)',
        price: 55,
        categoryId: 'cmit4keu70001ze2apjec1a3g',
        isAvailable: true
      },
      {
        id: 'cmjxb27fr0008yk7m3m7j9p1x',
        name: 'White Chocolate Macadamia',
        nameAr: 'مكاديميا بالشوكولاتة البيضاء',
        description: 'Premium macadamia nuts covered in white chocolate (200g)',
        descriptionAr: 'مكاديميا فاخرة مغطاة بالشوكولاتة البيضاء (200 جرام)',
        price: 140,
        categoryId: 'cmit4kev50003ze2apdnlo1w5',
        isAvailable: true
      },
      {
        id: 'cmjxb27g40009yk7m8n4k6r3y',
        name: 'Chocolate Covered Strawberries',
        nameAr: 'فراولة مغطاة بالشوكولاتة',
        description: 'Fresh strawberries dipped in chocolate (12 pieces)',
        descriptionAr: 'فراولة طازجة مغموسة في الشوكولاتة (12 قطعة)',
        price: 110,
        categoryId: 'cmit4kevr0005ze2af4eb77wy',
        isAvailable: true
      },
      {
        id: 'cmjxb27gg0010yk7m2l9m5t7z',
        name: 'Luxury Gift Box',
        nameAr: 'صندوق هدايا فاخر',
        description: 'Premium assorted chocolates in luxury wooden box (30 pieces)',
        descriptionAr: 'شوكولاتة متنوعة فاخرة في صندوق خشبي فاخر (30 قطعة)',
        price: 350,
        categoryId: 'cmit4kevh0004ze2ak43hjqhb',
        isAvailable: true
      },
      {
        id: 'cmjxb27gs0011yk7m5n1p8w2a',
        name: 'Dark Chocolate Espresso',
        nameAr: 'شوكولاتة داكنة بالإسبريسو',
        description: 'Dark chocolate with espresso coffee center (15 pieces)',
        descriptionAr: 'شوكولاتة داكنة بحشوة قهوة إسبريسو (15 قطعة)',
        price: 130,
        categoryId: 'cmit4keu70001ze2apjec1a3g',
        isAvailable: true
      },
      {
        id: 'cmjxb27h50012yk7m9k3r2x4b',
        name: 'Milk Chocolate Hazelnut Spread',
        nameAr: 'شوكولاتة بالحليب بالبندق',
        description: 'Smooth milk chocolate hazelnut spread (250g jar)',
        descriptionAr: 'شوكولاتة بالحليب والبندق ناعمة (برطمان 250 جرام)',
        price: 75,
        categoryId: 'cmit4keut0002ze2a4agha3zn',
        isAvailable: true
      },
      {
        id: 'cmjxb27hh0013yk7m4m6t5y1c',
        name: 'White Chocolate Raspberry',
        nameAr: 'شوكولاتة بيضاء بالتوت',
        description: 'White chocolate truffles with raspberry filling (12 pieces)',
        descriptionAr: 'ترافل شوكولاتة بيضاء بحشوة التوت (12 قطعة)',
        price: 100,
        categoryId: 'cmit4kev50003ze2apdnlo1w5',
        isAvailable: true
      },
      {
        id: 'cmjxb27ht0014yk7m7p9w8z3d',
        name: 'Mixed Chocolate Fondue',
        nameAr: 'فوندو شوكولاتة متنوع',
        description: 'Chocolate fondue set with fruits and marshmallows',
        descriptionAr: 'طقم فوندو شوكولاتة مع الفواكه والمارشميلو',
        price: 180,
        categoryId: 'cmit4kevr0005ze2af4eb77wy',
        isAvailable: true
      }
    ];

    let createdCount = 0;
    for (const product of products) {
      const image = imageMap[product.id] || '/api/placeholder/300/300';
      
      await prisma.product.create({
        data: {
          ...product,
          image
        }
      });
      
      if (imageMap[product.id]) {
        console.log(`  ✅ ${product.name} (with real image)`);
      } else {
        console.log(`  ⚠️ ${product.name} (placeholder image)`);
      }
      createdCount++;
    }
    
    console.log(`✅ Created ${createdCount} products`);

    // 6. التحقق النهائي
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

    console.log('\n🎉 Neon database seeded successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
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
