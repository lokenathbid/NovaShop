import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-utils';
import { initiateOrderPayment } from '@/lib/payments';
import { isRazorpayConfigured } from '@/lib/razorpay';

/**
 * POST /api/payments/create
 * Initiates or retrieves an authoritative Razorpay order for a pending NovaShop order.
 */
export async function POST(request: Request) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to initiate payment.' },
        { status: 401 }
      );
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request payload.' }, { status: 400 });
    }

    const { orderId } = body;
    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ error: 'Valid Order ID is required.' }, { status: 400 });
    }

    if (!isRazorpayConfigured()) {
      return NextResponse.json(
        {
          error:
            'Razorpay payment gateway is not configured. Please configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment variables to enable payments.',
        },
        { status: 400 }
      );
    }

    const result = await initiateOrderPayment({
      orderId,
      userId: authUser.id,
    });

    return NextResponse.json(
      {
        success: true,
        orderId: result.orderId,
        razorpayOrderId: result.razorpayOrderId,
        amount: result.amount,
        currency: result.currency,
        keyId: result.keyId,
        order: result.order,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Failed to initiate payment:', error);
    const message = error?.message || 'Failed to initiate payment.';
    const statusCode =
      message.includes('permission') || message.includes('Unauthorized')
        ? 403
        : message.includes('not found')
        ? 404
        : message.includes('cancelled') || message.includes('already been paid')
        ? 400
        : 500;

    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
