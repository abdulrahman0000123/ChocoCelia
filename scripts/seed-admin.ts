import { prisma } from '../app/lib/db';

async function main() {
  console.log('Seeding admin user...');
  try {
    const admin = await prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        password: 'admin123',
      },
    });
    console.log('Admin user created:', admin);
    
    // Also seed categories while we're at it
    const categories = ['Dark', 'Milk', 'White', 'Boxes', 'Mixes'];
    for (const cat of categories) {
      await prisma.category.upsert({
        where: { name: cat },
        update: {},
        create: { name: cat },
      });
    }
    console.log('Categories seeded');
    
  } catch (e) {
    console.error('Error seeding:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
