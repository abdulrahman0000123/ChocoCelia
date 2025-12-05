import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/auth';

let settings = {
  phone: '+1 (555) 123-4567',
  email: 'hello@choco-celia.com',
  address: '123 Chocolate Lane',
  city: 'Sweet City, SC 12345',
  workingHours: 'Mon-Fri 9am-6pm',
  facebook: 'https://facebook.com/chococelia',
  instagram: 'https://instagram.com/chococelia',
  twitter: 'https://twitter.com/chococelia',
  logo: '',
  // Our Story Section
  ourStoryTitle: 'Our Story',
  ourStorySubtitle: 'Crafting moments of joy, one chocolate at a time.',
  ourStoryBeginningTitle: 'The Beginning',
  ourStoryBeginning: 'Founded with a passion for the art of chocolatiering, CHOCO-CELIA started as a small kitchen experiment. Our founder, driven by a love for pure, high-quality ingredients, sought to create chocolates that were not only delicious but also visually stunning.',
  ourStoryPhilosophyTitle: 'Our Philosophy',
  ourStoryPhilosophy: 'We believe in the power of handmade. Every piece of chocolate that leaves our workshop is crafted by hand, ensuring the perfect temper, snap, and shine. We source our cocoa beans from sustainable farms and pair them with the finest local ingredients to create unique flavor profiles.',
  // Hero Section
  heroTitle: 'Where Every Bite',
  heroHighlight: 'Melts Your Heart',
  heroSubtitle: 'Experience the finest handmade chocolates, crafted with passion and premium ingredients.',
  heroSlides: [] as string[],
  // Feature Cards (Why Choose Us)
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
  return NextResponse.json(settings);
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
    
    // Validate required fields only if they are being changed
    const hasContactChanges = body.phone || body.email || body.address || body.city;
    if (hasContactChanges) {
      const phone = body.phone || settings.phone;
      const email = body.email || settings.email;
      const address = body.address || settings.address;
      const city = body.city || settings.city;
      
      if (!phone || !email || !address || !city) {
        return NextResponse.json(
          { error: 'Phone, Email, Address, and City are required' },
          { status: 400 }
        );
      }
    }
    
    settings = { ...settings, ...body };
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
