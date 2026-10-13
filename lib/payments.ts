import { prisma } from '@/lib/prisma';
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
  getRazorpayKeyId,
} from '@/lib/razorpay';
import { formatOrderData, roundCurrency } from '@/lib/orders';
import type { Order } from '@/types';

export interface InitiatePaymentResult {
  orderId: string;
  razorpayOrderId: string;
  amount: number; // in paise
  currency: string;
  keyId: string;
  order: Order;
}

/**
 * Initiates or re-initiates a Razorpay payment for an existing, unpaid NovaShop order.
 */
export async function initiateOrderPayment({
  orderId,
  userId,
}: {
  orderId: string;
  userId: string;
}): Promise<InitiatePaymentResult> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, payments: true },
  });

  if (!order) {
    throw new Error('Order not found.');
  }

  if (order.userId !== userId) {
    throw new Error('You do not have permission to pay for this order.');
  }

  if (order.status === 'cancelled') {
    throw new Error('This order has been cancelled and cannot be paid.');
  }

  if (order.paymentStatus === 'paid') {
    throw new Error('This order has already been paid.');
  }

  // Create authoritative Razorpay order with server-verified amount
  const rzpOrder = await createRazorpayOrder({
    orderId: order.id,
    amount: order.total,
    currency: 'INR',
    notes: {
      userId: order.userId,
    },
  });

  // Record payment attempt in database within transaction
  await prisma.$transaction(async (tx) => {
    // Record payment log
    await tx.payment.create({
      data: {
        orderId: order.id,
        razorpayOrderId: rzpOrder.id,
        amount: order.total,
        currency: 'INR',
        status: 'created',
        idempotencyKey: `init_${order.id}_${rzpOrder.id}`,
        metadata: {
          created_at: new Date().toISOString(),
          attempt: order.payments.length + 1,
        },
      },
    });

    // Link current active gateway order to the order
    await tx.order.update({
      where: { id: order.id },
      data: {
        razorpayOrderId: rzpOrder.id,
        paymentStatus: 'pending',
      },
    });
  });

  const refreshedOrder = await prisma.order.findUnique({
    where: { id: order.id },
    include: { items: true, payments: true },
  });

  return {
    orderId: order.id,
    razorpayOrderId: rzpOrder.id,
    amount: Number(rzpOrder.amount),
    currency: rzpOrder.currency,
    keyId: getRazorpayKeyId(),
    order: formatOrderData(refreshedOrder!),
  };
}

export interface VerifyPaymentParams {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  userId?: string;
}

/**
 * Verifies Razorpay payment signature and idempotently marks order as paid.
 */
export async function verifyAndCapturePayment({
  orderId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  userId,
}: VerifyPaymentParams): Promise<{ order: Order; alreadyProcessed: boolean }> {
  // 1. Signature Verification with constant-time equality check
  const isValidSignature = verifyRazorpaySignature({
    orderId: razorpayOrderId,
    paymentId: razorpayPaymentId,
    signature: razorpaySignature,
  });

  if (!isValidSignature) {
    throw new Error('Invalid payment signature. Verification failed.');
  }

  // 2. Atomic Database Update with Idempotency Protection
  const result = await prisma.$transaction(async (tx) => {
    const existingOrder = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true, payments: true },
    });

    if (!existingOrder) {
      throw new Error('Order not found.');
    }

    if (userId && existingOrder.userId !== userId) {
      throw new Error('You do not have permission to verify this order.');
    }

    if (existingOrder.status === 'cancelled') {
      throw new Error('This order has been cancelled; cannot accept payment.');
    }

    // Idempotent: If already paid with this or prior verification, return existing order
    if (existingOrder.paymentStatus === 'paid') {
      return { order: existingOrder, alreadyProcessed: true };
    }

    // 3. Upsert or update payment log
    const existingPayment = await tx.payment.findFirst({
      where: {
        orderId: existingOrder.id,
        razorpayOrderId,
      },
    });

    if (existingPayment) {
      await tx.payment.update({
        where: { id: existingPayment.id },
        data: {
          razorpayPaymentId,
          razorpaySignature,
          status: 'captured',
          errorMessage: null,
          metadata: {
            verifiedAt: new Date().toISOString(),
          },
        },
      });
    } else {
      await tx.payment.create({
        data: {
          orderId: existingOrder.id,
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature,
          amount: existingOrder.total,
          currency: 'INR',
          status: 'captured',
          metadata: {
            verifiedAt: new Date().toISOString(),
          },
        },
      });
    }

    // 4. Update order payment status strictly on verified success
    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'paid',
        status: existingOrder.status === 'pending' ? 'confirmed' : existingOrder.status,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      },
      include: { items: true, payments: true },
    });

    return { order: updatedOrder, alreadyProcessed: false };
  });

  return {
    order: formatOrderData(result.order),
    alreadyProcessed: result.alreadyProcessed,
  };
}

