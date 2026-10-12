import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-utils';
import { createOrderFromCart, getUserOrders } from '@/lib/orders';

/**
 * GET /api/orders
 * Returns all orders belonging to the authenticated user.
 */
export async function GET() {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to view your orders.' },
        { status: 401 }
      );
    }

    const orders = await getUserOrders(authUser.id);
    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch user orders:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve orders.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders
 * Places an order from the authenticated user's active cart.
 * Trusted prices and totals are computed strictly on the server.
 */
export async function POST(request: Request) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to complete checkout.' },
        { status: 401 }
      );
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request payload.' }, { status: 400 });
    }

    const {
      addressId,
      shippingAddress,
      deliveryMethod = 'standard',
      paymentMethod = 'card',
      idempotencyKey,
    } = body;

    // Validate delivery method
    if (!['standard', 'express', 'overnight'].includes(deliveryMethod)) {
      return NextResponse.json(
        { error: 'Invalid delivery method selected.' },
        { status: 400 }
      );
    }

    // Validate payment method
    if (!['card', 'upi', 'cod'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Invalid payment method selected.' },
        { status: 400 }
      );
    }

    const result = await createOrderFromCart({
      userId: authUser.id,
      addressId,
      shippingAddress,
      deliveryMethod,
      paymentMethod,
      idempotencyKey,
    });

    return NextResponse.json(
      {
        success: true,
        message: result.isDuplicate
          ? 'Order already submitted.'
          : 'Order placed successfully.',
        order: result.order,
        isDuplicate: result.isDuplicate,
      },
      { status: result.isDuplicate ? 200 : 201 }
    );
  } catch (error: any) {
    console.error('Failed to create order:', error);
    const message = error?.message || 'Failed to place order.';
    const statusCode =
      message.includes('stock') ||
      message.includes('empty') ||
      message.includes('address') ||
      message.includes('required')
        ? 400
        : 500;

    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
