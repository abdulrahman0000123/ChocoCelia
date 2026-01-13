const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verify() {
  const products = await prisma.product.findMany();
  
  console.log('\n📦 Product Images Status:\n');
  
  products.forEach(prod => {
    const hasRealImage = prod.image && prod.image.startsWith('data:image');
    const status = hasRealImage 
      ? `✅ Real image (${(prod.image.length/1024).toFixed(1)}KB)` 
      : '❌ Placeholder';
    console.log(`${prod.name}: ${status}`);
  });
  
  await prisma.$disconnect();
}

verify().catch(console.error);
