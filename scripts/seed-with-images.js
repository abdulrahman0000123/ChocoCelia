import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedWithImages() {
  try {
    // قراءة بيانات الـ JSON
    const dataPath = path.join(process.cwd(), 'live-data-export.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    console.log('🌱 جاري بدء عملية الزراعة مع الصور...');

    // حذف البيانات القديمة
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    console.log('✅ تم مسح البيانات القديمة');

    // إضافة الفئات
    for (const category of data.categories) {
      await prisma.category.create({
        data: {
          id: category.id,
          name: category.name,
          nameAr: category.nameAr,
        },
      });
    }
    console.log('✅ تم إضافة الفئات');

    // إضافة المنتجات مع الصور
    for (const product of data.products) {
      await prisma.product.create({
        data: {
          id: product.id,
          name: product.name,
          nameAr: product.nameAr || null,
          description: product.description,
          descriptionAr: product.descriptionAr || null,
          price: product.price,
          image: product.image, // هذا سيكون Base64 string
          categoryId: product.categoryId,
          isAvailable: product.isAvailable ?? true,
          tags: product.tags || null,
        },
      });
    }
    console.log(`✅ تم إضافة ${data.products.length} منتج مع الصور`);

    console.log('✨ اكتملت عملية الزراعة بنجاح!');
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ أثناء الزراعة:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedWithImages();
