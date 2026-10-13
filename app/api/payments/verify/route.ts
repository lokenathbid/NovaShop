import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-utils';
import { verifyAndCapturePayment } from '@/lib/payments';

/**
 * POST /api/payments/verify
 * Verifies Razorpay payment signature server-side using constant-time comparison,
 * and idempotently updates the order to paid.
 */
export async function POST(request: Request) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to verify payment.' },
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
      razorpaySignature,
    } = body;

    // Check required fields
    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        {
          error:
            'Missing required payment verification parameters (orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature).',
        },
        { status: 400 }
      );
    }

    const result = await verifyAndCapturePayment({
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      userId: authUser.id,
    });

    return NextResponse.json(
      {
        success: true,
        message: result.alreadyProcessed
          ? 'Payment has already been verified and processed.'
          : 'Payment verified and captured successfully.',
        order: result.order,
        alreadyProcessed: result.alreadyProcessed,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Payment verification failed:', error);
    const message = error?.message || 'Payment verification failed.';
    const statusCode =
      message.includes('signature') || message.includes('cancelled')
        ? 400
        : message.includes('permission')
        ? 403
        : message.includes('not found')
        ? 404
        : 500;

    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
