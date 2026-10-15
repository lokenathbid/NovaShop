import Razorpay from 'razorpay';
import crypto from 'crypto';

/**
 * Razorpay Environment Configuration
 */
export function getRazorpayKeyId(): string {
  return process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
}

export function getRazorpayKeySecret(): string {
  return process.env.RAZORPAY_KEY_SECRET || '';
}

export function getRazorpayWebhookSecret(): string {
  return process.env.RAZORPAY_WEBHOOK_SECRET || '';
}

export function isRazorpayConfigured(): boolean {
  const key = getRazorpayKeyId();
  const secret = getRazorpayKeySecret();
  return Boolean(
    key &&
      secret &&
      !key.includes('placeholder') &&
      !secret.includes('placeholder') &&
      key.startsWith('rzp_')
  );
}

let razorpayClientInstance: Razorpay | null = null;

/**
 * Returns a configured Razorpay SDK instance.
 */
export function getRazorpayInstance(): Razorpay {
  const key_id = getRazorpayKeyId();
  const key_secret = getRazorpayKeySecret();

  if (!key_id || !key_secret) {
    throw new Error(
      'Razorpay credentials are not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment variables.'
    );
  }

  if (!razorpayClientInstance) {
    razorpayClientInstance = new Razorpay({
      key_id,
      key_secret,
    });
  }

  return razorpayClientInstance;
}

/**
 * Verifies Razorpay payment signature using HMAC SHA-256 with constant-time equality check.
 * Generated string format: `${order_id}|${payment_id}`
 */
export function verifyRazorpaySignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const secret = getRazorpayKeySecret();
  if (!secret || !orderId || !paymentId || !signature) {
    return false;
  }

  try {
    const payload = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature, 'utf8');
    const receivedBuf = Buffer.from(signature, 'utf8');

    if (expectedBuf.length !== receivedBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuf, receivedBuf);
  } catch (error) {
    console.error('Razorpay signature verification error:', error);
    return false;
  }
}

/**
 * Verifies Razorpay Webhook signature using HMAC SHA-256 with constant-time equality check.
 * The raw body buffer / string is signed with the webhook secret.
 */
export function verifyWebhookSignature({
  rawBody,
  signature,
}: {
  rawBody: string;
  signature: string;
}): boolean {
  const secret = getRazorpayWebhookSecret();
  if (!secret || !rawBody || !signature) {
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature, 'utf8');
    const receivedBuf = Buffer.from(signature, 'utf8');

    if (expectedBuf.length !== receivedBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuf, receivedBuf);
  } catch (error) {
    console.error('Razorpay webhook signature verification error:', error);
    return false;
  }
}

export interface CreateGatewayOrderParams {
  orderId: string;
  amount: number; // in INR
  currency?: string;
  notes?: Record<string, string>;
}

/**
 * Creates an authoritative Razorpay payment order.
 * Amount is converted to smallest currency unit (paise for INR).
 */
export async function createRazorpayOrder({
  orderId,
  amount,
  currency = 'INR',
  notes = {},
}: CreateGatewayOrderParams) {
  const amountInPaise = Math.round(amount * 100);

  if (!isRazorpayConfigured()) {
    throw new Error(
      'Razorpay payment credentials are not configured. Please set valid RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment variables to enable payments.'
    );
  }

  const rzp = getRazorpayInstance();
  const rzpOrder = await rzp.orders.create({
    amount: amountInPaise,
    currency,
    receipt: orderId.substring(0, 40),
    notes: {
      novashopOrderId: orderId,
      ...notes,
    },
  });

  return rzpOrder;
}
