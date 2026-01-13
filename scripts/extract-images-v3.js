const fs = require('fs');
const path = require('path');

console.log('🎨 استخراج الصور من قاعدة البيانات (Approach 3 - Direct String Search)...\n');

// Read SQL file
const sqlPath = path.join(__dirname, 'seed-neon-complete.sql');
const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

// Read existing export
const jsonPath = path.join(__dirname, '..', 'live-data-export.json');
const exportData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

const imageMap = {};
let foundCount = 0;

// Split by product statements
const productMatches = sqlContent.split('INSERT INTO "Product"');

productMatches.forEach((block, index) => {
  if (index === 0 || !block.includes('VALUES')) return; // Skip header
  
  // Find VALUES clause
  const valuesIndex = block.indexOf('VALUES');
  if (valuesIndex === -1) return;
  
  const content = block.substring(valuesIndex);
  
  // Extract product name (second parameter after id)
  const nameMatch = content.match(/VALUES\s*\(\s*'([^']+)',\s*'([^']+)'/);
  if (!nameMatch || !nameMatch[2]) return;
  
  const productId = nameMatch[1];
  const productName = nameMatch[2];
  
  // Find image data - look for the base64 string start
  const imageStart = content.indexOf("'data:image/jpeg;base64,");
  if (imageStart === -1) {
    console.log(`❌ No image found for: ${productName}`);
    return;
  }
  
  // Extract image starting after the quote
  const imageStartPos = imageStart + 1; // Skip the opening quote
  const imageEndPos = content.indexOf("'", imageStartPos);
  
  if (imageEndPos === -1) {
    console.log(`❌ Could not find end of image for: ${productName}`);
    return;
  }
  
  const imageData = content.substring(imageStartPos, imageEndPos);
  
  if (imageData.length > 50) {
    imageMap[productName] = imageData;
    foundCount++;
    console.log(`✅ Found image for: ${productName} (${(imageData.length / 1024).toFixed(1)}KB)`);
  }
});

console.log(`\n📊 Total images found: ${foundCount}\n`);

// Update products with images
let updatedCount = 0;
exportData.products.forEach(product => {
  if (imageMap[product.name]) {
    product.image = imageMap[product.name];
    updatedCount++;
  }
});

console.log(`✨ Updated ${updatedCount} products\n`);

// Save updated data
fs.writeFileSync(jsonPath, JSON.stringify(exportData, null, 2), 'utf-8');

console.log('✅ Saved data to live-data-export.json');
console.log('\n📝 Next steps:');
console.log('1. Run database update script');
console.log('2. You can now see real product images on the website');
