import { prisma } from '@/lib/prisma';
import { formatProductData } from '@/lib/cart';
import type { Product } from '@/types';

/**
 * Retrieves all wishlist products for a user, sorted by most recently added.
 */
export async function getUserWishlistProducts(userId: string): Promise<Product[]> {
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      product: {
        include: {
          category: true,
          images: true,
          variants: true,
        },
      },
    },
  });

  return items.map((item) => formatProductData(item.product));
}

/**
 * Adds a product to a user's wishlist.
 * Prevents duplicates by using upsert on the unique [userId, productId] compound key.
 */
export async function addProductToWishlist(
  userId: string,
  productId: string
): Promise<{ created: boolean; product: Product }> {
  // Verify product existence
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      category: true,
      images: true,
      variants: true,
    },
  });

  if (!product) {
    throw new Error('Product not found.');
  }

  // Check if item already exists to determine created status
  const existing = await prisma.wishlistItem.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  if (!existing) {
    await prisma.wishlistItem.create({
      data: {
        userId,
        productId,
      },
    });
  }

  return {
    created: !existing,
    product: formatProductData(product),
  };
}

/**
 * Removes a product from a user's wishlist.
 */
export async function removeProductFromWishlist(
  userId: string,
  productId: string
): Promise<{ deleted: boolean }> {
  try {
    await prisma.wishlistItem.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
    return { deleted: true };
  } catch {
    // If not found or already deleted, treat as cleanly removed
    return { deleted: false };
  }
}

/**
 * Clears all wishlist items for a user.
 */
export async function clearUserWishlist(userId: string): Promise<number> {
  const result = await prisma.wishlistItem.deleteMany({
    where: { userId },
  });
  return result.count;
}

/**
 * Merges guest items into an authenticated user's wishlist.
 * Any duplicate productIds are safely handled.
 */
export async function syncGuestWishlistItems(
  userId: string,
  productIds: string[]
): Promise<Product[]> {
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return getUserWishlistProducts(userId);
  }

  // Filter valid products from database that match productIds
  const validProducts = await prisma.product.findMany({
    where: {
      id: { in: productIds },
    },
    select: { id: true },
  });

  const validIds = validProducts.map((p) => p.id);

  // Bulk upsert / insert each safely
  for (const pid of validIds) {
    await prisma.wishlistItem.upsert({
      where: {
        userId_productId: {
          userId,
          productId: pid,
        },
      },
      create: {
        userId,
        productId: pid,
      },
      update: {},
    });
  }

  return getUserWishlistProducts(userId);
}
