const fs = require('fs');
const path = require('path');

console.log('🔄 Mapping seed images to live products...\n');

// Read SQL file to extract all products with their images
const sqlPath = path.join(__dirname, 'seed-neon-complete.sql');
const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

// Map: productName -> imageData
const seedImageMap = {};

const productMatches = sqlContent.split('INSERT INTO "Product"');
productMatches.forEach((block, index) => {
  if (index === 0 || !block.includes('VALUES')) return;
  
  const valuesIndex = block.indexOf('VALUES');
  if (valuesIndex === -1) return;
  
  const content = block.substring(valuesIndex);
  
  // Extract product name
  const nameMatch = content.match(/VALUES\s*\(\s*'([^']+)',\s*'([^']+)'/);
  if (!nameMatch || !nameMatch[2]) return;
  
  const productName = nameMatch[2];
  
  // Find and extract image
  const imageStart = content.indexOf("'data:image/jpeg;base64,");
  if (imageStart === -1) return;
  
  const imageStartPos = imageStart + 1;
  const imageEndPos = content.indexOf("'", imageStartPos);
  
  if (imageEndPos === -1) return;
  
  const imageData = content.substring(imageStartPos, imageEndPos);
  
  if (imageData.length > 50) {
    seedImageMap[productName] = imageData;
  }
});

console.log(`📊 Extracted ${Object.keys(seedImageMap).length} images from seed\n`);
console.log('Seed products:');
Object.keys(seedImageMap).forEach(name => {
  console.log(`  - ${name}`);
});

// Read live export
const jsonPath = path.join(__dirname, '..', 'live-data-export.json');
const exportData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

console.log(`\n📋 Live products: ${exportData.products.length}`);
console.log('Live products:');
exportData.products.forEach(p => {
  console.log(`  - ${p.name}`);
});

// Create better mapping based on partial name matching
const seedProductNames = Object.keys(seedImageMap);
let matchedCount = 0;

exportData.products.forEach(product => {
  // Find the best matching seed product name
  let bestMatch = null;
  let bestScore = 0;
  
  seedProductNames.forEach(seedName => {
    // Simple matching: check if any significant words match
    const liveWords = product.name.toLowerCase().split(/\s+/);
    const seedWords = seedName.toLowerCase().split(/\s+/);
    
    const matches = liveWords.filter(w => seedWords.some(sw => sw.includes(w) || w.includes(sw)));
    const score = matches.length;
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = seedName;
    }
  });
  
  // If we found a reasonable match (at least 1 word match), use it
  if (bestMatch && bestScore >= 1) {
    product.image = seedImageMap[bestMatch];
    matchedCount++;
    console.log(`✅ Matched "${product.name}" with "${bestMatch}"`);
  } else {
    // Try exact or very close match
    if (seedImageMap[product.name]) {
      product.image = seedImageMap[product.name];
      matchedCount++;
      console.log(`✅ Exact match for "${product.name}"`);
    }
  }
});

console.log(`\n📝 Updated ${matchedCount} products with real images\n`);

// Save updated data
fs.writeFileSync(jsonPath, JSON.stringify(exportData, null, 2), 'utf-8');
console.log('✅ Saved updated data to live-data-export.json');
