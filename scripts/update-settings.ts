import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Update site settings
  const settings = await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {
      facebook: 'https://www.facebook.com/profile.php?id=61582630209700',
      instagram: 'https://www.instagram.com/chococelia2025/',
    },
    create: {
      phone: '+20',
      facebook: 'https://www.facebook.com/profile.php?id=61582630209700',
      instagram: 'https://www.instagram.com/chococelia2025/',
    },
  });

  console.log('✅ Settings updated:', settings);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('✅ Database updated successfully!');
  })
  .catch(async (e) => {
    console.error('❌ Error updating database:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
