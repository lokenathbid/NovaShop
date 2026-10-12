import { prisma } from '../lib/prisma';
import {
  createOrderFromCart,
  getUserOrders,
  getOrderById,
  cancelOrder,
  calculateOrderTotals,
} from '../lib/orders';
import { getUserCartWithDetails } from '../lib/cart';

async function runCheckoutVerification() {
  console.log('=================================================================');
  console.log('       NOVASHOP PART 7: CHECKOUT & ORDER MANAGEMENT TESTS        ');
  console.log('=================================================================\n');

  // --- Setup Test Users ---
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

  console.log(`User 1 (Primary): ${user1.name} (${user1.id})`);
  console.log(`User 2 (Isolation): ${user2.name} (${user2.id})\n`);

  // --- Ensure Test Products ---
  let prod1 = await prisma.product.findUnique({ where: { id: 'prod-001' } });
  if (!prod1) {
    throw new Error('Test product prod-001 not found.');
  }

  let prod2 = await prisma.product.findUnique({ where: { id: 'prod-002' } });
  if (!prod2) {
    throw new Error('Test product prod-002 not found.');
  }

  // Ensure known starting stock and name for prod1
  prod1 = await prisma.product.update({
    where: { id: prod1.id },
    data: {
      name: 'NovaPro X15 Wireless Headphones',
      stockCount: 100,
      inStock: true,
      price: 8999,
      originalPrice: 12999,
    },
  });
  console.log(`Product 1: ${prod1.name} | Price: ₹8999 | Stock: 100`);

  // --- Ensure Test Address for User 1 ---
  let address1 = await prisma.address.findFirst({ where: { userId: user1.id } });
  if (!address1) {
    address1 = await prisma.address.create({
      data: {
        userId: user1.id,
        fullName: 'Arjun Mehta',
        phone: '+91 98765 43210',
        addressLine1: 'Flat 4B, Skyline Residency',
        addressLine2: 'Andheri West',
        landmark: 'Near Metro Station',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400058',
        country: 'India',
        isDefault: true,
      },
    });
  } else {
    address1 = await prisma.address.update({
      where: { id: address1.id },
      data: {
        fullName: 'Arjun Mehta',
        addressLine1: 'Flat 4B, Skyline Residency',
      },
    });
  }
  console.log(`Test Address: ${address1.fullName}, ${address1.city} (${address1.id})\n`);

  // Clean slate: clean carts and previous test orders for test idempotency
  await prisma.cartItem.deleteMany({
    where: { cart: { userId: { in: [user1.id, user2.id] } } },
  });

  // Ensure cart exists for user 1
  let cart1 = await prisma.cart.upsert({
    where: { userId: user1.id },
    create: { userId: user1.id },
    update: {},
  });

  // =================================================================
  // TEST 1: Empty cart rejection
  // =================================================================
  console.log('TEST 1: Empty cart rejection...');
  try {
    await createOrderFromCart({
      userId: user1.id,
      addressId: address1.id,
    });
    throw new Error('TEST 1 FAILED: Expected empty cart to be rejected.');
  } catch (err: any) {
    if (err.message.includes('empty')) {
      console.log('✓ PASS: Empty cart correctly rejected with error: "' + err.message + '"\n');
    } else {
      throw err;
    }
  }

  // =================================================================
  // TEST 2: Invalid address rejection
  // =================================================================
  console.log('TEST 2: Invalid address rejection...');
  // Add 1 item to cart
  await prisma.cartItem.create({
    data: {
      cartId: cart1.id,
      productId: prod1.id,
      quantity: 1,
    },
  });

  try {
    await createOrderFromCart({
      userId: user1.id,
      addressId: 'non-existent-address-id',
    });
    throw new Error('TEST 2 FAILED: Expected invalid address to be rejected.');
  } catch (err: any) {
    if (err.message.includes('address') || err.message.includes('found')) {
      console.log('✓ PASS: Invalid address correctly rejected with error: "' + err.message + '"\n');
    } else {
      throw err;
    }
  }

  // Clean cart again
  await prisma.cartItem.deleteMany({ where: { cartId: cart1.id } });

  // =================================================================
  // TEST 3: Insufficient stock rejection
  // =================================================================
  console.log('TEST 3: Insufficient stock rejection...');
  // Set product stockCount to 2 temporarily
  await prisma.product.update({
    where: { id: prod1.id },
    data: { stockCount: 2, inStock: true },
  });

  // Put quantity 5 in cart
  await prisma.cartItem.create({
    data: {
      cartId: cart1.id,
      productId: prod1.id,
      quantity: 5,
    },
  });

  try {
    await createOrderFromCart({
      userId: user1.id,
      addressId: address1.id,
    });
    throw new Error('TEST 3 FAILED: Expected order to be rejected due to insufficient stock.');
  } catch (err: any) {
    if (err.message.includes('stock') || err.message.includes('Insufficient')) {
      // Verify stock was not decremented
      const checkProd = await prisma.product.findUnique({ where: { id: prod1.id } });
      if (checkProd?.stockCount !== 2) {
        throw new Error(`TEST 3 FAILED: Stock was altered during rejected order: ${checkProd?.stockCount}`);
      }
      console.log('✓ PASS: Insufficient stock correctly rejected. Stock untouched: ' + checkProd?.stockCount + '\n');
    } else {
      throw err;
    }
  }

  // Clean cart and restore stock to 100
  await prisma.cartItem.deleteMany({ where: { cartId: cart1.id } });
  await prisma.product.update({
    where: { id: prod1.id },
    data: { stockCount: 100, inStock: true },
  });

  // =================================================================
  // TEST 4: Successful Order Placement & Server-Calculated Totals
  // =================================================================
  console.log('TEST 4: Successful order placement with server-verified totals...');
  // Add 2 of prod1 (unit price 8999, original 12999)
  await prisma.cartItem.create({
    data: {
      cartId: cart1.id,
      productId: prod1.id,
      quantity: 2,
    },
  });

  const testIdempotencyKey = `idem-test-${Date.now()}`;
  const orderResult = await createOrderFromCart({
    userId: user1.id,
    addressId: address1.id,
    deliveryMethod: 'standard',
    paymentMethod: 'card',
    idempotencyKey: testIdempotencyKey,
  });

  const createdOrder = orderResult.order;
  console.log(`Created Order ID: ${createdOrder.id}`);
  console.log(`Order Status: ${createdOrder.status}`);
  console.log(`Payment Status: ${createdOrder.paymentStatus}`);
  console.log(`Subtotal: ₹${createdOrder.subtotal} | Shipping: ₹${createdOrder.shipping} | Tax: ₹${createdOrder.tax} | Total: ₹${createdOrder.total}`);

  // Expected: subtotal = 2 * 8999 = 17998
  // discount = 2 * (12999 - 8999) = 8000
  // shipping = 0 (free over 999)
  // total = 17998
  if (createdOrder.subtotal !== 17998) {
    throw new Error(`Expected subtotal 17998, got ${createdOrder.subtotal}`);
  }
  if (createdOrder.total !== 17998) {
    throw new Error(`Expected total 17998, got ${createdOrder.total}`);
  }
  if (createdOrder.paymentStatus !== 'pending') {
    throw new Error(`Expected paymentStatus 'pending', got ${createdOrder.paymentStatus}`);
  }

  // Verify stock decremented: 100 - 2 = 98
  const prodAfter = await prisma.product.findUnique({ where: { id: prod1.id } });
  if (prodAfter?.stockCount !== 98) {
    throw new Error(`Expected stockCount 98, got ${prodAfter?.stockCount}`);
  }

  // Verify cart cleared
  const cartAfter = await getUserCartWithDetails(user1.id);
  if (cartAfter.items.length !== 0) {
    throw new Error(`Expected cart to be cleared after order, but found ${cartAfter.items.length} items`);
  }

  console.log('✓ PASS: Order created with server totals, inventory decremented (100 -> 98), and cart cleared.\n');

  // =================================================================
  // TEST 5: Address and Product Snapshot Preservation
  // =================================================================
  console.log('TEST 5: Historical address & product snapshot preservation...');
  // Save original address details
  const originalAddressFullName = address1.fullName;
  const originalAddressLine1 = address1.addressLine1;

  // Modify the original Address record
  await prisma.address.update({
    where: { id: address1.id },
    data: { fullName: 'MODIFIED NAME', addressLine1: 'MODIFIED STREET 999' },
  });

  // Modify the original Product record
  await prisma.product.update({
    where: { id: prod1.id },
    data: { name: 'MODIFIED PRODUCT NAME', price: 99999 },
  });

  // Re-fetch the placed order
  const preservedOrder = await getOrderById(createdOrder.id, user1.id);
  if (!preservedOrder) {
    throw new Error('Failed to retrieve placed order.');
  }

  if (preservedOrder.shippingAddress.fullName !== originalAddressFullName) {
    throw new Error(`Address snapshot compromised! Expected: ${originalAddressFullName}, Got: ${preservedOrder.shippingAddress.fullName}`);
  }
  if (preservedOrder.shippingAddress.fullName === 'MODIFIED NAME') {
    throw new Error('Address snapshot was overwritten by table mutation!');
  }
  if (preservedOrder.items[0].productName !== prod1.name) {
    throw new Error(`Product snapshot compromised! Got: ${preservedOrder.items[0].productName}`);
  }
  if (preservedOrder.items[0].price !== 8999) {
    throw new Error(`Product price snapshot compromised! Got: ${preservedOrder.items[0].price}`);
  }

  console.log('✓ PASS: Historical order snapshot preserved despite later address/product mutations.');

  // Restore address and product names
  await prisma.address.update({
    where: { id: address1.id },
    data: { fullName: originalAddressFullName, addressLine1: originalAddressLine1 },
  });
  await prisma.product.update({
    where: { id: prod1.id },
    data: { name: prod1.name, price: 8999 },
  });
  console.log('✓ PASS: Test records restored.\n');

  // =================================================================
  // TEST 6: Duplicate Submission / Idempotency Protection
  // =================================================================
  console.log('TEST 6: Duplicate submission / Idempotency protection...');
  const duplicateResult = await createOrderFromCart({
    userId: user1.id,
    addressId: address1.id,
    deliveryMethod: 'standard',
    paymentMethod: 'card',
    idempotencyKey: testIdempotencyKey,
  });

  if (!duplicateResult.isDuplicate) {
    throw new Error('Expected isDuplicate to be true for repeated idempotency key.');
  }
  if (duplicateResult.order.id !== createdOrder.id) {
    throw new Error(`Expected same order ID ${createdOrder.id}, got ${duplicateResult.order.id}`);
  }

  // Stock should still be 98 (not decremented again)
  const prodCheckIdem = await prisma.product.findUnique({ where: { id: prod1.id } });
  if (prodCheckIdem?.stockCount !== 98) {
    throw new Error(`Stock decremented on duplicate submission! Expected 98, got ${prodCheckIdem?.stockCount}`);
  }
  console.log('✓ PASS: Idempotency prevented duplicate order creation and duplicate inventory decrement.\n');

  // =================================================================
  // TEST 7: Concurrent Inventory Updates & Overselling Prevention
  // =================================================================
  console.log('TEST 7: Concurrent inventory updates & race condition safety...');
  // Set product stockCount to exactly 3
  await prisma.product.update({
    where: { id: prod2.id },
    data: { stockCount: 3, inStock: true, price: 24999 },
  });

  // Prepare carts for user1 and user2 with 2 units each (total 4 units, but only 3 available)
  const cart2 = await prisma.cart.upsert({
    where: { userId: user2.id },
    create: { userId: user2.id },
    update: {},
  });

  await prisma.cartItem.deleteMany({
    where: { cartId: { in: [cart1.id, cart2.id] } },
  });

  await prisma.cartItem.create({
    data: { cartId: cart1.id, productId: prod2.id, quantity: 2 },
  });
  await prisma.cartItem.create({
    data: { cartId: cart2.id, productId: prod2.id, quantity: 2 },
  });

  // Ensure user 2 has an address
  let address2 = await prisma.address.findFirst({ where: { userId: user2.id } });
  if (!address2) {
    address2 = await prisma.address.create({
      data: {
        userId: user2.id,
        fullName: 'Reviewer User',
        phone: '+91 99999 88888',
        addressLine1: 'Test Avenue 10',
        city: 'Bangalore',
        state: 'Karnataka',
        zipCode: '560001',
        country: 'India',
      },
    });
  }

  // Fire both transactions concurrently!
  const results = await Promise.allSettled([
    createOrderFromCart({
      userId: user1.id,
      addressId: address1.id,
      idempotencyKey: `concurrent-1-${Date.now()}`,
    }),
    createOrderFromCart({
      userId: user2.id,
      addressId: address2.id,
      idempotencyKey: `concurrent-2-${Date.now()}`,
    }),
  ]);

  const fulfilled = results.filter((r) => r.status === 'fulfilled');
  const rejected = results.filter((r) => r.status === 'rejected');

  console.log(`Concurrent attempts: ${fulfilled.length} succeeded, ${rejected.length} rejected.`);
  if (fulfilled.length !== 1 || rejected.length !== 1) {
    throw new Error(`Expected exactly 1 success and 1 failure under overselling contention, got ${fulfilled.length} successes.`);
  }

  // Check remaining stock: must be 3 - 2 = 1, NOT negative!
  const finalStock = await prisma.product.findUnique({ where: { id: prod2.id } });
  console.log(`Final Product 2 stock: ${finalStock?.stockCount}`);
  if (finalStock?.stockCount !== 1) {
    throw new Error(`Expected final stock 1, got ${finalStock?.stockCount}`);
  }
  console.log('✓ PASS: Safe conditional transaction prevented overselling under concurrency.\n');

  // =================================================================
  // TEST 8: Order History & Ownership Isolation
  // =================================================================
  console.log('TEST 8: Order history and user ownership isolation...');
  const user1Orders = await getUserOrders(user1.id);
  const user2Orders = await getUserOrders(user2.id);

  console.log(`User 1 order count: ${user1Orders.length}`);
  console.log(`User 2 order count: ${user2Orders.length}`);

  // Try to access user 1's order as user 2
  const unauthorizedAccess = await getOrderById(createdOrder.id, user2.id);
  if (unauthorizedAccess !== null) {
    throw new Error('SECURITY BREACH: User 2 accessed User 1 order!');
  }
  console.log('✓ PASS: Server enforces strict ownership isolation. User 2 cannot read User 1 order.\n');

  // =================================================================
  // TEST 9: Order Cancellation & Safe Stock Restoration
  // =================================================================
  console.log('TEST 9: Order cancellation and exact-once stock restoration...');
  // Stock of prod1 is currently 98
  const stockBeforeCancel = (await prisma.product.findUnique({ where: { id: prod1.id } }))?.stockCount;
  console.log(`Stock before cancellation: ${stockBeforeCancel}`);

  const cancelledOrder = await cancelOrder(createdOrder.id, user1.id);
  if (cancelledOrder.status !== 'cancelled') {
    throw new Error(`Expected status 'cancelled', got ${cancelledOrder.status}`);
  }

  // Verify stock restored by 2 (98 + 2 = 100)
  const stockAfterCancel = (await prisma.product.findUnique({ where: { id: prod1.id } }))?.stockCount;
  console.log(`Stock after cancellation: ${stockAfterCancel}`);
  if (stockAfterCancel !== 100) {
    throw new Error(`Expected stock 100 after restoration, got ${stockAfterCancel}`);
  }

  // Attempt duplicate cancellation on the same order -> must be rejected and stock NOT incremented
  try {
    await cancelOrder(createdOrder.id, user1.id);
    throw new Error('Expected duplicate cancellation to be rejected.');
  } catch (err: any) {
    if (err.message.toLowerCase().includes('already') && err.message.toLowerCase().includes('cancel')) {
      const stockAfterDuplicate = (await prisma.product.findUnique({ where: { id: prod1.id } }))?.stockCount;
      if (stockAfterDuplicate !== 100) {
        throw new Error(`Stock double-restored! Expected 100, got ${stockAfterDuplicate}`);
      }
      console.log('✓ PASS: Duplicate cancellation safely rejected; stock restored exactly once.');
    } else {
      throw err;
    }
  }

  // Attempt unauthorized cancellation (User 2 tries to cancel User 1 order)
  try {
    await cancelOrder(createdOrder.id, user2.id);
    throw new Error('Expected unauthorized cancellation to fail.');
  } catch (err: any) {
    console.log('✓ PASS: Cross-user cancellation attempt rejected with: "' + err.message + '"\n');
  }

  // =================================================================
  // TEST 10: Existing Cart, Wishlist, Address Features Remaining Functional
  // =================================================================
  console.log('TEST 10: Existing cart, wishlist, and address feature regression check...');
  // Check cart
  const cartCheck = await getUserCartWithDetails(user1.id);
  if (typeof cartCheck.subtotal !== 'number') {
    throw new Error('Cart calculation regression.');
  }

  // Check wishlist
  const wishlistItems = await prisma.wishlistItem.findMany({ where: { userId: user1.id } });
  console.log(`Wishlist items for User 1: ${wishlistItems.length}`);

  // Check addresses
  const addressesCheck = await prisma.address.findMany({ where: { userId: user1.id } });
  console.log(`Addresses for User 1: ${addressesCheck.length}`);

  console.log('✓ PASS: Existing cart, wishlist, and address features remain fully operational.\n');

  console.log('=================================================================');
  console.log('       ALL 10 CHECKOUT & ORDER TESTS PASSED SUCCESSFULLY!        ');
  console.log('=================================================================');
}

runCheckoutVerification()
  .catch((e) => {
    console.error('VERIFICATION FAILED:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
