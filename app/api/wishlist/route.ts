import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import {
  getUserWishlistProducts,
  addProductToWishlist,
  removeProductFromWishlist,
  clearUserWishlist,
  syncGuestWishlistItems,
} from '@/lib/wishlist';

export async function GET() {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to access your wishlist.' },
        { status: 401 }
      );
    }

    const items = await getUserWishlistProducts(authUser.id);
    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    console.error('Failed to get wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve wishlist.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to save items to your wishlist.' },
        { status: 401 }
      );
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body.' }, { status: 400 });
    }

    // Support batch sync for guest migration
    if (body.productIds && Array.isArray(body.productIds)) {
      const items = await syncGuestWishlistItems(authUser.id, body.productIds);
      return NextResponse.json({ success: true, items }, { status: 200 });
    }

    const { productId } = body;
    if (!productId || typeof productId !== 'string') {
      return NextResponse.json(
        { error: 'A valid productId string is required.' },
        { status: 400 }
      );
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    const result = await addProductToWishlist(authUser.id, productId);

    return NextResponse.json(
      {
        success: true,
        created: result.created,
        product: result.product,
      },
      { status: result.created ? 201 : 200 }
    );
  } catch (error: any) {
    console.error('Failed to add to wishlist:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update wishlist.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    let productId = searchParams.get('productId');

    if (!productId) {
      try {
        const body = await request.json();
        if (body && body.productId) {
          productId = body.productId;
        }
      } catch {
        // Body is optional if clearing all or param supplied
      }
    }

    if (productId) {
      await removeProductFromWishlist(authUser.id, productId);
      return NextResponse.json({ success: true, productId }, { status: 200 });
    }

    // If no productId, clear user's entire wishlist
    const count = await clearUserWishlist(authUser.id);
    return NextResponse.json(
      { success: true, clearedCount: count, message: 'Wishlist cleared.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to remove from wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to remove from wishlist.' },
      { status: 500 }
    );
  }
}
