import { prisma } from '@/lib/prisma';
import type { Cart, CartItem, Product } from '@/types';

function round(val: number): number {
  return Math.round(val * 100) / 100;
}

export function formatProductData(rawProduct: any): Product {
  return {
    id: rawProduct.id,
    name: rawProduct.name,
    slug: rawProduct.slug,
    category: rawProduct.category?.name ?? rawProduct.categorySlug,
    categorySlug: rawProduct.categorySlug,
    brand: rawProduct.brand,
    description: rawProduct.description ?? '',
    shortDescription: rawProduct.shortDescription ?? '',
    images: (rawProduct.images || []).map((img: any) => ({
      id: img.id,
      url: img.url,
      alt: img.alt ?? rawProduct.name,
    })),
    price: rawProduct.price,
    originalPrice: rawProduct.originalPrice ?? undefined,
    discountPercentage: rawProduct.discountPercentage ?? undefined,
    rating: rawProduct.rating ?? 0,
    reviewCount: rawProduct.reviewCount ?? 0,
    inStock: rawProduct.inStock,
    stockCount: rawProduct.stockCount,
    isFeatured: rawProduct.isFeatured ?? false,
    isNew: rawProduct.isNew ?? false,
    isBestseller: rawProduct.isBestseller ?? false,
    isTrending: rawProduct.isTrending ?? false,
    tags: rawProduct.tags
      ? rawProduct.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
      : [],
    variants: (rawProduct.variants || []).map((v: any) => ({
      id: v.id,
      name: v.name,
      value: v.value,
      type: v.type,
      inStock: v.inStock,
      priceModifier: v.priceModifier ?? undefined,
    })),
    shippingInfo: rawProduct.shippingInfo ?? undefined,
    returnInfo: rawProduct.returnInfo ?? undefined,
  };
}

export function formatCartData(cart: any): Cart {
  if (!cart) {
    return {
      id: undefined,
      items: [],
      itemCount: 0,
      subtotal: 0,
      discount: 0,
      shipping: 0,
      total: 0,
    };
  }

  const items: CartItem[] = (cart.items || []).map((item: any) => {
    const formattedProd = formatProductData(item.product);
    return {
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      variant: item.variant ?? undefined,
      selectedVariants: (item.selectedVariants as Record<string, string>) || undefined,
      product: formattedProd,
    };
  });

  const itemCount = items.reduce((acc, i) => acc + i.quantity, 0);

  const subtotal = round(
    items.reduce((acc, i) => acc + i.product.price * i.quantity, 0)
  );

  const discount = round(
    items.reduce(
      (acc, i) =>
        acc + ((i.product.originalPrice ?? i.product.price) - i.product.price) * i.quantity,
      0
    )
  );

  const shipping = subtotal > 999 || subtotal === 0 ? 0 : 99;
  const total = round(subtotal + shipping);

  return {
    id: cart.id,
    items,
    itemCount,
    subtotal,
    discount,
    shipping,
    total,
  };
}

export async function getUserCartWithDetails(userId: string): Promise<Cart> {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: true,
              variants: true,
              category: { select: { name: true, slug: true } },
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  return formatCartData(cart);
}
