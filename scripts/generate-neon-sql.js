// سكربت لإنشاء ملف SQL كامل متوافق مع Neon PostgreSQL
const fs = require('fs');
const path = require('path');

const sqlPath = path.join(__dirname, 'seed-neon-complete.sql');
const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

// استخراج Categories
function extractCategories() {
  const categories = [];
  const catMatches = sqlContent.matchAll(/'(cmit[^']+)',\s*'([^']+)',\s*(NULL|'[^']*'),\s*NOW\(\),\s*NOW\(\)/g);
  
  for (const match of catMatches) {
    categories.push({
      id: match[1],
      name: match[2],
      nameAr: match[3] === 'NULL' ? null : match[3].replace(/'/g, '')
    });
  }
  return categories;
}

// استخراج Products مع الصور الكاملة
function extractProducts() {
  const products = [];
  const productInserts = sqlContent.split('INSERT INTO "Product"');
  
  for (let i = 1; i < productInserts.length; i++) {
    const insert = productInserts[i];
    
    const valuesMatch = insert.match(/VALUES\s*\(/);
    if (!valuesMatch) continue;
    
    const valuesStart = insert.indexOf('VALUES');
    const openParen = insert.indexOf('(', valuesStart);
    
    let depth = 0;
    let closeParen = -1;
    for (let j = openParen; j < insert.length; j++) {
      if (insert[j] === '(') depth++;
      else if (insert[j] === ')') {
        depth--;
        if (depth === 0) {
          closeParen = j;
          break;
        }
      }
    }
    
    if (closeParen === -1) continue;
    
    const valuesContent = insert.substring(openParen + 1, closeParen);
    
    const values = [];
    let currentValue = '';
    let inQuote = false;
    
    for (let j = 0; j < valuesContent.length; j++) {
      const char = valuesContent[j];
      
      if (char === "'" && !inQuote) { inQuote = true; continue; }
      if (char === "'" && inQuote) {
        if (valuesContent[j + 1] === "'") { currentValue += "'"; j++; continue; }
        inQuote = false; continue;
      }
      if (char === ',' && !inQuote) { values.push(currentValue.trim()); currentValue = ''; continue; }
      currentValue += char;
    }
    values.push(currentValue.trim());
    
    if (values.length >= 9) {
      products.push({
        id: values[0],
        name: values[1],
        nameAr: values[2] === 'NULL' ? null : values[2],
        description: values[3],
        descriptionAr: values[4] === 'NULL' ? null : values[4],
        price: parseFloat(values[5]),
        image: values[6],
        categoryId: values[7],
        isAvailable: values[8] === 'true'
      });
    }
  }
  return products;
}

function escapeSQL(str) {
  if (str === null || str === undefined) return 'NULL';
  // Escape single quotes for PostgreSQL
  return "'" + str.replace(/'/g, "''") + "'";
}

const categories = extractCategories();
const products = extractProducts();

console.log(`📁 Found ${categories.length} categories`);
console.log(`🍫 Found ${products.length} products`);

// Generate Neon-compatible SQL
let sql = `-- =============================================
-- ChocoCelia Complete Database Seed for Neon PostgreSQL
-- Generated: ${new Date().toISOString()}
-- Products: ${products.length} with real base64 images
-- Categories: ${categories.length}
-- =============================================

-- Disable foreign key checks temporarily
SET session_replication_role = 'replica';

-- =============================================
-- DROP EXISTING TABLES
-- =============================================
DROP TABLE IF EXISTS "OrderItem" CASCADE;
DROP TABLE IF EXISTS "Order" CASCADE;
DROP TABLE IF EXISTS "Product" CASCADE;
DROP TABLE IF EXISTS "Category" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "SiteSettings" CASCADE;

-- =============================================
-- CREATE TABLES
-- =============================================

-- User Table
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- Category Table
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameAr" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- Product Table
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameAr" TEXT,
    "description" TEXT NOT NULL,
    "descriptionAr" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "image" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "tags" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- Order Table
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT,
    "customerAddress" TEXT NOT NULL,
    "preferredContact" TEXT NOT NULL DEFAULT 'whatsapp',
    "specialRequests" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "total" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- OrderItem Table
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- Re-enable foreign key checks
SET session_replication_role = 'origin';

-- Add Foreign Keys
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" 
    FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" 
    FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" 
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- =============================================
-- INSERT DATA
-- =============================================

-- Admin User (password: admin123)
INSERT INTO "User" ("id", "username", "password", "createdAt", "updatedAt") 
VALUES ('admin-user-id', 'admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Categories
INSERT INTO "Category" ("id", "name", "nameAr", "createdAt", "updatedAt") VALUES
`;

// Add categories
const catValues = categories.map(c => 
  `(${escapeSQL(c.id)}, ${escapeSQL(c.name)}, ${escapeSQL(c.nameAr)}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
);
sql += catValues.join(',\n') + ';\n\n';

// Add products one by one (safer for large base64 images)
sql += '-- =============================================\n';
sql += '-- PRODUCTS WITH REAL BASE64 IMAGES\n';
sql += '-- =============================================\n\n';

products.forEach((p, index) => {
  const hasImage = p.image.startsWith('data:image');
  sql += `-- Product ${index + 1}/${products.length}: ${p.name} ${hasImage ? '(with real image)' : '(placeholder)'}\n`;
  sql += `INSERT INTO "Product" ("id", "name", "nameAr", "description", "descriptionAr", "price", "image", "categoryId", "isAvailable", "createdAt", "updatedAt") VALUES\n`;
  sql += `(${escapeSQL(p.id)}, ${escapeSQL(p.name)}, ${escapeSQL(p.nameAr)}, ${escapeSQL(p.description)}, ${escapeSQL(p.descriptionAr)}, ${p.price}, ${escapeSQL(p.image)}, ${escapeSQL(p.categoryId)}, ${p.isAvailable}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);\n\n`;
});

sql += `-- =============================================
-- SEED COMPLETE
-- =============================================
-- Summary:
--   ✅ ${products.length} products with real base64 images
--   ✅ ${categories.length} categories
--   ✅ Admin user: username=admin, password=admin123
-- =============================================
`;

// Write file
const outputPath = path.join(__dirname, 'seed-neon-final.sql');
fs.writeFileSync(outputPath, sql);

console.log(`\n✅ Generated Neon SQL file: seed-neon-final.sql`);
console.log(`📊 File size: ${(sql.length / 1024 / 1024).toFixed(2)} MB`);
console.log(`🍫 Products: ${products.length}`);
console.log(`📁 Categories: ${categories.length}`);

// Verify images
const withImages = products.filter(p => p.image.startsWith('data:image')).length;
console.log(`📸 Products with real images: ${withImages}/${products.length}`);

if (withImages === products.length) {
  console.log('\n🎉 All products have real base64 images!');
} else {
  console.log(`\n⚠️ ${products.length - withImages} products have placeholder images`);
}

console.log('\n📌 To run on Neon:');
console.log('   1. Go to Neon Console → SQL Editor');
console.log('   2. Copy and paste the content of seed-neon-final.sql');
console.log('   3. Execute the query');
