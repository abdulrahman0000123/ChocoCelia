const fs = require('fs');

async function fetchLiveData() {
  const baseUrl = 'https://choco-celia2.vercel.app';
  
  console.log('🌐 Fetching data from live website...\n');

  try {
    // Fetch Categories
    console.log('📦 Fetching categories...');
    const categoriesRes = await fetch(`${baseUrl}/api/categories`);
    const categories = await categoriesRes.json();
    console.log(`✅ Found ${categories.length} categories`);

    // Fetch Products
    console.log('📦 Fetching products...');
    const productsRes = await fetch(`${baseUrl}/api/products`);
    const products = await productsRes.json();
    console.log(`✅ Found ${products.length} products`);

    // Fetch Settings
    console.log('📦 Fetching settings...');
    const settingsRes = await fetch(`${baseUrl}/api/settings`);
    const settings = await settingsRes.json();
    console.log(`✅ Found settings`);

    const exportData = {
      categories,
      products,
      settings,
      exportedAt: new Date().toISOString(),
      source: 'live-website'
    };

    // Save to JSON file
    fs.writeFileSync(
      'live-data-export.json',
      JSON.stringify(exportData, null, 2)
    );

    console.log('\n✅ Data exported successfully to live-data-export.json\n');
    console.log('📊 Summary:');
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Products: ${products.length}`);
    
    // Display products details
    if (products.length > 0) {
      console.log('\n📦 Products Details:');
      products.forEach((product, index) => {
        console.log(`\n${index + 1}. ${product.name} (${product.nameAr || 'N/A'})`);
        console.log(`   Category: ${product.category?.name || product.categoryId}`);
        console.log(`   Price: $${product.price}`);
        console.log(`   Available: ${product.isAvailable ? 'Yes' : 'No'}`);
        console.log(`   Tags: ${product.tags || 'None'}`);
        console.log(`   Image: ${product.image}`);
      });
    }

    // Display categories
    if (categories.length > 0) {
      console.log('\n📁 Categories:');
      categories.forEach((category, index) => {
        console.log(`${index + 1}. ${category.name} (${category.nameAr || 'N/A'})`);
      });
    }

  } catch (error) {
    console.error('❌ Error fetching data:', error.message);
  }
}

fetchLiveData();
