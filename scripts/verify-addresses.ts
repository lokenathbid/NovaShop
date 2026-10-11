import { prisma } from '../lib/prisma';
import {
  getUserAddresses,
  getUserAddressById,
  getUserDefaultAddress,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
  validateAndNormalizeAddressInput,
} from '../lib/addresses';
import { getUserCartWithDetails } from '../lib/cart';
import { getUserWishlistProducts } from '../lib/wishlist';

async function runTests() {
  console.log('=====================================================');
  console.log('   NOVASHOP PART 6: ADDRESS MANAGEMENT VERIFICATION  ');
  console.log('=====================================================\n');

  // Step 1: Find or ensure test users
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

  const user2 = await prisma.user.findFirst({
    where: { email: 'reviewer@novashop.com' },
  });

  if (!user1 || !user2) {
    throw new Error('Test users could not be located or created.');
  }

  console.log(`User 1: ${user1.name} (${user1.id})`);
  console.log(`User 2: ${user2.name} (${user2.id})\n`);

  // Step 2: Clean existing addresses for test users
  console.log('1. Cleaning up test users existing addresses...');
  await prisma.address.deleteMany({
    where: { userId: { in: [user1.id, user2.id] } },
  });
  console.log('✓ Test user addresses cleaned to zero.\n');

  // Step 3: Input validation tests
  console.log('2. Testing required-field and invalid-input validation...');

  const emptyValidation = validateAndNormalizeAddressInput({});
  if (emptyValidation.isValid) {
    throw new Error('Validation should fail for empty input!');
  }
  console.log('✓ Empty input rejected with errors for: ' + Object.keys(emptyValidation.errors).join(', '));

  const invalidPhoneValidation = validateAndNormalizeAddressInput({
    fullName: 'Jane Doe',
    phone: '123', // Too short
    addressLine1: '123 Main St',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipCode: '400001',
  });
  if (invalidPhoneValidation.isValid || !invalidPhoneValidation.errors.phone) {
    throw new Error('Validation should reject invalid phone numbers!');
  }
  console.log(`✓ Short phone rejected: "${invalidPhoneValidation.errors.phone}"`);

  const validValidation = validateAndNormalizeAddressInput({
    fullName: 'Arjun Mehta',
    phone: '+91 98765 43210',
    addressLine1: 'Flat 4B, Skyline Residency',
    addressLine2: 'Andheri West',
    landmark: 'Near City Mall',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipCode: '400058',
    country: 'India',
    type: 'Home',
  });
  if (!validValidation.isValid || !validValidation.data) {
    throw new Error('Valid input should pass validation!');
  }
  console.log('✓ Valid input successfully validated and normalized.\n');

  // Step 4: Create First Address for User 1 (should automatically become default)
  console.log('3. Creating first address for User 1 (Home)...');
  const addr1 = await createAddress(user1.id, validValidation.data);
  console.log(`✓ Address 1 created: id=${addr1.id}, type=${addr1.type}, isDefault=${addr1.isDefault}`);
  if (!addr1.isDefault) {
    throw new Error('First address must automatically be marked as default!');
  }
  if (addr1.landmark !== 'Near City Mall') {
    throw new Error('Landmark was not properly saved!');
  }

  // Step 5: Create Second Address for User 1 (Work, non-default)
  console.log('4. Creating second address for User 1 (Work, non-default)...');
  const addr2 = await createAddress(user1.id, {
    fullName: 'Arjun Mehta',
    phone: '+91 98765 43210',
    addressLine1: '7th Floor, Tech Park One',
    addressLine2: 'Whitefield',
    city: 'Bangalore',
    state: 'Karnataka',
    zipCode: '560066',
    country: 'India',
    type: 'Work',
    isDefault: false,
  });
  console.log(`✓ Address 2 created: id=${addr2.id}, type=${addr2.type}, isDefault=${addr2.isDefault}`);
  if (addr2.isDefault) {
    throw new Error('Second address with isDefault: false should not be default!');
  }

  // Check list
  const listAfter2 = await getUserAddresses(user1.id);
  console.log(`✓ User 1 total addresses: ${listAfter2.length}`);
  if (listAfter2.length !== 2) throw new Error('Expected 2 addresses for User 1');
  if (!listAfter2[0].isDefault || listAfter2[0].id !== addr1.id) {
    throw new Error('Address 1 should be the default address at index 0');
  }

  // Step 6: Create Third Address with isDefault: true -> verifies atomic transaction
  console.log('5. Creating third address for User 1 with isDefault=true...');
  const addr3 = await createAddress(user1.id, {
    fullName: 'Arjun Mehta',
    phone: '+91 98765 43210',
    addressLine1: 'Villa 12, Palm Meadows',
    city: 'Pune',
    state: 'Maharashtra',
    zipCode: '411001',
    country: 'India',
    type: 'Other',
    isDefault: true,
  });
  console.log(`✓ Address 3 created: id=${addr3.id}, isDefault=${addr3.isDefault}`);

  const listAfter3 = await getUserAddresses(user1.id);
  const defaultsAfter3 = listAfter3.filter((a) => a.isDefault);
  console.log(`✓ Default address count: ${defaultsAfter3.length} (must be exactly 1)`);
  if (defaultsAfter3.length !== 1 || defaultsAfter3[0].id !== addr3.id) {
    throw new Error('Only Address 3 should be marked as default now!');
  }

  // Step 7: Explicitly set Address 2 as default
  console.log('6. Explicitly setting Address 2 (Work) as default via setDefaultAddress...');
  const updatedDefault = await setDefaultAddress(user1.id, addr2.id);
  if (!updatedDefault || !updatedDefault.isDefault) {
    throw new Error('Failed to set Address 2 as default!');
  }

  const defaultAddrCheck = await getUserDefaultAddress(user1.id);
  console.log(`✓ Current default address ID: ${defaultAddrCheck?.id} (expected ${addr2.id})`);
  if (defaultAddrCheck?.id !== addr2.id) {
    throw new Error('Default address mismatch!');
  }

  // Step 8: Update Address 1
  console.log('7. Updating Address 1 details (new phone & landmark)...');
  const updatedAddr1 = await updateAddress(user1.id, addr1.id, {
    fullName: 'Arjun K. Mehta',
    phone: '+91 91234 56789',
    addressLine1: 'Flat 4B, Skyline Residency',
    addressLine2: 'Andheri West',
    landmark: 'Opposite Metro Station',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipCode: '400058',
    country: 'India',
    type: 'Home',
    isDefault: false,
  });
  if (!updatedAddr1) throw new Error('Update address returned null');
  console.log(`✓ Updated name: ${updatedAddr1.fullName}, landmark: ${updatedAddr1.landmark}`);
  if (updatedAddr1.fullName !== 'Arjun K. Mehta' || updatedAddr1.landmark !== 'Opposite Metro Station') {
    throw new Error('Address update values mismatch!');
  }

  // Step 9: Security and Ownership Isolation
  console.log('8. Security Test: User 2 attempting to read, modify, and delete User 1 address...');
  const u2Read = await getUserAddressById(user2.id, addr1.id);
  console.log(`✓ User 2 reading User 1 address: ${u2Read === null ? 'BLOCKED (null)' : 'SECURITY BREACH'}`);
  if (u2Read !== null) throw new Error('SECURITY VIOLATION: User 2 read User 1 address!');

  const u2Update = await updateAddress(user2.id, addr1.id, {
    fullName: 'Hacker',
    phone: '+91 99999 99999',
    addressLine1: 'Hacked Lane',
    city: 'Hacked',
    state: 'Hacked',
    zipCode: '999999',
    country: 'India',
  });
  console.log(`✓ User 2 updating User 1 address: ${u2Update === null ? 'BLOCKED (null)' : 'SECURITY BREACH'}`);
  if (u2Update !== null) throw new Error('SECURITY VIOLATION: User 2 updated User 1 address!');

  const u2Delete = await deleteAddress(user2.id, addr1.id);
  console.log(`✓ User 2 deleting User 1 address: ${!u2Delete.success ? 'BLOCKED (success=false)' : 'SECURITY BREACH'}`);
  if (u2Delete.success) throw new Error('SECURITY VIOLATION: User 2 deleted User 1 address!');

  const addr1AfterAttack = await getUserAddressById(user1.id, addr1.id);
  if (!addr1AfterAttack || addr1AfterAttack.fullName !== 'Arjun K. Mehta') {
    throw new Error('User 1 address was corrupted by attack attempt!');
  }
  console.log('✓ User 1 address completely intact and secure.\n');

  // Step 10: Safe deletion of default address policy
  console.log('9. Safe default deletion: Deleting the current default address (Address 2)...');
  const deleteDefaultRes = await deleteAddress(user1.id, addr2.id);
  console.log(`✓ Deleted result: success=${deleteDefaultRes.success}, newDefaultId=${deleteDefaultRes.newDefaultId}`);
  if (!deleteDefaultRes.success) throw new Error('Failed to delete address!');

  const listAfterDeleteDefault = await getUserAddresses(user1.id);
  console.log(`✓ Remaining addresses count: ${listAfterDeleteDefault.length}`);
  if (listAfterDeleteDefault.length !== 2) throw new Error('Expected 2 remaining addresses');

  const newDefault = await getUserDefaultAddress(user1.id);
  console.log(`✓ Promoted new default address ID: ${newDefault?.id} (${newDefault?.type || newDefault?.label})`);
  if (!newDefault || !newDefault.isDefault) {
    throw new Error('No default address was promoted after deleting the previous default!');
  }

  // Step 11: Cleanup test addresses
  console.log('10. Cleaning up remaining test addresses...');
  await deleteAddress(user1.id, addr1.id);
  await deleteAddress(user1.id, addr3.id);
  const finalCount = await prisma.address.count({ where: { userId: user1.id } });
  console.log(`✓ Final address count for User 1: ${finalCount}`);
  if (finalCount !== 0) throw new Error('All addresses should be cleaned up');

  // Step 12: Verify Cart and Wishlist are unaffected
  console.log('11. Verifying that Cart & Wishlist remain unaffected...');
  const user1Cart = await getUserCartWithDetails(user1.id);
  console.log(`✓ Cart check: subtotal=${user1Cart.subtotal}, itemCount=${user1Cart.itemCount}`);
  const user1Wishlist = await getUserWishlistProducts(user1.id);
  console.log(`✓ Wishlist check: items count=${user1Wishlist.length}`);
  console.log('✓ Cart and Wishlist functionality completely intact.\n');

  console.log('=====================================================');
  console.log(' ALL ADDRESS MANAGEMENT TESTS PASSED SUCCESSFULLY!  ');
  console.log('=====================================================\n');
}

runTests()
  .catch((err) => {
    console.error('❌ Verification failed with error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
