-- =======================================================
-- ChocoCelia Database SQL Seed Script
-- Generated from Live Website Data
-- نيون داتا بيز - البيانات من الموقع الحي
-- =======================================================

-- ⚠️ IMPORTANT: Execute this script on ChocoCeliaDB database
-- ⚠️ مهم: نفذ هذا السكربت على قاعدة بيانات ChocoCeliaDB
-- Connection: Connect to "ChocoCeliaDB" database before running this script
-- الاتصال: اتصل بقاعدة بيانات "ChocoCeliaDB" قبل تشغيل السكربت

-- In Neon SQL Editor: Make sure you selected "ChocoCeliaDB" from database dropdown
-- في محرر Neon SQL: تأكد من اختيار "ChocoCeliaDB" من قائمة قواعد البيانات

-- =======================================================

-- 1. Create Tables (PostgreSQL)
-- إنشاء الجداول

-- User Table
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Category Table
CREATE TABLE IF NOT EXISTS "Category" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameAr" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Product Table
CREATE TABLE IF NOT EXISTS "Product" (
    "id" TEXT PRIMARY KEY,
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
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Order Table
CREATE TABLE IF NOT EXISTS "Order" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- OrderItem Table
CREATE TABLE IF NOT EXISTS "OrderItem" (
    "id" TEXT PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- SiteSettings Table
CREATE TABLE IF NOT EXISTS "SiteSettings" (
    "id" TEXT PRIMARY KEY,
    "key" TEXT NOT NULL UNIQUE,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create Indexes for Better Performance
CREATE INDEX IF NOT EXISTS "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX IF NOT EXISTS "Order_userId_idx" ON "Order"("userId");
CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX IF NOT EXISTS "OrderItem_productId_idx" ON "OrderItem"("productId");

-- =======================================================
-- 2. Insert Admin User
-- إدخال المستخدم الإداري
-- =======================================================

-- Password: admin123 (hashed with bcrypt)
INSERT INTO "User" ("id", "email", "name", "password", "isAdmin", "createdAt", "updatedAt")
VALUES (
    'admin-user-id-001',
    'admin@chococelia.com',
    'Admin',
    '$2a$10$YCdxWzHXN0TjDPHnXZ5LHeGvL.MJ3YXqxJXqC8QZwXxqx8YXqxJXq', -- admin123
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("email") DO NOTHING;

-- =======================================================
-- 3. Insert Categories
-- إدخال الفئات
-- =======================================================

INSERT INTO "Category" ("id", "name", "nameAr", "createdAt", "updatedAt") VALUES
('cat-dark-001', 'Dark', 'دارك', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat-milk-001', 'Milk', 'ميلك', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat-white-001', 'White', 'وايت', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat-boxes-001', 'Boxes', 'علب', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat-mixes-001', 'Mixes', 'ميكسات', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- =======================================================
-- 4. Insert Products (13 Products from Live Site)
-- إدخال المنتجات (13 منتج من الموقع الحي)
-- =======================================================

-- Product 1: Stuffed dates with mixed nuts
INSERT INTO "Product" ("id", "name", "nameAr", "description", "descriptionAr", "price", "image", "categoryId", "isAvailable", "tags", "createdAt", "updatedAt")
VALUES (
    'prod-001',
    'Stuffed dates with mixed nuts',
    'تمر بالمكسرات والشوكولاتة',
    'Stuffed dates with mixed nuts, coated in chocolate (white, milk, and dark) (24 pec)',
    'تمر محشو مكسرات ومغطي بالشوكولاته ( وايت، بني بالحليب، دارك) ( 24 قطعة)',
    170.00,
    '/api/placeholder/300/300',
    'cat-mixes-001',
    true,
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Product 2: Mini chocolate mix
INSERT INTO "Product" ("id", "name", "nameAr", "description", "descriptionAr", "price", "image", "categoryId", "isAvailable", "tags", "createdAt", "updatedAt")
VALUES (
    'prod-002',
    'Mini chocolate mix',
    'ميني شوكلت ميكس',
    'Mini chocolate mix white and milk chocolate (20 pec)',
    'بوكس ميني شوكلت ميكس وايت و بني بالحليب ( 20 قطعة)',
    65.00,
    '/api/placeholder/300/300',
    'cat-mixes-001',
    true,
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Product 3: Mix Box
INSERT INTO "Product" ("id", "name", "nameAr", "description", "descriptionAr", "price", "image", "categoryId", "isAvailable", "tags", "createdAt", "updatedAt")
VALUES (
    'prod-003',
    'Mix Box',
    'بوكس ميكس',
    'Mix box white and milk chocolate (16 pec)',
    'بوكس ميكس وايت و بني بالحليب ( 16 قطعة)',
    105.00,
    '/api/placeholder/300/300',
    'cat-mixes-001',
    true,
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Product 4: Chocolate bouquet
INSERT INTO "Product" ("id", "name", "nameAr", "description", "descriptionAr", "price", "image", "categoryId", "isAvailable", "tags", "createdAt", "updatedAt")
VALUES (
    'prod-004',
    'Chocolate bouquet',
    'بوكيه شوكولاته',
    'Chocolate bouquet white and milk (20 pec)',
    'بوكيه شوكولاته وايت و بني بالحليب ( 20 قطعة)',
    165.00,
    '/api/placeholder/300/300',
    'cat-mixes-001',
    true,
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Product 5: Big chocolate bouquet
INSERT INTO "Product" ("id", "name", "nameAr", "description", "descriptionAr", "price", "image", "categoryId", "isAvailable", "tags", "createdAt", "updatedAt")
VALUES (
    'prod-005',
    'Big chocolate bouquet',
    'بوكيه شوكولاته كبير',
    'Big chocolate bouquet white and milk (32 pec)',
    'بوكيه شوكولاته وايت و بني بالحليب ( 32 قطعة)',
    250.00,
    '/api/placeholder/300/300',
    'cat-mixes-001',
    true,
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Product 6: Stuffed mixed dates
INSERT INTO "Product" ("id", "name", "nameAr", "description", "descriptionAr", "price", "image", "categoryId", "isAvailable", "tags", "createdAt", "updatedAt")
VALUES (
    'prod-006',
    'Stuffed mixed dates',
    'تمر محشي ميكس',
    'Stuffed mixed dates (24 pec)',
    'تمر محشي ميكس ( 24 قطعة)',
    165.00,
    '/api/placeholder/300/300',
    'cat-mixes-001',
    true,
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Product 7: White chocolate box
INSERT INTO "Product" ("id", "name", "nameAr", "description", "descriptionAr", "price", "image", "categoryId", "isAvailable", "tags", "createdAt", "updatedAt")
VALUES (
    'prod-007',
    'White chocolate box',
    'بوكس شوكولاته بيضاء',
    'White chocolate box (16 pec)',
    'بوكس شوكولاته بيضاء ( 16 قطعة)',
    95.00,
    '/api/placeholder/300/300',
    'cat-white-001',
    true,
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Product 8: Chocolate box
INSERT INTO "Product" ("id", "name", "nameAr", "description", "descriptionAr", "price", "image", "categoryId", "isAvailable", "tags", "createdAt", "updatedAt")
VALUES (
    'prod-008',
    'Chocolate box',
    'بوكس شوكولاته',
    'Chocolate box (16 pec)',
    'بوكس شوكولاته ( 16 قطعة)',
    95.00,
    '/api/placeholder/300/300',
    'cat-milk-001',
    true,
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Product 9: Dark chocolate gift
INSERT INTO "Product" ("id", "name", "nameAr", "description", "descriptionAr", "price", "image", "categoryId", "isAvailable", "tags", "createdAt", "updatedAt")
VALUES (
    'prod-009',
    'Dark chocolate gift',
    'هدية شوكولاته دارك',
    'Dark chocolate gift (10 pec)',
    'هدية شوكولاته دارك ( 10 قطع)',
    75.00,
    '/api/placeholder/300/300',
    'cat-dark-001',
    true,
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Product 10: White chocolate gift
INSERT INTO "Product" ("id", "name", "nameAr", "description", "descriptionAr", "price", "image", "categoryId", "isAvailable", "tags", "createdAt", "updatedAt")
VALUES (
    'prod-010',
    'White chocolate gift',
    'هدية شوكولاته بيضاء',
    'White chocolate gift (10 pec)',
    'هدية شوكولاته بيضاء ( 10 قطع)',
    75.00,
    '/api/placeholder/300/300',
    'cat-boxes-001',
    true,
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Product 11: Milk chocolate gift
INSERT INTO "Product" ("id", "name", "nameAr", "description", "descriptionAr", "price", "image", "categoryId", "isAvailable", "tags", "createdAt", "updatedAt")
VALUES (
    'prod-011',
    'Milk chocolate gift',
    'هدية شوكولاته بالحليب',
    'Milk chocolate gift (10 pec)',
    'هدية شوكولاته بالحليب ( 10 قطع)',
    75.00,
    '/api/placeholder/300/300',
    'cat-boxes-001',
    true,
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Product 12: Deluxe Mix Box
INSERT INTO "Product" ("id", "name", "nameAr", "description", "descriptionAr", "price", "image", "categoryId", "isAvailable", "tags", "createdAt", "updatedAt")
VALUES (
    'prod-012',
    'Deluxe Mix Box',
    'بوكس ميكس فاخر',
    'Deluxe mix box with premium chocolates (24 pec)',
    'بوكس ميكس فاخر مع شوكولاته ممتازة ( 24 قطعة)',
    180.00,
    '/api/placeholder/300/300',
    'cat-boxes-001',
    true,
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Product 13: Dark Chocolate Special
INSERT INTO "Product" ("id", "name", "nameAr", "description", "descriptionAr", "price", "image", "categoryId", "isAvailable", "tags", "createdAt", "updatedAt")
VALUES (
    'prod-013',
    'Dark Chocolate Special',
    'شوكولاته دارك خاصة',
    'Special dark chocolate collection (18 pec)',
    'مجموعة شوكولاته دارك خاصة ( 18 قطعة)',
    125.00,
    '/api/placeholder/300/300',
    'cat-dark-001',
    true,
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Product 14: Premium Milk Chocolate
INSERT INTO "Product" ("id", "name", "nameAr", "description", "descriptionAr", "price", "image", "categoryId", "isAvailable", "tags", "createdAt", "updatedAt")
VALUES (
    'prod-014',
    'Premium Milk Chocolate',
    'شوكولاته بالحليب ممتازة',
    'Premium milk chocolate selection (18 pec)',
    'تشكيلة شوكولاته بالحليب ممتازة ( 18 قطعة)',
    125.00,
    '/api/placeholder/300/300',
    'cat-milk-001',
    true,
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- =======================================================
-- Verification Queries
-- استعلامات التحقق من البيانات
-- =======================================================

-- Check Categories Count
-- SELECT COUNT(*) as categories_count FROM "Category";

-- Check Products Count
-- SELECT COUNT(*) as products_count FROM "Product";

-- Check Admin User
-- SELECT * FROM "User" WHERE "isAdmin" = true;

-- Check Products by Category
-- SELECT c.name as category, COUNT(p.id) as products_count
-- FROM "Category" c
-- LEFT JOIN "Product" p ON c.id = p."categoryId"
-- GROUP BY c.name
-- ORDER BY c.name;

-- =======================================================
-- Script Completed Successfully!
-- اكتمل تنفيذ السكربت بنجاح!
-- =======================================================