export interface RecordFailureParams {
  orderId: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  errorMessage?: string;
  metadata?: any;
  userId?: string;
}

/**
 * Records a failed or abandoned payment attempt without compromising reserved inventory.
 */
export async function recordPaymentFailure({
  orderId,
  razorpayOrderId,
  razorpayPaymentId,
  errorMessage = 'Payment failed or was cancelled by user.',
  metadata,
  userId,
}: RecordFailureParams): Promise<Order> {
  const result = await prisma.$transaction(async (tx) => {
    const existingOrder = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true, payments: true },
    });

    if (!existingOrder) {
      throw new Error('Order not found.');
    }

    if (userId && existingOrder.userId !== userId) {
      throw new Error('You do not have permission to update this order.');
    }

    // If order is already paid or cancelled, do not alter status
    if (existingOrder.paymentStatus === 'paid' || existingOrder.status === 'cancelled') {
      return existingOrder;
    }

    // Record failure in payment history
    if (razorpayOrderId) {
      const existingPayment = await tx.payment.findFirst({
        where: { orderId, razorpayOrderId },
      });

      if (existingPayment) {
        await tx.payment.update({
          where: { id: existingPayment.id },
          data: {
            razorpayPaymentId: razorpayPaymentId || existingPayment.razorpayPaymentId,
            status: 'failed',
            errorMessage,
            metadata: {
              ...(typeof existingPayment.metadata === 'object' ? existingPayment.metadata : {}),
              failureReportedAt: new Date().toISOString(),
              details: metadata || null,
            },
          },
        });
      } else {
        await tx.payment.create({
          data: {
            orderId,
            razorpayOrderId,
            razorpayPaymentId,
            amount: existingOrder.total,
            currency: 'INR',
            status: 'failed',
            errorMessage,
            metadata: {
              failureReportedAt: new Date().toISOString(),
              details: metadata || null,
            },
          },
        });
      }
    }

    // Update order payment status to failed (allows retry from UI)
    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'failed',
      },
      include: { items: true, payments: true },
    });

    return updatedOrder;
  });

  return formatOrderData(result);
}

/**
 * Webhook event payload processing (Idempotent)
 */
