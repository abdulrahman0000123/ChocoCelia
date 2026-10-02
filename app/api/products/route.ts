import { prisma } from '@/app/lib/db';
import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/auth';
import { validateProductInput } from '@/app/lib/validation';
import { toPublicProduct } from '@/app/lib/productImages';
import { productSeoInput, validateProductSlug } from '@/app/lib/product-seo';
import { saveSeo } from '@/app/lib/seo';
import { localSeo } from '@/app/lib/seo-shared';
import { requireAdmin, invalidateSeo, apiError } from '@/app/lib/seo-admin';

// GET all products
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    const admin = await getSession();
    const where = { ...(categoryId ? { categoryId } : {}), ...(!admin ? { published: true } : {}) };

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(products.map(toPublicProduct));
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
    const session = await requireAdmin(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const seoInput = productSeoInput(body);
    await validateProductSlug(seoInput.fields.slug);
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
    } catch (error: unknown) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Invalid product details.' },
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
        ...seoInput.fields,
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

    await saveSeo('product', product.id, seoInput.seo || localSeo({titleAr: nameAr || name, titleEn: name, bodyAr: descriptionAr || description, bodyEn: description, image: toPublicProduct(product).image.replace(/&v=\d+/, '')}), session.user!.id);
    invalidateSeo();
    return NextResponse.json(toPublicProduct(product), { status: 201 });
  } catch (error) {
    if (error instanceof Error && /^(Invalid |Slug )/.test(error.message)) return apiError(error);
    console.error('Failed to create product');
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
