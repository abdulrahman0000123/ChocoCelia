import { prisma } from '@/app/lib/db';
import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/auth';
import { restoreStoredProductImage, toPublicProduct } from '@/app/lib/productImages';
import { validateImageValue } from '@/app/lib/validation';

// GET single product
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(toPublicProduct(product));
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT update product
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    if (image !== undefined && !validateImageValue(image, true)) {
      return NextResponse.json({ error: 'Invalid product image.' }, { status: 400 });
    }
    if (images !== undefined && (!Array.isArray(images) || images.length > 12 ||
        images.some((value: unknown) => !validateImageValue(value, true)) ||
        images.reduce((total: number, value: string) => total + value.length, 0) +
          (typeof image === 'string' ? image.length : 0) > 20 * 1024 * 1024)) {
      return NextResponse.json({ error: 'Product images are invalid or exceed the allowed size.' }, { status: 400 });
    }
    if (price !== undefined && (!Number.isFinite(Number(price)) || Number(price) < 0)) {
      return NextResponse.json({ error: 'Invalid price value.' }, { status: 400 });
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Validate category if provided
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      });

      if (!category) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        );
      }
    }

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: name || existingProduct.name,
        nameAr: nameAr !== undefined ? nameAr : existingProduct.nameAr,
        description: description || existingProduct.description,
        descriptionAr: descriptionAr !== undefined ? descriptionAr : existingProduct.descriptionAr,
        price: price ? parseFloat(price) : existingProduct.price,
        image: typeof image === 'string' ? restoreStoredProductImage(image, existingProduct) : existingProduct.image,
        images: images !== undefined && Array.isArray(images)
          ? images.map((value: string) => restoreStoredProductImage(value, existingProduct))
          : existingProduct.images,
        categoryId: categoryId || existingProduct.categoryId,
        isAvailable: isAvailable !== undefined ? isAvailable : existingProduct.isAvailable,
        tags: tags !== undefined ? tags : existingProduct.tags,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(toPublicProduct(product));
  } catch (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        OrderItems: true
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Delete related order items first
    if (product.OrderItems && product.OrderItems.length > 0) {
      await prisma.orderItem.deleteMany({
        where: { productId: id }
      });
    }

    // Delete product
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: unknown) {
    console.error('Failed to delete product:', error);
    
    // Handle foreign key constraint error
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Cannot delete product. It is linked to existing orders.' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
