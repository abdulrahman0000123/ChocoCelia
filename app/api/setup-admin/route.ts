import { prisma } from '@/app/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    console.log('Seeding admin user via API...');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.upsert({
      where: { username: 'admin' },
      update: {
        password: hashedPassword, // Update password with hashed version
      },
      create: {
        username: 'admin',
        password: hashedPassword,
      },
    });
    
    const categories = ['Dark', 'Milk', 'White', 'Boxes', 'Mixes'];
    for (const cat of categories) {
      await prisma.category.upsert({
        where: { name: cat },
        update: {},
        create: { name: cat },
      });
    }

    return NextResponse.json({ success: true, admin: { id: admin.id, username: admin.username } });
  } catch (error: any) {
    console.error('Seeding error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
