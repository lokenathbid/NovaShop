import { prisma } from '../lib/prisma';
import {
  getUserWishlistProducts,
  addProductToWishlist,
  removeProductFromWishlist,
  clearUserWishlist,
  syncGuestWishlistItems,
} from '../lib/wishlist';

async function runTests() {
  console.log('=== NovaShop Part 5 Wishlist Verification ===\n');

  // Step 1: Find test users and products
  let user1 = await prisma.user.findFirst({
    where: { role: 'customer', NOT: { email: 'reviewer@novashop.com' } },
  });
  if (!user1) {
    user1 = await prisma.user.create({
      data: {
        name: 'Test Customer',
        email: 'customer@novashop.com',
        role: 'customer',
      },
    });
  }
  const user2 = await prisma.user.findFirst({ where: { email: 'reviewer@novashop.com' } });

  if (!user1 || !user2) {
    throw new Error('Test users not found.');
  }

  const prod1 = await prisma.product.findUnique({ where: { id: 'prod-001' } });
  const prod2 = await prisma.product.findUnique({ where: { id: 'prod-002' } });
  const prod3 = await prisma.product.findUnique({ where: { id: 'prod-003' } });

  if (!prod1 || !prod2 || !prod3) {
    throw new Error('Test products not found.');
  }

  console.log(`Test User 1: ${user1.name} (${user1.id})`);
  console.log(`Test User 2: ${user2.name} (${user2.id})`);
  console.log(`Test Product 1: ${prod1.name} (${prod1.id})`);
  console.log(`Test Product 2: ${prod2.name} (${prod2.id})`);
  console.log(`Test Product 3: ${prod3.name} (${prod3.id})\n`);

  // Step 2: Clean slate for test users
  console.log('1. Cleaning existing wishlist items for test users...');
  await prisma.wishlistItem.deleteMany({
    where: {
      userId: { in: [user1.id, user2.id] },
    },
  });
  console.log('✓ Wishlists initialized to clean state.\n');

  // Step 3: Add product 1 to User 1
  console.log('2. Adding Product 1 to User 1 wishlist...');
  const addRes1 = await addProductToWishlist(user1.id, prod1.id);
  console.log(`✓ Result: created=${addRes1.created}, product=${addRes1.product.name}`);
  if (!addRes1.created) throw new Error('Expected created=true on first addition');

  // Step 4: Duplicate prevention
  console.log('3. Duplicate prevention: Attempting to add Product 1 to User 1 again...');
  const addResDup = await addProductToWishlist(user1.id, prod1.id);
  console.log(`✓ Result: created=${addResDup.created} (Duplicate successfully prevented)`);
  if (addResDup.created) throw new Error('Expected created=false on duplicate addition');

  const u1ItemsAfterDup = await getUserWishlistProducts(user1.id);
  console.log(`✓ User 1 wishlist count after duplicate attempt: ${u1ItemsAfterDup.length}`);
  if (u1ItemsAfterDup.length !== 1) throw new Error('Wishlist should contain exactly 1 item');

  // Step 5: Add Product 2 to User 1
  console.log('4. Adding Product 2 to User 1 wishlist...');
  const addRes2 = await addProductToWishlist(user1.id, prod2.id);
  console.log(`✓ Result: created=${addRes2.created}, product=${addRes2.product.name}`);

  const u1Items = await getUserWishlistProducts(user1.id);
  console.log(`✓ User 1 total items: ${u1Items.length}`);
  if (u1Items.length !== 2) throw new Error('Wishlist should contain 2 items');

  // Step 6: Security and User Isolation
  console.log('5. Security & Isolation: Checking User 2 wishlist...');
  const u2ItemsInitial = await getUserWishlistProducts(user2.id);
  console.log(`✓ User 2 wishlist item count: ${u2ItemsInitial.length}`);
  if (u2ItemsInitial.length !== 0) throw new Error('User 2 wishlist must be empty');

  // User 2 tries to remove User 1's wishlist item
  console.log('6. Security: User 2 attempts to remove User 1 item (prod1)...');
  const u2DeleteRes = await removeProductFromWishlist(user2.id, prod1.id);
  console.log(`✓ Result: deleted=${u2DeleteRes.deleted} (User 2 did not affect User 1's item)`);

  const u1ItemsStillThere = await getUserWishlistProducts(user1.id);
  if (u1ItemsStillThere.length !== 2) throw new Error('User 1 items were incorrectly affected');
  console.log('✓ User 1 items intact.\n');

  // Step 7: Guest Wishlist Synchronization for User 2
  console.log('7. Guest synchronization: Simulating User 2 logging in with guest items [prod2, prod3, prod2 (duplicate)]...');
  const guestProductIds = [prod2.id, prod3.id, prod2.id];
  const syncedItems = await syncGuestWishlistItems(user2.id, guestProductIds);
  console.log(`✓ Synced items count for User 2: ${syncedItems.length}`);
  if (syncedItems.length !== 2) {
    throw new Error(`Expected 2 items for User 2 after deduplicated sync, got ${syncedItems.length}`);
  }
  console.log(`✓ User 2 items: ${syncedItems.map((p) => p.name).join(', ')}\n`);

  // Step 8: Remove single item from User 1
  console.log('8. Removing Product 1 from User 1 wishlist...');
  const remRes = await removeProductFromWishlist(user1.id, prod1.id);
  console.log(`✓ Result: deleted=${remRes.deleted}`);
  const u1AfterRem = await getUserWishlistProducts(user1.id);
  console.log(`✓ User 1 remaining items: ${u1AfterRem.length}`);
  if (u1AfterRem.length !== 1 || u1AfterRem[0].id !== prod2.id) {
    throw new Error('Expected only Product 2 in User 1 wishlist');
  }

  // Step 9: Clear wishlist for User 1
  console.log('9. Clearing User 1 wishlist...');
  const cleared = await clearUserWishlist(user1.id);
  console.log(`✓ Cleared items: ${cleared}`);
  const u1Final = await getUserWishlistProducts(user1.id);
  console.log(`✓ User 1 final items: ${u1Final.length}`);
  if (u1Final.length !== 0) throw new Error('Wishlist should be completely empty');

  // Step 10: Verify persistence in DB
  console.log('10. Verifying database state directly via Prisma Client...');
  const countInDb = await prisma.wishlistItem.count({ where: { userId: user2.id } });
  console.log(`✓ User 2 persistent items directly in MySQL: ${countInDb}`);
  if (countInDb !== 2) throw new Error('Database persistence mismatch');

  console.log('\n=============================================');
  console.log(' ALL WISHLIST TESTS PASSED SUCCESSFULLY! ');
  console.log('=============================================\n');
}

runTests()
  .catch((err) => {
    console.error('Test failed with error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
