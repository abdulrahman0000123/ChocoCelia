import { prisma } from './db';

export interface Product {
  id: string;
  name: string;
  nameAr: string | null;
  description: string;
  descriptionAr: string | null;
  price: number;
  image: string;
  categoryId: string;
  isAvailable: boolean;
  tags: string | null;
  createdAt: Date;
  updatedAt: Date;
  category?: Category;
}

export interface Category {
  id: string;
  name: string;
  nameAr: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const extraSettings = {
  email: 'hello@choco-celia.com',
  address: '123 Chocolate Lane',
  city: 'Sweet City, SC 12345',
  workingHours: 'Mon-Fri 9am-6pm',
  twitter: '',
  logo: '',
  // Our Story Section
  ourStoryTitle: 'Our Story',
  ourStorySubtitle: 'Crafting moments of joy, one chocolate at a time.',
  ourStoryBeginningTitle: 'The Beginning',
  ourStoryBeginning: 'Founded with a passion for the art of chocolatiering, CHOCO-CELIA started as a small kitchen experiment. Our founder, driven by a love for pure, high-quality ingredients, sought to create chocolates that were not only delicious but also visually stunning.',
  ourStoryPhilosophyTitle: 'Our Philosophy',
  ourStoryPhilosophy: 'We believe in the power of handmade. Every piece of chocolate that leaves our workshop is crafted by hand, ensuring the perfect temper, snap, and shine. We source our cocoa beans from sustainable farms and pair them with the finest local ingredients to create unique flavor profiles.',
  // Hero Section
  heroTitle: 'ChocoCelia',
  heroHighlight: 'Your Daily Dose Of Happiness',
  heroSubtitle: 'Experience the finest handmade chocolates, crafted with passion and premium ingredients.',
  heroSlides: [
    'https://cdn.pixabay.com/photo/2016/04/06/19/05/chocolate-1312524_960_720.jpg',
    'https://cdn.pixabay.com/photo/2019/09/06/07/59/chocolate-4455840_960_720.jpg',
    'https://cdn.pixabay.com/photo/2020/12/04/19/24/dessert-5804153_960_720.jpg',
  ] as string[],
  // Feature Cards
  featureCard1Icon: '🌿',
  featureCard1Title: 'Premium Ingredients',
  featureCard1Description: 'Only the finest cocoa and fresh ingredients.',
  featureCard2Icon: '🖐️',
  featureCard2Title: 'Handmade with Love',
  featureCard2Description: 'Crafted in small batches for perfection.',
  featureCard3Icon: '✨',
  featureCard3Title: 'Unique Flavors',
  featureCard3Description: 'Innovative combinations that delight.',
};

export async function ensureSettings() {
  let settings = await prisma.siteSettings.findFirst();
  
  if (!settings) {
    settings = await prisma.siteSettings.create({
      data: {
        phone: '+1 (555) 123-4567',
        deliveryFeeBeniSuef: 20,
        deliveryFeeEastNile: 40,
      },
    });
  }
  
  return settings;
}

export async function getSettings() {
  const dbSettings = await ensureSettings();
  return {
    ...extraSettings,
    phone: dbSettings.phone,
    facebook: dbSettings.facebook || 'https://www.facebook.com/profile.php?id=61582630209700',
    instagram: dbSettings.instagram || 'https://www.instagram.com/chococelia2025/',
    deliveryFeeBeniSuef: dbSettings.deliveryFeeBeniSuef ?? 20,
    deliveryFeeEastNile: dbSettings.deliveryFeeEastNile ?? 40,
    instaPayLink: dbSettings.instaPayLink || '',
    cashWalletNumber: dbSettings.cashWalletNumber || '',
  };
}

export async function getProducts(where: any = {}) {
  try {
    return await prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function getProduct(id: string) {
  try {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }
}

export async function getCategories() {
  try {
    return await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}
