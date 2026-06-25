import { prisma } from '@/app/lib/db';
import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/auth';
import { validateProductInput } from '@/app/lib/validation';

// GET all products
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    const where = categoryId ? { categoryId } : {};

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST create new product
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
    const {
      name,
      nameAr,
      description,
      descriptionAr,
      price,
      image,
      images,
      categoryId,
      isAvailable,
      tags
    } = body;

    // Convert price to number before validation
    const parsedPrice = parseFloat(price);
    
    // Check if price is a valid number
    if (isNaN(parsedPrice)) {
      return NextResponse.json(
        { error: 'Invalid price value' },
        { status: 400 }
      );
    }
    
    // Validate input
    try {
      validateProductInput({
        ...body,
        price: parsedPrice
      });
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Validate category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        nameAr: nameAr || null,
        description,
        descriptionAr: descriptionAr || null,
        price: parsedPrice,
        image,
        images: Array.isArray(images) ? images : [],
        categoryId,
        isAvailable: isAvailable !== undefined ? isAvailable : true,
        tags: tags || null,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Failed to create product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
