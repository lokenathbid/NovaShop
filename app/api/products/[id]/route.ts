import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Invalid product identifier.' }, { status: 400 });
    }

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        images: true,
        variants: true,
        specifications: true,
        category: {
          select: { name: true, slug: true },
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            userName: true,
            userAvatar: true,
            rating: true,
            title: true,
            content: true,
            verified: true,
            helpful: true,
            createdAt: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    const formattedProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      category: product.category.name,
      categorySlug: product.categorySlug,
      brand: product.brand,
      shortDescription: product.shortDescription,
      description: product.description,
      images: product.images.map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
      })),
      price: product.price,
      originalPrice: product.originalPrice ?? undefined,
      discountPercentage: product.discountPercentage ?? undefined,
      rating: product.rating,
      reviewCount: product.reviewCount,
      inStock: product.inStock,
      stockCount: product.stockCount,
      isFeatured: product.isFeatured,
      isNew: product.isNew,
      isBestseller: product.isBestseller,
      isTrending: product.isTrending,
      tags: product.tags ? product.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      variants: product.variants.map((v) => ({
        id: v.id,
        name: v.name,
        value: v.value,
        type: v.type as 'color' | 'size' | 'storage' | 'material',
        inStock: v.inStock,
        priceModifier: v.priceModifier ?? undefined,
      })),
      specifications: product.specifications.map((s) => ({
        label: s.label,
        value: s.value,
      })),
      shippingInfo: product.shippingInfo ?? undefined,
      returnInfo: product.returnInfo ?? undefined,
      reviews: product.reviews.map((r) => ({
        id: r.id,
        userName: r.userName,
        userAvatar: r.userAvatar ?? undefined,
        rating: r.rating,
        title: r.title,
        content: r.content,
        verified: r.verified,
        helpful: r.helpful,
        date: r.createdAt.toISOString().split('T')[0],
      })),
    };

    return NextResponse.json({ product: formattedProduct }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch product details:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching product details.' },
      { status: 500 }
    );
  }
}
