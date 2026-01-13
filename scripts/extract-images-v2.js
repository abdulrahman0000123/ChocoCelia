const fs = require('fs');
const path = require('path');

console.log('🎨 استخراج الصور الحقيقية من قاعدة البيانات...\n');

// Read the seed SQL file
const sqlFile = path.join(__dirname, 'seed-neon-complete.sql');
const sqlContent = fs.readFileSync(sqlFile, 'utf8');

// Read the data export file
const dataPath = path.join(__dirname, '..', 'live-data-export.json');
let data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Strategy: Split by INSERT statements, then parse each one
const insertMatches = sqlContent.matchAll(/INSERT INTO "Product"[^;]+;/gm);

const imageMap = {};
let foundCount = 0;

for (const match of insertMatches) {
  const statement = match[0];
  
  // Extract product name from the statement
  // Pattern: VALUES ('product-id', 'product-name', 
  const nameMatch = statement.match(/VALUES\s*\('([^']*)',\s*'([^']*)'/);
  if (!nameMatch) continue;
  
  const productId = nameMatch[1];
  const productName = nameMatch[2];
  
  // Find the base64 image data
  // Look for: 'data:image/jpeg;base64,....'
  const imageMatch = statement.match(/'(data:image\/jpeg;base64,[^']{100,})'/);
  
  if (imageMatch && imageMatch[1] && imageMatch[1].length > 50) {
    imageMap[productName] = imageMatch[1];
    foundCount++;
    console.log(`✅ Found image for: ${productName}`);
  }
}

console.log(`\n📊 Total images found: ${foundCount}\n`);

// Update products with real images
let updatedCount = 0;
data.products.forEach(product => {
  if (imageMap[product.name]) {
    product.image = imageMap[product.name];
    updatedCount++;
    console.log(`🔄 Updated: ${product.name}`);
  }
});

// Save the updated data
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log(`\n✨ Updated ${updatedCount} products\n`);
console.log('✅ Saved data to live-data-export.json');
console.log('\n📝 Next steps:');
console.log('1. Run database update script');
console.log('2. You can now see real product images on the website');
