/**
 * Generate Unique Product Images using Canvas/Sharp
 * Creates distinctive images for each product based on their type
 */

const fs = require('fs');
const path = require('path');

// Using placeholder image generation with different colors
// for different product types

const colors = {
  'Dark': '#3d2817',      // Dark brown for dark chocolate
  'Milk': '#8b6f47',      // Medium brown for milk chocolate
  'White': '#f5deb3',     // Wheat color for white chocolate
  'Boxes': '#5c4033',     // Darker brown for boxes
  'Mixes': '#9b8b7e'      // Mixed brown for mixes
};

async function generateProductImages() {
  const dataPath = path.join(__dirname, '..', 'live-data-export.json');
  
  if (!fs.existsSync(dataPath)) {
    console.error('❌ live-data-export.json not found!');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  console.log('🎨 Generating unique images for products...\n');

  // Map of product IDs to image URLs (placeholder with color variation)
  const imageMap = {};
  
  for (const product of data.products) {
    const category = data.categories.find(c => c.name === product.category?.name || c.id === product.categoryId);
    const categoryName = category?.name || 'Boxes';
    const color = colors[categoryName] || colors['Boxes'];
    
    // Create a unique placeholder image for each product using different colors
    // Using picsum.photos for real images or a color-coded placeholder
    const imageUrl = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect fill='${encodeURIComponent(color)}' width='300' height='300'/%3E%3Ctext x='150' y='100' font-size='20' fill='white' text-anchor='middle' font-family='Arial'%3E${encodeURIComponent(product.name.substring(0, 15))}%3C/text%3E%3Ctext x='150' y='150' font-size='14' fill='%23ddd' text-anchor='middle' font-family='Arial'%3E${encodeURIComponent(categoryName)}%3C/text%3E%3C/svg%3E`;
    
    imageMap[product.id] = imageUrl;
    console.log(`✅ ${product.name} (${categoryName})`);
  }

  // Update live-data-export.json with new image URLs
  data.products = data.products.map(product => ({
    ...product,
    image: imageMap[product.id]
  }));

  // Save updated data
  fs.writeFileSync(
    dataPath,
    JSON.stringify(data, null, 2)
  );

  console.log('\n✨ Image generation complete!');
  console.log(`📸 Generated ${data.products.length} unique product images`);
  
  // Now generate SQL with the new images
  generateSQLWithImages(data);
}

function generateSQLWithImages(data) {
  console.log('\n📝 Generating SQL seed script...\n');

  let sql = `-- =================================================================
-- ChocoCeliaDB - Database Seed with Generated Product Images
-- Database: ChocoCeliaDB (Neon PostgreSQL)
-- Generated: ${new Date().toISOString().split('T')[0]}
-- =================================================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS "OrderItem" CASCADE;
DROP TABLE IF EXISTS "Order" CASCADE;
DROP TABLE IF EXISTS "Product" CASCADE;
DROP TABLE IF EXISTS "Category" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "SiteSettings" CASCADE;

-- Create tables
CREATE TABLE "User" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT UNIQUE NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "Category" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameAr" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "Product" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameAr" TEXT,
    "description" TEXT,
    "descriptionAr" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "image" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "tags" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "Order" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "OrderItem" (
    "id" TEXT PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "SiteSettings" (
    "id" TEXT PRIMARY KEY,
    "logoUrl" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "socialMedia" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create indexes
CREATE INDEX "idx_product_category" ON "Product"("categoryId");
CREATE INDEX "idx_order_user" ON "Order"("userId");
CREATE INDEX "idx_order_status" ON "Order"("status");
CREATE INDEX "idx_orderitem_order" ON "OrderItem"("orderId");
CREATE INDEX "idx_orderitem_product" ON "OrderItem"("productId");

-- Insert admin user (password: admin123)
INSERT INTO "User" ("id", "email", "name", "password", "isAdmin", "createdAt", "updatedAt") VALUES
('admin-user-id', 'admin@chococelia.com', 'Admin User', '\\$2a\\$10\\$YCdxWzHXN0TjDPHnXZ5LHeGvL.MJ3YXqxJXqC8QZwXxqx8YXqxJXq', true, NOW(), NOW());

-- Insert categories
INSERT INTO "Category" ("id", "name", "nameAr", "createdAt", "updatedAt") VALUES
`;

  // Add categories
  for (const category of data.categories) {
    const nameAr = category.nameAr || category.name;
    sql += `('${category.id}', '${category.name}', '${nameAr}', NOW(), NOW()),\n`;
  }
  
  sql = sql.slice(0, -2) + ';\n\n'; // Remove last comma and add semicolon

  // Add products
  sql += `-- Insert products
`;
  
  for (const product of data.products) {
    const name = product.name.replace(/'/g, "''");
    const nameAr = (product.nameAr || product.name).replace(/'/g, "''");
    const description = (product.description || '').replace(/'/g, "''");
    const descriptionAr = (product.descriptionAr || product.description || '').replace(/'/g, "''");
    const image = product.image.replace(/'/g, "''");
    const categoryId = product.categoryId || product.category?.id || 'unknown';

    sql += `INSERT INTO "Product" ("id", "name", "nameAr", "description", "descriptionAr", "price", "image", "categoryId", "isAvailable", "createdAt", "updatedAt") VALUES
('${product.id}', '${name}', '${nameAr}', '${description}', '${descriptionAr}', ${product.price}, '${image}', '${categoryId}', true, NOW(), NOW());
`;
  }

  sql += `
-- Insert default site settings
INSERT INTO "SiteSettings" ("id", "logoUrl", "contactEmail", "contactPhone", "createdAt", "updatedAt") VALUES
('default-settings', '/logo.png', 'contact@chococelia.com', '+20 123 456 7890', NOW(), NOW());
`;

  // Save SQL file
  const sqlPath = path.join(__dirname, '..', 'scripts', 'seed-neon-generated.sql');
  fs.writeFileSync(sqlPath, sql);

  console.log(`✅ SQL script generated: ${path.basename(sqlPath)}`);
  console.log(`\n📌 Next steps:`);
  console.log(`1. Copy the SQL from: scripts/seed-neon-generated.sql`);
  console.log(`2. Paste into Neon SQL Editor`);
  console.log(`3. Click Execute`);
  console.log(`4. Refresh your website to see the updated images!`);
}

generateProductImages().catch(console.error);
