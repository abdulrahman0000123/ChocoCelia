import { NextResponse } from 'next/server';

// Mock database
let products = [
  {
    id: '1',
    name: 'Dark Truffle Delight',
    nameAr: 'ترافل الشوكولاتة الداكنة',
    description: 'Rich dark chocolate with a smooth truffle center.',
    descriptionAr: 'شوكولاتة داكنة غنية مع مركز ترافل ناعم.',
    price: 24.99,
    category: 'Dark',
    image: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&q=80&w=800',
    isAvailable: true,
    categoryId: 'cat_1'
  },
  {
    id: '2',
    name: 'Milk Chocolate Hazelnuts',
    nameAr: 'شوكولاتة الحليب بالبندق',
    description: 'Creamy milk chocolate with roasted hazelnuts.',
    descriptionAr: 'شوكولاتة الحليب الكريمية مع البندق المحمص.',
    price: 18.50,
    category: 'Milk',
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&q=80&w=800',
    isAvailable: true,
    categoryId: 'cat_2'
  },
  {
    id: '3',
    name: 'White Raspberry Bliss',
    nameAr: 'شوكولاتة بيضاء بالتوت',
    description: 'Sweet white chocolate infused with tart raspberry pieces.',
    descriptionAr: 'شوكولاتة بيضاء حلوة مع قطع التوت اللاذعة.',
    price: 22.00,
    category: 'White',
    image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&q=80&w=800',
    isAvailable: true,
    categoryId: 'cat_3'
  }
];

export async function GET() {
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newProduct = {
      id: Math.random().toString(36).substr(2, 9),
      ...body,
      price: Number(body.price),
      categoryId: 'mock_cat_id' // Mock category ID
    };
    products.unshift(newProduct);
    return NextResponse.json(newProduct);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
