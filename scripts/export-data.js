const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function exportData() {
  try {
    console.log('📦 Exporting data from local database...\n');

    // Get all categories
    const categories = await prisma.category.findMany();
    console.log(`✅ Found ${categories.length} categories`);

    // Get all products
    const products = await prisma.product.findMany({
      include: {
        category: true,
      },
    });
    console.log(`✅ Found ${products.length} products`);

    // Get all users
    const users = await prisma.user.findMany();
    console.log(`✅ Found ${users.length} users`);

    // Get all settings
    const settings = await prisma.settings.findMany();
    console.log(`✅ Found ${settings.length} settings\n`);

    const exportData = {
      categories,
      products,
      users,
      settings,
      exportedAt: new Date().toISOString(),
    };

    // Save to JSON file
    fs.writeFileSync(
      'exported-data.json',
      JSON.stringify(exportData, null, 2)
    );

    console.log('✅ Data exported successfully to exported-data.json\n');
    console.log('📊 Summary:');
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Products: ${products.length}`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Settings: ${settings.length}`);

    // Display products details
    if (products.length > 0) {
      console.log('\n📦 Products Details:');
      products.forEach((product, index) => {
        console.log(`\n${index + 1}. ${product.name} (${product.nameAr})`);
        console.log(`   Category: ${product.category?.name || 'N/A'}`);
        console.log(`   Price: $${product.price}`);
        console.log(`   Available: ${product.isAvailable ? 'Yes' : 'No'}`);
        console.log(`   Image: ${product.image}`);
      });
    }
  } catch (error) {
    console.error('❌ Error exporting data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();
