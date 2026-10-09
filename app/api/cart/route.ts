import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { getUserCartWithDetails } from '@/lib/cart';

export async function GET() {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to access your cart.' },
        { status: 401 }
      );
    }

    const cart = await getUserCartWithDetails(authUser.id);
    return NextResponse.json({ cart }, { status: 200 });
  } catch (error) {
    console.error('Failed to get cart:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve cart.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to add items to your cart.' },
        { status: 401 }
      );
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body.' }, { status: 400 });
    }

    const { productId, quantity = 1, selectedVariants } = body;

    if (!productId || typeof productId !== 'string') {
      return NextResponse.json({ error: 'A valid productId is required.' }, { status: 400 });
    }

    const parsedQuantity = parseInt(String(quantity), 10);
    if (isNaN(parsedQuantity) || parsedQuantity < 1) {
      return NextResponse.json(
        { error: 'Quantity must be a positive integer greater than 0.' },
        { status: 400 }
      );
    }

    // Verify product exists in database
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    // Verify availability
    if (!product.inStock) {
      return NextResponse.json(
        { error: `"${product.name}" is currently out of stock.` },
        { status: 400 }
      );
    }

    // Verify variants availability if supplied
    if (selectedVariants && typeof selectedVariants === 'object') {
      for (const [type, value] of Object.entries(selectedVariants)) {
        const matchingVariant = product.variants.find(
          (v) => v.type === type && v.value === value
        );
        if (matchingVariant && !matchingVariant.inStock) {
          return NextResponse.json(
            { error: `The selected variant "${value}" is out of stock.` },
            { status: 400 }
          );
        }
      }
    }

    const variantString =
      selectedVariants && Object.keys(selectedVariants).length > 0
        ? Object.entries(selectedVariants)
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ')
        : null;

    // Get or create cart for user
    let cart = await prisma.cart.findUnique({
      where: { userId: authUser.id },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: authUser.id },
      });
    }

    // Check if the item (matching productId and variant) already exists
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: product.id,
        variant: variantString,
      },
    });

    const currentQty = existingItem ? existingItem.quantity : 0;
    const requestedTotal = currentQty + parsedQuantity;

    // Verify stock count
    if (product.stockCount !== null && requestedTotal > product.stockCount) {
      const remainingStock = Math.max(0, product.stockCount - currentQty);
      return NextResponse.json(
        {
          error: `Cannot add ${parsedQuantity} items. Only ${remainingStock} more available in stock (limit ${product.stockCount}).`,
          availableStock: product.stockCount,
          currentQuantity: currentQty,
        },
        { status: 400 }
      );
    }

    // Update or insert
    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: requestedTotal },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          quantity: parsedQuantity,
          variant: variantString,
          selectedVariants: selectedVariants || undefined,
        },
      });
    }

    // Return the updated cart
    const updatedCart = await getUserCartWithDetails(authUser.id);
    return NextResponse.json(
      {
        success: true,
        message: 'Product added to cart successfully.',
        cart: updatedCart,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to add product to cart:', error);
    return NextResponse.json(
      { error: 'Failed to add product to cart.' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: authUser.id },
    });

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    const updatedCart = await getUserCartWithDetails(authUser.id);
    return NextResponse.json(
      {
        success: true,
        message: 'Cart cleared successfully.',
        cart: updatedCart,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to clear cart:', error);
    return NextResponse.json(
      { error: 'Failed to clear cart.' },
      { status: 500 }
    );
  }
}
