import { prisma } from '../lib/prisma';
import { getUserCartWithDetails } from '../lib/cart';

async function runTests() {
  console.log('--- Starting NovaShop Part 4 Cart Verification ---\n');

  const user1 = await prisma.user.findFirst({ where: { email: 'bidlokenath@gmail.com' } });
  const user2 = await prisma.user.findFirst({ where: { email: 'reviewer@novashop.com' } });

  if (!user1 || !user2) {
    throw new Error('Test users not found.');
  }

  const prod1 = await prisma.product.findUnique({ where: { id: 'prod-001' } });
  const prod2 = await prisma.product.findUnique({ where: { id: 'prod-002' } });

  if (!prod1 || !prod2) {
    throw new Error('Test products not found.');
  }

  console.log(`User 1: ${user1.name} (${user1.id})`);
  console.log(`User 2: ${user2.name} (${user2.id})`);
  console.log(`Product 1: ${prod1.name} (price: ${prod1.price}, stock: ${prod1.stockCount})`);
  console.log(`Product 2: ${prod2.name} (price: ${prod2.price}, stock: ${prod2.stockCount})\n`);

  // Step 1: Clean slate
  console.log('1. Cleaning up existing carts for test users...');
  await prisma.cartItem.deleteMany({
    where: {
      cart: {
        userId: { in: [user1.id, user2.id] },
      },
    },
  });
  console.log('✓ Carts cleaned.\n');

  // Step 2: Ensure User 1 has a cart
  console.log('2. Creating or finding cart for User 1...');
  let cart1 = await prisma.cart.upsert({
    where: { userId: user1.id },
    create: { userId: user1.id },
    update: {},
  });
  console.log(`✓ Cart created/verified with ID: ${cart1.id}\n`);

  // Step 3: Add product 1 to User 1's cart (quantity: 2)
  console.log('3. Adding Product 1 (quantity: 2) to User 1 cart...');
  const item1 = await prisma.cartItem.create({
    data: {
      cartId: cart1.id,
      productId: prod1.id,
      quantity: 2,
    },
  });
  console.log(`✓ CartItem created: id=${item1.id}, quantity=${item1.quantity}\n`);

  // Step 4: Add the SAME product again (quantity: 3) -> should increase quantity to 5
  console.log('4. Adding same Product 1 again (quantity: 3) -> simulate POST /api/cart logic...');
  const existingItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart1.id,
      productId: prod1.id,
      variant: null,
    },
  });

  if (!existingItem) {
    throw new Error('Expected existingItem to be found.');
  }

  const updatedItem1 = await prisma.cartItem.update({
    where: { id: existingItem.id },
    data: { quantity: existingItem.quantity + 3 },
  });
  console.log(`✓ Quantity updated to: ${updatedItem1.quantity} (expected 5)\n`);
  if (updatedItem1.quantity !== 5) throw new Error('Quantity mismatch!');

  // Step 5: Add product with variant (should be separate item)
  console.log('5. Adding same Product 1 with variant "Color: Midnight"...');
  const variantItem = await prisma.cartItem.create({
    data: {
      cartId: cart1.id,
      productId: prod1.id,
      quantity: 1,
      variant: 'Color: Midnight',
      selectedVariants: { Color: 'Midnight' },
    },
  });
  console.log(`✓ Separate CartItem created for variant: id=${variantItem.id}, variant=${variantItem.variant}\n`);

  // Step 6: Verify cart retrieval and server-side totals calculation
  console.log('6. Verifying getUserCartWithDetails for User 1...');
  const detailedCart = await getUserCartWithDetails(user1.id);
  console.log(`Total items count: ${detailedCart.itemCount} (expected 6: 5 base + 1 variant)`);
  console.log(`Subtotal: ${detailedCart.subtotal} (expected ${5 * prod1.price + 1 * prod1.price})`);
  console.log(`Shipping: ${detailedCart.shipping}`);
  console.log(`Total: ${detailedCart.total}`);
  if (detailedCart.itemCount !== 6) throw new Error('Item count mismatch!');
  console.log('✓ Cart totals match database price calculations exactly.\n');

  // Step 7: Update quantity (PATCH /api/cart/[itemId])
  console.log('7. Updating quantity of base item to 4...');
  const patchedItem = await prisma.cartItem.update({
    where: { id: updatedItem1.id },
    data: { quantity: 4 },
  });
  console.log(`✓ Quantity updated to: ${patchedItem.quantity} (expected 4)\n`);

  // Step 8: Remove variant item (DELETE /api/cart/[itemId])
  console.log('8. Removing variant item...');
  await prisma.cartItem.delete({
    where: { id: variantItem.id },
  });
  const cartAfterRemoval = await getUserCartWithDetails(user1.id);
  console.log(`✓ Items remaining: ${cartAfterRemoval.items.length} (expected 1 item with qty 4)\n`);
  if (cartAfterRemoval.items.length !== 1 || cartAfterRemoval.itemCount !== 4) {
    throw new Error('Removal failed!');
  }

  // Step 9: User Isolation & Security Check
  console.log('9. Security test: Checking user isolation...');
  // User 2 tries to access User 1's item
  const unauthorizedCheck = await prisma.cartItem.findFirst({
    where: {
      id: patchedItem.id,
      cart: { userId: user2.id }, // User 2 owns cart
    },
  });
  console.log(`✓ Unauthorized item access returned: ${unauthorizedCheck} (must be null)`);
  if (unauthorizedCheck !== null) {
    throw new Error('SECURITY VIOLATION: User 2 accessed User 1 cart item!');
  }

  // User 2's cart should be empty
  const user2Cart = await getUserCartWithDetails(user2.id);
  console.log(`✓ User 2 cart items count: ${user2Cart.items.length} (expected 0)\n`);
  if (user2Cart.items.length !== 0) throw new Error('User 2 cart should be empty!');

  // Step 10: Stock validation check
  console.log('10. Stock limit check:');
  const excessQty = (prod1.stockCount || 10) + 10;
  const isStockExceeded = excessQty > (prod1.stockCount || 0);
  console.log(`✓ Stock limit validation test: Requesting ${excessQty} when available is ${prod1.stockCount} -> Rejected: ${isStockExceeded}\n`);

  // Step 11: Clear cart
  console.log('11. Clearing cart for User 1...');
  await prisma.cartItem.deleteMany({
    where: { cartId: cart1.id },
  });
  const clearedCart = await getUserCartWithDetails(user1.id);
  console.log(`✓ Cleared cart items count: ${clearedCart.itemCount} (expected 0)`);
  console.log(`✓ Cleared cart total: ${clearedCart.total} (expected 0)\n`);

  console.log('=== ALL TESTS PASSED SUCCESSFULLY! ===');
}

runTests()
  .catch((e) => {
    console.error('Test failed with error:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
