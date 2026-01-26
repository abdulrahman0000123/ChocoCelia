const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 بدء استعادة البيانات من ملف JSON...');

  try {
    // قراءة البيانات من ملف JSON
    const dataPath = path.join(__dirname, '..', 'live-data-export.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    // حذف البيانات الموجودة أولاً
    console.log('🗑️ حذف البيانات الموجودة...');
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    await prisma.siteSettings.deleteMany();

    console.log('✅ تم حذف البيانات القديمة');

    // إضافة الفئات
    console.log('📁 إضافة الفئات...');
    for (const category of data.categories) {
      await prisma.category.create({
        data: {
          id: category.id,
          name: category.name,
          nameAr: category.nameAr,
          createdAt: new Date(category.createdAt),
          updatedAt: new Date(category.updatedAt),
        },
      });
    }
    console.log(`✅ تم إضافة ${data.categories.length} فئة`);

    // إضافة المنتجات
    console.log('🍫 إضافة المنتجات...');
    for (const product of data.products) {
      await prisma.product.create({
        data: {
          id: product.id,
          name: product.name,
          nameAr: product.nameAr,
          description: product.description,
          descriptionAr: product.descriptionAr,
          price: product.price,
          image: product.image,
          categoryId: product.categoryId,
          isAvailable: product.isAvailable,
          tags: product.tags,
          createdAt: new Date(product.createdAt),
          updatedAt: new Date(product.updatedAt),
        },
      });
    }
    console.log(`✅ تم إضافة ${data.products.length} منتج`);

    // إنشاء المستخدم الأدمن
    console.log('👤 إنشاء مستخدم الأدمن...');
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    await prisma.user.create({
      data: {
        id: 'admin-user-id',
        username: 'admin',
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    console.log('✅ تم إنشاء مستخدم الأدمن (admin / admin123)');

    // إضافة الطلبات إن وجدت (اختياري)
    if (data.orders && data.orders.length > 0) {
      console.log('📋 إضافة الطلبات...');
      for (const order of data.orders) {
        const createdOrder = await prisma.order.create({
          data: {
            id: order.id,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            customerEmail: order.customerEmail,
            customerAddress: order.customerAddress,
            preferredContact: order.preferredContact,
            specialRequests: order.specialRequests,
            status: order.status,
            total: order.total,
            createdAt: new Date(order.createdAt),
            updatedAt: new Date(order.updatedAt),
          },
        });

        // إضافة عناصر الطلب
        for (const item of order.items) {
          await prisma.orderItem.create({
            data: {
              id: item.id,
              orderId: createdOrder.id,
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            },
          });
        }
      }
      console.log(`✅ تم إضافة ${data.orders.length} طلب`);
    }

    // إضافة إعدادات الموقع
    console.log('⚙️ إضافة إعدادات الموقع...');
    await prisma.siteSettings.create({
      data: {
        phone: '+20 123 456 7890',
        facebook: 'https://www.facebook.com/profile.php?id=61582630209700',
        instagram: 'https://www.instagram.com/chococelia2025/',
        deliveryFeeBeniSuef: 20,
        deliveryFeeEastNile: 40,
        instaPayLink: '',
        cashWalletNumber: '',
      },
    });
    console.log('✅ تم إضافة إعدادات الموقع');

    console.log('🎉 تم استعادة جميع البيانات بنجاح!');
    console.log('📊 ملخص البيانات المستعادة:');
    console.log(`   - ${data.categories.length} فئة`);
    console.log(`   - ${data.products.length} منتج`);
    console.log(`   - 1 مستخدم (أدمن)`);
    console.log(`   - ${data.orders ? data.orders.length : 0} طلب`);
    console.log(`   - 1 إعدادات موقع`);

  } catch (error) {
    console.error('❌ حدث خطأ أثناء استعادة البيانات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();