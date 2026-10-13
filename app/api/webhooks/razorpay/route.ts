import { NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/razorpay';
import { processRazorpayWebhookEvent } from '@/lib/payments';

/**
 * POST /api/webhooks/razorpay
 * Handles authoritative Razorpay webhook events with signature verification and idempotency.
 */
export async function POST(request: Request) {
  try {
    const signature = request.headers.get('x-razorpay-signature');
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing x-razorpay-signature header.' },
        { status: 400 }
      );
    }

    // Read the exact raw body string for HMAC-SHA256 signature calculation
    const rawBody = await request.text();

    const isValid = verifyWebhookSignature({
      rawBody,
      signature,
    });

    if (!isValid) {
      console.warn('Razorpay webhook signature verification failed.');
      return NextResponse.json(
        { error: 'Invalid webhook signature.' },
        { status: 400 }
      );
    }

    let parsedPayload: any;
    try {
      parsedPayload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload in webhook body.' },
        { status: 400 }
      );
    }

    const { event, payload } = parsedPayload;
    if (!event || !payload) {
      return NextResponse.json(
        { error: 'Event name or payload missing from webhook.' },
        { status: 400 }
      );
    }

    // Process event idempotently
    const processResult = await processRazorpayWebhookEvent(event, payload);

    return NextResponse.json(
      {
        received: true,
        event,
        result: processResult,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error handling Razorpay webhook:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal webhook processing error.' },
      { status: 500 }
    );
  }
}
