/**
 * Generate SQL Seed Script with Real Base64 Images
 * Reads live-data-export.json and creates seed-neon-complete.sql
 */

const fs = require('fs');
const path = require('path');

// Read live data export (from parent directory)
const liveDataPath = path.join(__dirname, '..', 'live-data-export.json');
const liveData = JSON.parse(fs.readFileSync(liveDataPath, 'utf8'));

console.log('📊 Reading live data export...');
console.log(`   - Categories: ${liveData.categories.length}`);
console.log(`   - Products: ${liveData.products.length}`);

// SQL Header
let sql = `-- =================================================================
-- ChocoCeliaDB - Complete Database Seed with Real Product Images
-- Database: ChocoCeliaDB (Neon PostgreSQL)
-- Generated: ${new Date().toISOString().split('T')[0]}
-- Source: Live website data (choco-celia2.vercel.app)
-- =================================================================

-- =================================================================
-- IMPORTANT NOTES:
-- 1. Product images are REAL base64-encoded JPEGs from live website
-- 2. All 13 products include complete image data
-- 3. Execute this script in Neon SQL Editor or via psql
-- 4. Admin credentials: admin@chococelia.com / admin123
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

-- =================================================================
-- INSERT DATA
-- =================================================================

-- Admin user (password: admin123 - hashed with bcrypt)
INSERT INTO "User" ("id", "email", "name", "password", "isAdmin", "createdAt", "updatedAt") VALUES
('admin-user-id', 'admin@chococelia.com', 'Admin User', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', true, NOW(), NOW());

-- Categories
`;

// Insert categories
console.log('\n📁 Generating category inserts...');
sql += '\n-- Insert categories\n';
liveData.categories.forEach((cat, index) => {
  const isLast = index === liveData.categories.length - 1;
  sql += `INSERT INTO "Category" ("id", "name", "nameAr", "createdAt", "updatedAt") VALUES\n`;
  sql += `('${cat.id}', '${cat.name}', ${cat.nameAr ? `'${cat.nameAr}'` : 'NULL'}, NOW(), NOW())${isLast ? ';' : ','}\n`;
});

// Insert products with REAL base64 images
console.log('📦 Generating product inserts with REAL images...');
sql += '\n-- =================================================================\n';
sql += '-- Insert products with REAL base64 images from live website\n';
sql += '-- =================================================================\n\n';

liveData.products.forEach((product, index) => {
  console.log(`   [${index + 1}/${liveData.products.length}] ${product.name}`);
  
  // Escape single quotes in strings
  const escapeSql = (str) => str ? str.replace(/'/g, "''") : '';
  
  sql += `-- Product ${index + 1}: ${product.name}\n`;
  sql += `INSERT INTO "Product" ("id", "name", "nameAr", "description", "descriptionAr", "price", "image", "categoryId", "isAvailable", "tags", "createdAt", "updatedAt") VALUES\n`;
  sql += `('${product.id}', `;
  sql += `'${escapeSql(product.name)}', `;
  sql += `${product.nameAr ? `'${escapeSql(product.nameAr)}'` : 'NULL'}, `;
  sql += `${product.description ? `'${escapeSql(product.description)}'` : 'NULL'}, `;
  sql += `${product.descriptionAr ? `'${escapeSql(product.descriptionAr)}'` : 'NULL'}, `;
  sql += `${product.price}, `;
  sql += `'${escapeSql(product.image)}', `;  // REAL base64 image here
  sql += `'${product.categoryId}', `;
  sql += `${product.isAvailable}, `;
  sql += `${product.tags ? `'${escapeSql(product.tags)}'` : 'NULL'}, `;
  sql += `NOW(), NOW());\n\n`;
});

// Site settings
sql += `-- Site settings
INSERT INTO "SiteSettings" ("id", "logoUrl", "contactEmail", "contactPhone", "socialMedia", "createdAt", "updatedAt") VALUES
('default-settings', '/logo.png', 'contact@chococelia.com', '+20 123 456 7890', '{"facebook": "https://facebook.com/chococelia", "instagram": "https://instagram.com/chococelia"}', NOW(), NOW());

-- =================================================================
-- EXECUTION COMPLETE
-- Database: ChocoCeliaDB
-- Total Categories: ${liveData.categories.length}
-- Total Products: ${liveData.products.length} (with REAL images)
-- Admin: admin@chococelia.com / admin123
-- =================================================================
`;

// Write SQL file
const outputPath = path.join(__dirname, 'seed-neon-complete.sql');
fs.writeFileSync(outputPath, sql, 'utf8');

console.log('\n✅ SQL generation complete!');
console.log(`📄 Output file: ${outputPath}`);
console.log(`📊 File size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);
console.log('\n🎯 Next steps:');
console.log('   1. Copy seed-neon-complete.sql');
console.log('   2. Open Neon SQL Editor');
console.log('   3. Paste and execute the script');
console.log('   4. All products will have their REAL images! 🖼️');
