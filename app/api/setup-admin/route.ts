import { prisma } from '@/app/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

async function createTablesIfNotExist() {
  const prismaRaw = new PrismaClient();
  
  try {
    // Create tables using raw SQL for PostgreSQL
    await prismaRaw.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "username" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `);

    await prismaRaw.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Category" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL UNIQUE,
        "nameAr" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `);

    await prismaRaw.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Product" (
        "id" TEXT NOT NULL PRIMARY KEY,
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
    `);

    await prismaRaw.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Order" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "customerName" TEXT NOT NULL,
        "customerPhone" TEXT NOT NULL,
        "customerEmail" TEXT,
        "customerAddress" TEXT NOT NULL,
        "preferredContact" TEXT NOT NULL DEFAULT 'whatsapp',
        "specialRequests" TEXT,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "total" DOUBLE PRECISION NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `);

    await prismaRaw.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "OrderItem" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "orderId" TEXT NOT NULL,
        "productId" TEXT NOT NULL,
        "quantity" INTEGER NOT NULL,
        "price" DOUBLE PRECISION NOT NULL,
        CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );
    `);

    await prismaRaw.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "SiteSettings" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "phone" TEXT,
        "facebook" TEXT,
        "instagram" TEXT,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `);

    // Create indexes
    await prismaRaw.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Product_categoryId_idx" ON "Product"("categoryId");`);
    await prismaRaw.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem"("orderId");`);
    await prismaRaw.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "OrderItem_productId_idx" ON "OrderItem"("productId");`);

  } catch (error: any) {
    console.log('Table creation error (may already exist):', error.message);
  } finally {
    await prismaRaw.$disconnect();
  }
}

export async function GET() {
  try {
    console.log('Setting up database and admin user...');
    
    // First, create tables if they don't exist
    await createTablesIfNotExist();
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Generate a unique ID
    const id = `admin_${Date.now()}`;
    
    // Try upsert, if fails try raw insert
    let admin;
    try {
      admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {
          password: hashedPassword,
        },
        create: {
          username: 'admin',
          password: hashedPassword,
        },
      });
    } catch (e) {
      // Fallback: raw insert
      await prisma.$executeRawUnsafe(`
        INSERT INTO "User" ("id", "username", "password", "createdAt", "updatedAt")
        VALUES ($1, 'admin', $2, NOW(), NOW())
        ON CONFLICT ("username") DO UPDATE SET "password" = $2, "updatedAt" = NOW()
      `, id, hashedPassword);
      admin = { id, username: 'admin' };
    }
    
    // Create categories
    const categories = ['Dark', 'Milk', 'White', 'Boxes', 'Mixes'];
    for (const cat of categories) {
      try {
        await prisma.category.upsert({
          where: { name: cat },
          update: {},
          create: { name: cat },
        });
      } catch (e) {
        const catId = `cat_${cat}_${Date.now()}`;
        await prisma.$executeRawUnsafe(`
          INSERT INTO "Category" ("id", "name", "createdAt", "updatedAt")
          VALUES ($1, $2, NOW(), NOW())
          ON CONFLICT ("name") DO NOTHING
        `, catId, cat);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Database setup complete!',
      admin: { id: admin.id, username: admin.username },
      categories: categories
    });
  } catch (error: any) {
    console.error('Setup error:', error);
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
