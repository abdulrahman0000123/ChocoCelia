import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateProductImages() {
  try {
    // قراءة بيانات الـ JSON
    const dataPath = path.join(process.cwd(), 'live-data-export.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const data = JSON.parse(rawData);

    console.log('🌱 جاري تحديث الصور من قاعدة البيانات...');
    console.log(`📦 عدد المنتجات: ${data.products.length}`);

    let updatedCount = 0;
    let errorCount = 0;

    // تحديث كل منتج بصورته الحقيقية
    for (const product of data.products) {
      try {
        // التحقق من أن الصورة موجودة و لا تكون placeholder
        if (!product.image || product.image.includes('api/placeholder')) {
          console.log(`⚠️  ${product.name}: لا توجد صورة حقيقية`);
          errorCount++;
          continue;
        }

        // التحقق من أن الصورة هي Base64
        if (!product.image.startsWith('data:image')) {
          console.log(`⚠️  ${product.name}: الصورة ليست Base64`);
          errorCount++;
          continue;
        }

        // تحديث المنتج
        await prisma.product.update({
          where: { id: product.id },
          data: {
            image: product.image,
          },
        });

        console.log(`✅ ${product.name}`);
        updatedCount++;
      } catch (error) {
        console.log(`❌ خطأ في ${product.name}:`, error instanceof Error ? error.message : 'Unknown error');
        errorCount++;
      }
    }

    console.log(`\n✨ انتهت عملية التحديث!`);
    console.log(`✅ تم تحديث: ${updatedCount} منتج`);
    console.log(`❌ أخطاء: ${errorCount} منتج`);

    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ في التحديث:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateProductImages();
