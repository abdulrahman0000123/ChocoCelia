const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function updateProductImages() {
  console.log('🎨 Updating product images in database...\n');

  // Read SQL file to extract all images
  const sqlPath = path.join(__dirname, 'seed-neon-complete.sql');
  const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

  // Extract all images from seed SQL
  const images = [];
  const productMatches = sqlContent.split('INSERT INTO "Product"');
  
  productMatches.forEach((block, index) => {
    if (index === 0 || !block.includes('VALUES')) return;
    
    const valuesIndex = block.indexOf('VALUES');
    if (valuesIndex === -1) return;
    
    const content = block.substring(valuesIndex);
    
    // Find and extract image
    const imageStart = content.indexOf("'data:image/jpeg;base64,");
    if (imageStart === -1) return;
    
    const imageStartPos = imageStart + 1;
    const imageEndPos = content.indexOf("'", imageStartPos);
    
    if (imageEndPos === -1) return;
    
    const imageData = content.substring(imageStartPos, imageEndPos);
    
    if (imageData.length > 50) {
      images.push(imageData);
    }
  });

  console.log(`📊 Extracted ${images.length} images from seed file\n`);

  // Get all products from database
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'asc' }
  });

  console.log(`📦 Found ${products.length} products in database\n`);

  // Update each product with an image (cycling through images if needed)
  let updateCount = 0;
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const imageIndex = i % images.length; // Cycle through available images
    const image = images[imageIndex];
    
    await prisma.product.update({
      where: { id: product.id },
      data: { image: image }
    });
    
    console.log(`✅ Updated: ${product.name} (image ${imageIndex + 1})`);
    updateCount++;
  }

  console.log(`\n🎉 Successfully updated ${updateCount} products with real images!`);
  
  await prisma.$disconnect();
}

updateProductImages().catch(console.error);
