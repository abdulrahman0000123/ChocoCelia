import { prisma } from '@/app/lib/db';
import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/auth';

// GET reviews for a product (public) or all reviews (admin)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const all = searchParams.get('all') === 'true'; // For admin to view unapproved too

    if (all) {
      // Check admin session
      const session = await getSession();
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const reviews = await prisma.review.findMany({
        include: {
          product: {
            select: {
              name: true,
              nameAr: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(reviews);
    }

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: {
        productId,
        approved: true, // Only show approved reviews to public
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

// POST create a review (publicly submitted, starts as unapproved)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, rating, text, authorName, authorCity, imageUrl } = body;

    // Validate inputs
    if (!productId || !rating || !text || !authorName || !authorCity) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const parsedRating = parseInt(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json({ error: 'Rating must be an integer between 1 and 5' }, { status: 400 });
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Create the review. By default, it requires approval.
    // For a smoother demo, let's auto-approve for now or keep approved: false as requested.
    // The implementation plan says: "approved Boolean @default(false)"
    const review = await prisma.review.create({
      data: {
        productId,
        rating: parsedRating,
        text,
        authorName,
        authorCity,
        imageUrl: imageUrl || null,
        approved: false, // Must be approved by admin
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Failed to create review:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}

// PUT approve/disapprove a review (admin only)
export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, approved } = body;

    if (!id || approved === undefined) {
      return NextResponse.json({ error: 'id and approved fields are required' }, { status: 400 });
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: { approved: !!approved },
    });

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error('Failed to update review:', error);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}

// DELETE a review (admin only)
export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    await prisma.review.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete review:', error);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}
