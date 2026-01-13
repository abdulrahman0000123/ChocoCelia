/**
 * Extract real product images from seed-neon-complete.sql
 * and update live-data-export.json with actual images
 */

const fs = require('fs');
const path = require('path');

// Read the SQL file
const sqlFile = path.join(__dirname, '..', 'scripts', 'seed-neon-complete.sql');
const sqlContent = fs.readFileSync(sqlFile, 'utf8');

// Read the data export file
const dataPath = path.join(__dirname, '..', 'live-data-export.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log('🎨 استخراج الصور الحقيقية من قاعدة البيانات...\n');

// Map to store product IDs and their images
const imageMap = {};

// Parse SQL file to extract images
// Pattern: VALUES ('product-id', 'name', ..., 'data:image/jpeg;base64,XXX', 'category-id', ...
const productPattern = /INSERT INTO "Product"[^V]*VALUES\s*\('([^']+)',\s*'([^']+)',[^']*'data:image\/[^;]+;base64,([^']+)',\s*'([^']+)'/gm;

let match;
let foundCount = 0;

while ((match = productPattern.exec(sqlContent)) !== null) {
  const productId = match[1];
  const productName = match[2];
  const imageBase64 = match[3];
  const categoryId = match[4];
  
  if (imageBase64 && imageBase64.length > 100) {
    imageMap[productId] = `data:image/jpeg;base64,${imageBase64}`;
    console.log(`✅ ${productName} (${productId})`);
    foundCount++;
  }
}

console.log(`\n📊 تم استخراج ${foundCount} صورة\n`);

// Update products with real images
let updatedCount = 0;
data.products = data.products.map(product => {
  if (imageMap[product.id]) {
    updatedCount++;
    console.log(`🔄 ${product.name}`);
    return {
      ...product,
      image: imageMap[product.id]
    };
  }
  return product;
});

console.log(`\n✨ تم تحديث ${updatedCount} منتج\n`);

// Save updated data
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log(`✅ تم حفظ البيانات في live-data-export.json`);
console.log(`\n📝 الخطوات التالية:`);
console.log(`1. قم بتشغيل سكريبت تحديث قاعدة البيانات`);
console.log(`2. يمكنك الآن رؤية الصور الحقيقية على الموقع`);
