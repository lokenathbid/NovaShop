import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-utils';
import { recordPaymentFailure } from '@/lib/payments';

/**
 * POST /api/payments/fail
 * Records payment failure or modal dismissal while preserving reserved inventory.
 */
export async function POST(request: Request) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
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
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      errorMessage,
      metadata,
    } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required.' }, { status: 400 });
    }

    const updatedOrder = await recordPaymentFailure({
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      errorMessage,
      metadata,
      userId: authUser.id,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Payment failure recorded. Order is pending retry or cancellation.',
        order: updatedOrder,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Failed to log payment failure:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to record payment failure.' },
      { status: 500 }
    );
  }
}
