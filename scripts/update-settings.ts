import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Update site settings with Egypt and Beni-Suef
  const settings = await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: {
      address: 'Egypt',
      city: 'Beni-Suef',
    },
    create: {
      id: 'default',
      siteName: 'CHOCO-CELIA',
      tagline: 'Premium Handmade Chocolates',
      phone: '',
      email: '',
      address: 'Egypt',
      city: 'Beni-Suef',
      workingHours: '',
      facebook: 'https://www.facebook.com/profile.php?id=61582630209700',
      instagram: 'https://www.instagram.com/chococelia2025/',
      twitter: '',
      heroSlide1Image: '',
      heroSlide1Title: 'Welcome to ChocoCelia',
      heroSlide1Subtitle: 'Discover Premium Chocolates',
      heroSlide2Image: '',
      heroSlide2Title: 'Handmade with Love',
      heroSlide2Subtitle: 'Every bite tells a story',
      heroSlide3Image: '',
      heroSlide3Title: 'Unique Flavors',
      heroSlide3Subtitle: 'Experience chocolate like never before',
      featureCard1Title: 'Premium Ingredients',
      featureCard1Description: 'We use only the finest cocoa and ingredients',
      featureCard2Title: 'Handmade with Love',
      featureCard2Description: 'Each chocolate is carefully crafted by hand',
      featureCard3Title: 'Unique Flavors',
      featureCard3Description: 'Discover our exclusive flavor combinations',
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
