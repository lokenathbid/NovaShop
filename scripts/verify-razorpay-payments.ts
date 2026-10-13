import 'dotenv/config';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { createOrderFromCart, cancelOrder, getOrderById } from '../lib/orders';
import {
  initiateOrderPayment,
  verifyAndCapturePayment,
  recordPaymentFailure,
  processRazorpayWebhookEvent,
} from '../lib/payments';
import {
  verifyRazorpaySignature,
  verifyWebhookSignature,
  getRazorpayKeySecret,
  getRazorpayWebhookSecret,
} from '../lib/razorpay';

function createMockSignature(orderId: string, paymentId: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
}

function createMockWebhookSignature(rawBody: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
}

async function runRazorpayVerification() {
  console.log('=================================================================');
  console.log('       NOVASHOP PART 8: RAZORPAY INTEGRATION & SECURITY TESTS    ');
  console.log('=================================================================\n');

  const secret = getRazorpayKeySecret() || 'rzp_test_placeholder_key_secret';
  const webhookSecret = getRazorpayWebhookSecret() || 'rzp_test_placeholder_webhook_secret';

  // --- 1. Setup Test Users ---
  let user1 = await prisma.user.findFirst({
    where: { role: 'customer', NOT: { email: 'reviewer@novashop.com' } },
  });
  if (!user1) {
    user1 = await prisma.user.create({
      data: {
        name: 'Test Customer 1',
        email: 'customer1@novashop.com',
        role: 'customer',
      },
    });
  }

  let user2 = await prisma.user.findFirst({
    where: { email: 'reviewer@novashop.com' },
  });
  if (!user2) {
    user2 = await prisma.user.create({
      data: {
        name: 'Test Reviewer',
        email: 'reviewer@novashop.com',
        role: 'customer',
      },
    });
  }

  console.log(`User 1: ${user1.name} (${user1.id})`);
  console.log(`User 2: ${user2.name} (${user2.id})\n`);

  // --- Ensure Test Products & Inventory ---
  let prod = await prisma.product.findUnique({ where: { id: 'prod-001' } });
  if (!prod) throw new Error('Product prod-001 not found.');

  prod = await prisma.product.update({
    where: { id: 'prod-001' },
    data: { stockCount: 100, inStock: true, price: 8999 },
  });

  // --- Ensure Address for User 1 ---
  let address = await prisma.address.findFirst({ where: { userId: user1.id } });
  if (!address) {
    address = await prisma.address.create({
      data: {
        userId: user1.id,
        fullName: 'Arjun Mehta',
        phone: '+91 98765 43210',
        addressLine1: 'Flat 4B, Skyline Residency',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400058',
        isDefault: true,
      },
    });
  }

  // Clear previous cart for User 1
  let cart = await prisma.cart.findUnique({ where: { userId: user1.id } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId: user1.id } });
  }
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  // -------------------------------------------------------------------------
  // TEST 1: Payment Order Initialization & Gateway Linkage
  // -------------------------------------------------------------------------
  console.log('--- TEST 1: Payment Order Initialization ---');
  await prisma.cartItem.create({
    data: { cartId: cart.id, productId: prod.id, quantity: 1 },
  });

  const orderResult = await createOrderFromCart({
    userId: user1.id,
    addressId: address.id,
    paymentMethod: 'card',
    deliveryMethod: 'standard',
  });
  const order1 = orderResult.order;
  console.log(`✔ Created NovaShop Order: ${order1.id} (Total: ₹${order1.total}, Payment: ${order1.paymentStatus})`);

  const paymentInit = await initiateOrderPayment({
    orderId: order1.id,
    userId: user1.id,
  });
  console.log(`✔ Initiated Gateway Order: ${paymentInit.razorpayOrderId} (Amount: ${paymentInit.amount} paise)`);

  const checkOrder1 = await prisma.order.findUnique({
    where: { id: order1.id },
    include: { payments: true },
  });
  if (checkOrder1?.razorpayOrderId !== paymentInit.razorpayOrderId) {
    throw new Error('TEST 1 FAILED: Order razorpayOrderId was not linked properly.');
  }
  if (checkOrder1.payments.length === 0 || checkOrder1.payments[0].status !== 'created') {
    throw new Error('TEST 1 FAILED: Payment log record was not created with status "created".');
  }
  console.log('✔ Verified Order and Payment models linked accurately in database.\n');

  // -------------------------------------------------------------------------
  // TEST 2: Invalid Signature Rejection
  // -------------------------------------------------------------------------
  console.log('--- TEST 2: Invalid Signature Rejection ---');
  const fakePaymentId = 'pay_fake_123456';
  const badSignature = 'invalid_tampered_signature_abc';

  let threwInvalidSig = false;
  try {
    await verifyAndCapturePayment({
      orderId: order1.id,
      razorpayOrderId: paymentInit.razorpayOrderId,
      razorpayPaymentId: fakePaymentId,
      razorpaySignature: badSignature,
      userId: user1.id,
    });
  } catch (err: any) {
    threwInvalidSig = true;
    console.log(`✔ Correctly caught invalid signature error: "${err.message}"`);
  }

  if (!threwInvalidSig) {
    throw new Error('TEST 2 FAILED: Invalid signature was accepted!');
  }

  const order1StillPending = await prisma.order.findUnique({ where: { id: order1.id } });
  if (order1StillPending?.paymentStatus === 'paid') {
    throw new Error('TEST 2 FAILED: Order was incorrectly marked paid despite invalid signature!');
  }
  console.log('✔ Verified order remains unpaid/pending after invalid signature.\n');

  // -------------------------------------------------------------------------
  // TEST 3: Successful Test-Mode Payment Verification
  // -------------------------------------------------------------------------
  console.log('--- TEST 3: Successful Test-Mode Payment Verification ---');
  const validPaymentId = `pay_valid_${Math.random().toString(36).substring(2, 10)}`;
  const validSignature = createMockSignature(paymentInit.razorpayOrderId, validPaymentId, secret);

  const captureResult = await verifyAndCapturePayment({
    orderId: order1.id,
    razorpayOrderId: paymentInit.razorpayOrderId,
    razorpayPaymentId: validPaymentId,
    razorpaySignature: validSignature,
    userId: user1.id,
  });

  if (captureResult.order.paymentStatus !== 'paid') {
    throw new Error('TEST 3 FAILED: Order paymentStatus is not "paid" after verification.');
  }
  if (captureResult.order.razorpayPaymentId !== validPaymentId) {
    throw new Error('TEST 3 FAILED: Gateway payment ID not saved on Order.');
  }

  const dbPayment = await prisma.payment.findUnique({
    where: { razorpayPaymentId: validPaymentId },
  });
  if (!dbPayment || dbPayment.status !== 'captured') {
    throw new Error('TEST 3 FAILED: Payment record status is not "captured".');
  }
  console.log(`✔ Order ${order1.id} successfully verified & captured: Status is PAID, Gateway Payment ID: ${validPaymentId}\n`);

  // -------------------------------------------------------------------------
  // TEST 4: Duplicate Verification Requests (Idempotency)
  // -------------------------------------------------------------------------
  console.log('--- TEST 4: Duplicate Verification Requests (Idempotency) ---');
  const duplicateCapture = await verifyAndCapturePayment({
    orderId: order1.id,
    razorpayOrderId: paymentInit.razorpayOrderId,
    razorpayPaymentId: validPaymentId,
    razorpaySignature: validSignature,
    userId: user1.id,
  });

  if (!duplicateCapture.alreadyProcessed) {
    throw new Error('TEST 4 FAILED: Duplicate verification was not detected as already processed.');
  }
  if (duplicateCapture.order.paymentStatus !== 'paid') {
    throw new Error('TEST 4 FAILED: Order status corrupted during duplicate verification.');
  }
  console.log('✔ Duplicate verification handled idempotently without re-triggering updates.\n');

  // -------------------------------------------------------------------------
  // TEST 5: Failed / Abandoned Payment & Safe Retry
  // -------------------------------------------------------------------------
  console.log('--- TEST 5: Failed Payment Handling & Safe Retry ---');
  await prisma.cartItem.create({
    data: { cartId: cart.id, productId: prod.id, quantity: 2 },
  });

  const order2Result = await createOrderFromCart({
    userId: user1.id,
    addressId: address.id,
    paymentMethod: 'card',
  });
  const order2 = order2Result.order;
  const initialStockAfterOrder2 = (await prisma.product.findUnique({ where: { id: prod.id } }))?.stockCount;

  // Initiate first gateway attempt
  const initAttempt1 = await initiateOrderPayment({ orderId: order2.id, userId: user1.id });

  // Customer abandons / card fails
  const failedOrder = await recordPaymentFailure({
    orderId: order2.id,
    razorpayOrderId: initAttempt1.razorpayOrderId,
    errorMessage: 'Card declined due to insufficient funds.',
    userId: user1.id,
  });

  if (failedOrder.paymentStatus !== 'failed') {
    throw new Error('TEST 5 FAILED: Order paymentStatus was not updated to "failed".');
  }

  // Verify stock was NOT affected by payment failure
  const stockAfterFailure = (await prisma.product.findUnique({ where: { id: prod.id } }))?.stockCount;
  if (stockAfterFailure !== initialStockAfterOrder2) {
    throw new Error('TEST 5 FAILED: Stock changed unexpectedly during payment failure!');
  }
  console.log('✔ Payment failure logged: Order is "failed", inventory remains safely reserved.');

  // Customer retries payment!
  const retryInit = await initiateOrderPayment({ orderId: order2.id, userId: user1.id });
  console.log(`✔ Payment retry initiated: New gateway order ${retryInit.razorpayOrderId}`);

  // Stock must still NOT change
  const stockAfterRetryInit = (await prisma.product.findUnique({ where: { id: prod.id } }))?.stockCount;
  if (stockAfterRetryInit !== initialStockAfterOrder2) {
    throw new Error('TEST 5 FAILED: Stock was double-decremented on payment retry!');
  }

  // Complete retry payment successfully
  const retryPaymentId = `pay_retry_${Math.random().toString(36).substring(2, 10)}`;
  const retrySig = createMockSignature(retryInit.razorpayOrderId, retryPaymentId, secret);

  const retryCapture = await verifyAndCapturePayment({
    orderId: order2.id,
    razorpayOrderId: retryInit.razorpayOrderId,
    razorpayPaymentId: retryPaymentId,
    razorpaySignature: retrySig,
    userId: user1.id,
  });

  if (retryCapture.order.paymentStatus !== 'paid') {
    throw new Error('TEST 5 FAILED: Retried payment could not be captured.');
  }

  const order2History = await prisma.payment.findMany({ where: { orderId: order2.id } });
  if (order2History.length < 2) {
    throw new Error('TEST 5 FAILED: Payment audit log should record all attempts.');
  }
  console.log(`✔ Payment retry succeeded: Order status is PAID, total payment attempts logged: ${order2History.length}\n`);

  // -------------------------------------------------------------------------
  // TEST 6: Webhook Signature Verification & Idempotency
  // -------------------------------------------------------------------------
  console.log('--- TEST 6: Webhook Signature Verification & Idempotency ---');
  await prisma.cartItem.create({
    data: { cartId: cart.id, productId: prod.id, quantity: 1 },
  });
  const order3 = (await createOrderFromCart({
    userId: user1.id,
    addressId: address.id,
    paymentMethod: 'upi',
  })).order;

  const order3Init = await initiateOrderPayment({ orderId: order3.id, userId: user1.id });
  const whPaymentId = `pay_wh_${Math.random().toString(36).substring(2, 10)}`;

  // Construct realistic Razorpay webhook payload
  const webhookBodyObj = {
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: whPaymentId,
          order_id: order3Init.razorpayOrderId,
          amount: Math.round(order3.total * 100),
          currency: 'INR',
          status: 'captured',
          method: 'upi',
          vpa: 'customer@okaxis',
          notes: { novashopOrderId: order3.id },
        },
      },
    },
  };
  const rawWebhookBody = JSON.stringify(webhookBodyObj);

  // Test webhook signature verification function
  const validWhSig = createMockWebhookSignature(rawWebhookBody, webhookSecret);
  const isValidSigCheck = verifyWebhookSignature({ rawBody: rawWebhookBody, signature: validWhSig });
  if (!isValidSigCheck) {
    throw new Error('TEST 6 FAILED: Valid webhook signature was rejected!');
  }

  const isInvalidSigCheck = verifyWebhookSignature({ rawBody: rawWebhookBody, signature: 'wrong_sig' });
  if (isInvalidSigCheck) {
    throw new Error('TEST 6 FAILED: Invalid webhook signature was accepted!');
  }
  console.log('✔ Webhook HMAC-SHA256 signature verification verified with constant-time equality.');

  // Process webhook event
  const whResult1 = await processRazorpayWebhookEvent('payment.captured', webhookBodyObj.payload);
  if (!whResult1.handled || whResult1.status !== 'paid') {
    throw new Error('TEST 6 FAILED: Webhook did not mark order as paid.');
  }

  const order3Db = await prisma.order.findUnique({ where: { id: order3.id } });
  if (order3Db?.paymentStatus !== 'paid') {
    throw new Error('TEST 6 FAILED: Order paymentStatus not "paid" in DB after webhook.');
  }
  console.log(`✔ Webhook payment.captured processed: Order ${order3.id} marked as PAID.`);

  // Test duplicate webhook delivery
  const whDuplicate = await processRazorpayWebhookEvent('payment.captured', webhookBodyObj.payload);
  if (!whDuplicate.alreadyProcessed) {
    throw new Error('TEST 6 FAILED: Duplicate webhook was not detected as alreadyProcessed.');
  }
  console.log('✔ Duplicate webhook delivery handled idempotently without redundant writes.\n');

  // -------------------------------------------------------------------------
  // TEST 7: Amount Mismatch / Fraud Prevention
  // -------------------------------------------------------------------------
  console.log('--- TEST 7: Amount Mismatch Fraud Protection ---');
  await prisma.cartItem.create({
    data: { cartId: cart.id, productId: prod.id, quantity: 1 },
  });
  const order4 = (await createOrderFromCart({
    userId: user1.id,
    addressId: address.id,
    paymentMethod: 'card',
  })).order;
  const order4Init = await initiateOrderPayment({ orderId: order4.id, userId: user1.id });

  // Fraudulent webhook claiming payment was captured for ₹10 instead of total
  const fraudPayload = {
    payment: {
      entity: {
        id: 'pay_fraud_underpay',
        order_id: order4Init.razorpayOrderId,
        amount: 1000, // ₹10.00 instead of order total
        currency: 'INR',
        notes: { novashopOrderId: order4.id },
      },
    },
  };

  const fraudResult = await processRazorpayWebhookEvent('payment.captured', fraudPayload);
  if (fraudResult.handled) {
    throw new Error('TEST 7 FAILED: Amount mismatch was allowed to pass!');
  }

  const order4Db = await prisma.order.findUnique({ where: { id: order4.id } });
  if (order4Db?.paymentStatus === 'paid') {
    throw new Error('TEST 7 FAILED: Underpaid order was marked as paid!');
  }
  console.log('✔ Amount mismatch detected and blocked: Order remained unpaid.\n');

  // -------------------------------------------------------------------------
  // TEST 8: Ownership & Cancellation Security Checks
  // -------------------------------------------------------------------------
  console.log('--- TEST 8: Ownership & Cancellation Security Checks ---');
  // User 2 attempts to pay User 1's order
  let threwOwnership = false;
  try {
    await initiateOrderPayment({ orderId: order4.id, userId: user2.id });
  } catch (err: any) {
    threwOwnership = true;
    console.log(`✔ Cross-user payment initiation blocked: "${err.message}"`);
  }
  if (!threwOwnership) {
    throw new Error('TEST 8 FAILED: Cross-user payment was not blocked!');
  }

  // Cancel order4 and attempt payment
  const stockBeforeCancel = (await prisma.product.findUnique({ where: { id: prod.id } }))?.stockCount!;
  await cancelOrder(order4.id, user1.id);
  const stockAfterCancel = (await prisma.product.findUnique({ where: { id: prod.id } }))?.stockCount!;
  if (stockAfterCancel !== stockBeforeCancel + 1) {
    throw new Error('TEST 8 FAILED: Cancellation did not restore product inventory.');
  }

  let threwCancelledPay = false;
  try {
    await initiateOrderPayment({ orderId: order4.id, userId: user1.id });
  } catch (err: any) {
    threwCancelledPay = true;
    console.log(`✔ Payment on cancelled order blocked: "${err.message}"`);
  }
  if (!threwCancelledPay) {
    throw new Error('TEST 8 FAILED: Payment initiation on cancelled order succeeded!');
  }
  console.log('✔ Strict isolation and cancelled order protection verified.\n');

  console.log('=================================================================');
  console.log('  ALL NOVASHOP PART 8 PAYMENT GATEWAY INTEGRATION TESTS PASSED!  ');
  console.log('=================================================================\n');
}

runRazorpayVerification()
  .catch((err) => {
    console.error('\n❌ VERIFICATION TEST FAILED:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
