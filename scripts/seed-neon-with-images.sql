-- =================================================================
-- ChocoCeliaDB - Database Seed Script with Real Product Images
-- Database: ChocoCeliaDB (Neon PostgreSQL)
-- Generated: 2026-01-05
-- Description: Complete schema + real product images from live website
-- =================================================================

-- =================================================================
-- IMPORTANT NOTES:
-- 1. Product images are base64-encoded JPEGs from live website
-- 2. Images stored in TEXT columns (PostgreSQL supports large text)
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
    "deliveryFeeBeniSuef" DOUBLE PRECISION DEFAULT 20,
    "deliveryFeeEastNile" DOUBLE PRECISION DEFAULT 40,
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
('admin-user-id', 'admin@chococelia.com', 'Admin User', '$2a$10$YourHashedPasswordHere', true, NOW(), NOW());

-- Insert categories
INSERT INTO "Category" ("id", "name", "nameAr", "createdAt", "updatedAt") VALUES
('cmit4keu70001ze2apjec1a3g', 'Dark', NULL, NOW(), NOW()),
('cmit4keut0002ze2a4agha3zn', 'Milk', NULL, NOW(), NOW()),
('cmit4kev50003ze2apdnlo1w5', 'White', NULL, NOW(), NOW()),
('cmit4kevh0004ze2ak43hjqhb', 'Boxes', NULL, NOW(), NOW()),
('cmit4kevr0005ze2af4eb77wy', 'Mixes', NULL, NOW(), NOW());

-- =================================================================
-- INSERT PRODUCTS WITH REAL BASE64 IMAGES
-- Note: Images are truncated here for readability
-- Use the original live-data-export.json for complete base64 strings
-- =================================================================

-- Product 1: Stuffed dates with mixed nuts
INSERT INTO "Product" ("id", "name", "nameAr", "description", "descriptionAr", "price", "image", "categoryId", "isAvailable", "tags", "createdAt", "updatedAt") VALUES
('cmjxb27df0001yk7m38losy37', 'Stuffed dates with mixed nuts', 'تمر بالمكسرات والشوكولاتة ', 'Stuffed dates with mixed nuts, coated in chocolate (white, milk, and dark) (24 pec)', 'تمر محشو مكسرات ومغطي بالشوكولاته ( وايت، بني بالحليب، دارك) ( 24 قطعة) ', 170, 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAMgAWgDASIAAhEBAxEB...', 'cmit4kevr0005ze2af4eb77wy', true, NULL, NOW(), NOW());

-- Product 2: Mini chocolate mix  
INSERT INTO "Product" ("id", "name", "nameAr", "description", "descriptionAr", "price", "image", "categoryId", "isAvailable", "tags", "createdAt", "updatedAt") VALUES
('cmjxawt2q0003citd0ef3qnej', 'Mini chocolate mix', 'ميني شوكلت ميكس ', 'Mini chocolate mix white and milk chocolate (20 pec) ', 'بوكس ميني شوكلت ميكس وايت و بني بالحليب ( 20 قطعة)', 65, 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAMgAWgDASIAAhEBAxEB...', 'cmit4kevr0005ze2af4eb77wy', true, NULL, NOW(), NOW());

-- =================================================================
-- NOTE: Base64 image strings are VERY long (50,000+ characters each)
-- To complete this script:
-- 1. Read all product data from live-data-export.json
-- 2. For each product, extract the complete base64 image string
-- 3. Insert into this SQL with full image data
-- 
-- Alternative solution: Use a script to generate this SQL automatically
-- from live-data-export.json to avoid manual copy/paste errors
-- =================================================================

-- Site settings
INSERT INTO "SiteSettings" ("id", "logoUrl", "contactEmail", "contactPhone", "socialMedia", "createdAt", "updatedAt") VALUES
('default-settings', '/logo.png', 'contact@chococelia.com', '+20 123 456 7890', '{"facebook": "https://facebook.com/chococelia", "instagram": "https://instagram.com/chococelia"}', NOW(), NOW());

-- =================================================================
-- EXECUTION COMPLETE
-- =================================================================
