import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/auth';
import { prisma } from '@/app/lib/db';

// Initialize default settings in database if they don't exist
async function ensureSettings() {
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

// In-memory settings for non-DB fields (Hero, Story, Features, etc.)
let extraSettings = {
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

export async function GET() {
  try {
    const dbSettings = await ensureSettings();
    
    // Merge database settings with extra settings
    return NextResponse.json({
      ...extraSettings,
      phone: dbSettings.phone,
      facebook: dbSettings.facebook || 'https://www.facebook.com/profile.php?id=61582630209700',
      instagram: dbSettings.instagram || 'https://www.instagram.com/chococelia2025/',
      deliveryFeeBeniSuef: dbSettings.deliveryFeeBeniSuef,
      deliveryFeeEastNile: dbSettings.deliveryFeeEastNile,
    });
  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Update database fields
    const dbUpdates: any = {};
    if (body.phone !== undefined) dbUpdates.phone = body.phone;
    if (body.facebook !== undefined) dbUpdates.facebook = body.facebook;
    if (body.instagram !== undefined) dbUpdates.instagram = body.instagram;
    if (body.deliveryFeeBeniSuef !== undefined) {
      dbUpdates.deliveryFeeBeniSuef = parseFloat(body.deliveryFeeBeniSuef);
    }
    if (body.deliveryFeeEastNile !== undefined) {
      dbUpdates.deliveryFeeEastNile = parseFloat(body.deliveryFeeEastNile);
    }

    // Update database if there are DB field changes
    let dbSettings;
    if (Object.keys(dbUpdates).length > 0) {
      const existingSettings = await ensureSettings();
      dbSettings = await prisma.siteSettings.update({
        where: { id: existingSettings.id },
        data: dbUpdates,
      });
    } else {
      dbSettings = await ensureSettings();
    }
    
    // Update in-memory extra settings
    extraSettings = { ...extraSettings, ...body };
    
    // Return merged settings
    return NextResponse.json({
      ...extraSettings,
      phone: dbSettings.phone,
      facebook: dbSettings.facebook,
      instagram: dbSettings.instagram,
      deliveryFeeBeniSuef: dbSettings.deliveryFeeBeniSuef,
      deliveryFeeEastNile: dbSettings.deliveryFeeEastNile,
    });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
