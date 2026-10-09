import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { getUserCartWithDetails } from '@/lib/cart';

export async function PATCH(
  request: Request,
  props: { params: Promise<{ itemId: string }> }
) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const { itemId } = await props.params;
    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required.' }, { status: 400 });
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body.' }, { status: 400 });
    }

    const { quantity } = body;
    const parsedQuantity = parseInt(String(quantity), 10);

    if (isNaN(parsedQuantity) || parsedQuantity < 1) {
      return NextResponse.json(
        { error: 'Quantity must be a positive integer greater than 0.' },
        { status: 400 }
      );
    }

    // Verify item belongs to authenticated user's cart
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: { userId: authUser.id },
      },
      include: {
        product: true,
      },
    });

    if (!cartItem) {
      return NextResponse.json({ error: 'Cart item not found.' }, { status: 404 });
    }

    // Revalidate product availability
    if (!cartItem.product.inStock) {
      return NextResponse.json(
        { error: `"${cartItem.product.name}" is currently out of stock.` },
        { status: 400 }
      );
    }

    // Revalidate stock count
    if (cartItem.product.stockCount !== null && parsedQuantity > cartItem.product.stockCount) {
      return NextResponse.json(
        {
          error: `Cannot update quantity to ${parsedQuantity}. Only ${cartItem.product.stockCount} available in stock.`,
          availableStock: cartItem.product.stockCount,
        },
        { status: 400 }
      );
    }

    // Update quantity
    await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity: parsedQuantity },
    });

    const updatedCart = await getUserCartWithDetails(authUser.id);
    return NextResponse.json(
      {
        success: true,
        message: 'Item quantity updated successfully.',
        cart: updatedCart,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to update cart item quantity:', error);
    return NextResponse.json(
      { error: 'Failed to update cart item quantity.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  props: { params: Promise<{ itemId: string }> }
) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const { itemId } = await props.params;
    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required.' }, { status: 400 });
    }

    // Verify item belongs to authenticated user's cart
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: { userId: authUser.id },
      },
    });

    if (!cartItem) {
      return NextResponse.json({ error: 'Cart item not found.' }, { status: 404 });
    }

    await prisma.cartItem.delete({
      where: { id: cartItem.id },
    });

    const updatedCart = await getUserCartWithDetails(authUser.id);
    return NextResponse.json(
      {
        success: true,
        message: 'Item removed from cart successfully.',
        cart: updatedCart,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to remove cart item:', error);
    return NextResponse.json(
      { error: 'Failed to remove cart item.' },
      { status: 500 }
    );
  }
}
