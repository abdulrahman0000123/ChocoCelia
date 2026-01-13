const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// قراءة البيانات من الملف
const data = JSON.parse(fs.readFileSync('live-data-export.json', 'utf-8'));

const prisma = new PrismaClient();

async function seedNeon() {
  console.log('🚀 بدء رفع البيانات على Neon Database...\n');

  try {
    // ✅ 1. إنشاء Admin User
    console.log('👤 إنشاء Admin User...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.upsert({
      where: { username: 'admin' },
      update: { password: hashedPassword },
      create: {
        username: 'admin',
        password: hashedPassword,
      },
    });
    console.log(`✅ Admin User: ${admin.username}\n`);

    // ✅ 2. إضافة Categories
    console.log('📁 إضافة Categories...');
    const categoryMap = {};
    
    for (const category of data.categories) {
      const cat = await prisma.category.upsert({
        where: { name: category.name },
        update: {
          nameAr: category.nameAr,
        },
        create: {
          name: category.name,
          nameAr: category.nameAr,
        },
      });
      categoryMap[category.id] = cat.id;
      console.log(`✅ Category: ${cat.name}`);
    }
    console.log(`✅ تم إضافة ${data.categories.length} categories\n`);

    // ✅ 3. إضافة Products
    console.log('📦 إضافة Products...');
    let productCount = 0;
    
    for (const product of data.products) {
      try {
        // الحصول على الـ categoryId الجديد
        const newCategoryId = categoryMap[product.categoryId];
        
        if (!newCategoryId) {
          console.log(`⚠️  تخطي المنتج ${product.name} - Category غير موجودة`);
          continue;
        }

        const prod = await prisma.product.upsert({
          where: { id: product.id },
          update: {
            name: product.name,
            nameAr: product.nameAr,
            description: product.description,
            descriptionAr: product.descriptionAr,
            price: product.price,
            image: product.image,
            categoryId: newCategoryId,
            isAvailable: product.isAvailable,
            tags: product.tags,
          },
          create: {
            name: product.name,
            nameAr: product.nameAr,
            description: product.description,
            descriptionAr: product.descriptionAr,
            price: product.price,
            image: product.image,
            categoryId: newCategoryId,
            isAvailable: product.isAvailable,
            tags: product.tags,
          },
        });
        
        productCount++;
        console.log(`✅ Product: ${prod.name} ($${prod.price})`);
      } catch (error) {
        console.log(`❌ خطأ في إضافة ${product.name}: ${error.message}`);
      }
    }
    console.log(`✅ تم إضافة ${productCount} products\n`);

    // ✅ 4. إضافة Settings (إذا موجودة)
    if (data.settings && Object.keys(data.settings).length > 0) {
      console.log('⚙️ إضافة Settings...');
      try {
        // حذف أي settings قديمة
        await prisma.siteSettings.deleteMany({});
        
        // إضافة Settings جديدة
        const settings = await prisma.siteSettings.create({
          data: {
            phone: data.settings.phone || '',
            facebook: data.settings.facebook || '',
            instagram: data.settings.instagram || '',
            heroTitle: data.settings.heroTitle || 'ChocoCelia',
            heroHighlight: data.settings.heroHighlight || 'Your Daily Dose Of Happiness',
            heroSubtitle: data.settings.heroSubtitle || 'Experience the finest handmade chocolates',
            heroSlides: data.settings.heroSlides || JSON.stringify([]),
            featureCard1Icon: data.settings.featureCard1Icon || '🌿',
            featureCard1Title: data.settings.featureCard1Title || 'Premium Ingredients',
            featureCard1Description: data.settings.featureCard1Description || 'Made with the finest ingredients',
            featureCard2Icon: data.settings.featureCard2Icon || '🤎',
            featureCard2Title: data.settings.featureCard2Title || 'Handmade with Love',
            featureCard2Description: data.settings.featureCard2Description || 'Crafted in small batches',
            featureCard3Icon: data.settings.featureCard3Icon || '✨',
            featureCard3Title: data.settings.featureCard3Title || 'Unique Flavors',
            featureCard3Description: data.settings.featureCard3Description || 'Innovative combinations',
          },
        });
        console.log('✅ Settings تم إضافتها\n');
      } catch (error) {
        console.log(`⚠️ Settings: ${error.message}\n`);
      }
    }

    // 📊 عرض الملخص النهائي
    console.log('═════════════════════════════════════');
    console.log('✅ تم رفع البيانات بنجاح!');
    console.log('═════════════════════════════════════');
    console.log(`👤 Admin Users: 1`);
    console.log(`📁 Categories: ${data.categories.length}`);
    console.log(`📦 Products: ${productCount}`);
    console.log('═════════════════════════════════════\n');

    console.log('🎉 الموقع جاهز للاستخدام!');
    console.log('🔑 Admin Login:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   URL: https://choco-celia2.vercel.app/admin/login\n');

  } catch (error) {
    console.error('❌ حدث خطأ:', error);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
seedNeon()
  .then(() => {
    console.log('✅ انتهى السكريبت بنجاح');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ فشل السكريبت:', error);
    process.exit(1);
  });
