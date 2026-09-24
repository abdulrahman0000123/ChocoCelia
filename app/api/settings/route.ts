import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/auth';
import { prisma } from '@/app/lib/db';
import type { Prisma } from '@prisma/client';
import { validateUrl } from '@/app/lib/validation';

// Initialize default settings in database if they don't exist
async function ensureSettings() {
  let settings = await prisma.siteSettings.findFirst();
  
  if (!settings) {
    settings = await prisma.siteSettings.create({
      data: {
        phone: null,
        deliveryFeeBeniSuef: 20,
        deliveryFeeEastNile: 40,
      },
    });
  }
  
  return settings;
}

// In-memory settings for non-DB fields (Hero, Story, Features, etc.)
let extraSettings = {
  email: '',
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
      deliveryFeeBeniSuef: dbSettings.deliveryFeeBeniSuef ?? 20,
      deliveryFeeEastNile: dbSettings.deliveryFeeEastNile ?? 40,
      instaPayLink: dbSettings.instaPayLink || '',
      cashWalletNumber: dbSettings.cashWalletNumber || '',
    });
  } catch (error) {
    console.error('Settings fetch error:', error);
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return NextResponse.json({ 
      error: 'Failed to fetch settings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
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

    const body: Record<string, unknown> = await request.json();
    
    // Update database fields
    const dbUpdates: Prisma.SiteSettingsUpdateInput = {};
    if (body.phone !== undefined) {
      if (body.phone !== null && typeof body.phone !== 'string') return NextResponse.json({ error: 'Invalid phone number.' }, { status: 400 });
      dbUpdates.phone = body.phone;
    }
    for (const socialField of ['facebook', 'instagram'] as const) {
      const value = body[socialField];
      if (value !== undefined) {
        if (typeof value !== 'string' || (value !== '' && !validateUrl(value))) {
          return NextResponse.json({ error: `Invalid ${socialField} URL.` }, { status: 400 });
        }
        dbUpdates[socialField] = value || null;
      }
    }
    if (body.deliveryFeeBeniSuef !== undefined) {
      const fee = Number(body.deliveryFeeBeniSuef);
      if (!Number.isFinite(fee) || fee < 0) return NextResponse.json({ error: 'Invalid delivery fee.' }, { status: 400 });
      dbUpdates.deliveryFeeBeniSuef = fee;
    }
    if (body.deliveryFeeEastNile !== undefined) {
      const fee = Number(body.deliveryFeeEastNile);
      if (!Number.isFinite(fee) || fee < 0) return NextResponse.json({ error: 'Invalid delivery fee.' }, { status: 400 });
      dbUpdates.deliveryFeeEastNile = fee;
    }
    if (body.instaPayLink !== undefined) {
      if (typeof body.instaPayLink !== 'string' || (body.instaPayLink !== '' && !validateUrl(body.instaPayLink))) return NextResponse.json({ error: 'Invalid payment link.' }, { status: 400 });
      dbUpdates.instaPayLink = body.instaPayLink || null;
    }
    if (body.cashWalletNumber !== undefined) {
      if (typeof body.cashWalletNumber !== 'string' || body.cashWalletNumber.length > 40) return NextResponse.json({ error: 'Invalid wallet number.' }, { status: 400 });
      dbUpdates.cashWalletNumber = body.cashWalletNumber || null;
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
      deliveryFeeBeniSuef: dbSettings.deliveryFeeBeniSuef ?? 20,
      deliveryFeeEastNile: dbSettings.deliveryFeeEastNile ?? 40,
      instaPayLink: dbSettings.instaPayLink || '',
      cashWalletNumber: dbSettings.cashWalletNumber || '',
    });
  } catch (error) {
    console.error('Settings update error:', error);
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return NextResponse.json({ 
      error: 'Failed to update settings',
    }, { status: 500 });
  }
}
