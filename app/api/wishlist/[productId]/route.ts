import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-utils';
import { removeProductFromWishlist } from '@/lib/wishlist';

export async function DELETE(
  _request: Request,
  props: { params: Promise<{ productId: string }> }
) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const { productId } = await props.params;
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required.' },
        { status: 400 }
      );
    }

    const result = await removeProductFromWishlist(authUser.id, productId);

    return NextResponse.json(
      { success: true, deleted: result.deleted, productId },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to remove item from wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to remove product from wishlist.' },
      { status: 500 }
    );
  }
}