export async function processRazorpayWebhookEvent(event: string, payload: any) {
  switch (event) {
    case 'payment.captured': {
      const paymentEntity = payload?.payment?.entity;
      if (!paymentEntity) return { handled: false, error: 'Missing payment entity' };

      const gatewayOrderId = paymentEntity.order_id;
      const gatewayPaymentId = paymentEntity.id;
      const novashopOrderId = paymentEntity.notes?.novashopOrderId || paymentEntity.notes?.orderId;

      // Find order by order ID or gateway order ID
      const order = await prisma.order.findFirst({
        where: {
          OR: [
            ...(novashopOrderId ? [{ id: novashopOrderId }] : []),
            ...(gatewayOrderId ? [{ razorpayOrderId: gatewayOrderId }] : []),
          ],
        },
        include: { items: true, payments: true },
      });

      if (!order) {
        return { handled: false, error: `Order not found for payment ${gatewayPaymentId}` };
      }

      // Currency and amount verification: prevent underpayment fraud
      const expectedAmountInPaise = Math.round(order.total * 100);
      if (paymentEntity.amount !== expectedAmountInPaise) {
        console.error(
          `Webhook amount mismatch for order ${order.id}: expected ${expectedAmountInPaise}, received ${paymentEntity.amount}`
        );
        return { handled: false, error: 'Amount mismatch detected.' };
      }

      if (order.status === 'cancelled') {
        console.warn(`Payment captured for cancelled order ${order.id}; requires manual review/refund.`);
        return { handled: true, warning: 'Order already cancelled' };
      }

      // Idempotent: already paid?
      if (order.paymentStatus === 'paid') {
        return { handled: true, alreadyProcessed: true };
      }

      // Non-sensitive payment metadata extraction (no card numbers, CVVs, pins)
      const nonSensitiveMetadata = {
        method: paymentEntity.method,
        bank: paymentEntity.bank || null,
        wallet: paymentEntity.wallet || null,
        vpa: paymentEntity.vpa || null,
        email: paymentEntity.email || null,
        contact: paymentEntity.contact || null,
        capturedAt: new Date().toISOString(),
      };

      await prisma.$transaction(async (tx) => {
        // Find or create Payment record
        const paymentRecord = await tx.payment.findFirst({
          where: {
            OR: [
              { razorpayPaymentId: gatewayPaymentId },
              ...(gatewayOrderId ? [{ orderId: order.id, razorpayOrderId: gatewayOrderId }] : []),
            ],
          },
        });

        if (paymentRecord) {
          await tx.payment.update({
            where: { id: paymentRecord.id },
            data: {
              razorpayPaymentId: gatewayPaymentId,
              status: 'captured',
              method: paymentEntity.method || paymentRecord.method,
              metadata: nonSensitiveMetadata,
            },
          });
        } else {
          await tx.payment.create({
            data: {
              orderId: order.id,
              razorpayOrderId: gatewayOrderId || `rzp_order_wh_${Date.now()}`,
              razorpayPaymentId: gatewayPaymentId,
              amount: order.total,
              currency: 'INR',
              status: 'captured',
              method: paymentEntity.method,
              metadata: nonSensitiveMetadata,
            },
          });
        }

        // Update order status
        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'paid',
            status: order.status === 'pending' ? 'confirmed' : order.status,
            razorpayPaymentId: gatewayPaymentId,
            ...(gatewayOrderId ? { razorpayOrderId: gatewayOrderId } : {}),
          },
        });
      });

      return { handled: true, orderId: order.id, status: 'paid' };
    }

    case 'payment.failed': {
      const paymentEntity = payload?.payment?.entity;
      if (!paymentEntity) return { handled: false, error: 'Missing payment entity' };

      const gatewayOrderId = paymentEntity.order_id;
      const gatewayPaymentId = paymentEntity.id;
      const novashopOrderId = paymentEntity.notes?.novashopOrderId || paymentEntity.notes?.orderId;

      const order = await prisma.order.findFirst({
        where: {
          OR: [
            ...(novashopOrderId ? [{ id: novashopOrderId }] : []),
            ...(gatewayOrderId ? [{ razorpayOrderId: gatewayOrderId }] : []),
          ],
        },
      });

      if (!order) {
        return { handled: false, error: 'Order not found for failed payment' };
      }

      if (order.paymentStatus !== 'paid' && order.status !== 'cancelled') {
        await recordPaymentFailure({
          orderId: order.id,
          razorpayOrderId: gatewayOrderId,
          razorpayPaymentId: gatewayPaymentId,
          errorMessage: paymentEntity.error_description || 'Payment failed',
          metadata: {
            errorCode: paymentEntity.error_code || null,
            errorReason: paymentEntity.error_reason || null,
            errorSource: paymentEntity.error_source || null,
          },
        });
      }

      return { handled: true, orderId: order.id, status: 'failed' };
    }

    case 'order.paid': {
      const orderEntity = payload?.order?.entity;
      if (!orderEntity) return { handled: false, error: 'Missing order entity' };

      const gatewayOrderId = orderEntity.id;
      const novashopOrderId = orderEntity.notes?.novashopOrderId;

      const order = await prisma.order.findFirst({
        where: {
          OR: [
            ...(novashopOrderId ? [{ id: novashopOrderId }] : []),
            { razorpayOrderId: gatewayOrderId },
          ],
        },
      });

      if (order && order.paymentStatus !== 'paid' && order.status !== 'cancelled') {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'paid',
            status: order.status === 'pending' ? 'confirmed' : order.status,
          },
        });
      }

      return { handled: true, status: 'order.paid' };
    }

    case 'refund.processed': {
      const refundEntity = payload?.refund?.entity;
      const paymentId = refundEntity?.payment_id;

      if (paymentId) {
        const order = await prisma.order.findFirst({
          where: { razorpayPaymentId: paymentId },
        });

        if (order) {
          await prisma.$transaction([
            prisma.payment.updateMany({
              where: { razorpayPaymentId: paymentId },
              data: { status: 'refunded' },
            }),
            prisma.order.update({
              where: { id: order.id },
              data: { paymentStatus: 'refunded' },
            }),
          ]);
        }
      }

      return { handled: true, status: 'refund.processed' };
    }

    default:
      return { handled: true, status: `Ignored unhandled event: ${event}` };
  }
}
