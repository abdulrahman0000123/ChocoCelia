import { prisma } from '@/app/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Seeding admin user via API...');
    
    const admin = await prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        password: 'admin123',
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

    return NextResponse.json({ success: true, admin });
  } catch (error: any) {
    console.error('Seeding error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
