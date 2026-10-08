import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/lib/generated/prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse and sanitize pagination
    const pageParam = parseInt(searchParams.get('page') || '1', 10);
    const limitParam = parseInt(searchParams.get('limit') || '12', 10);
    const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
    const limit = isNaN(limitParam) || limitParam < 1 ? 12 : Math.min(limitParam, 50);
    const skip = (page - 1) * limit;

    // Filters
    const search = searchParams.get('search')?.trim() || '';
    const category = searchParams.get('category')?.trim() || '';
    const brand = searchParams.get('brand')?.trim() || '';
    const minPriceParam = searchParams.get('minPrice');
    const maxPriceParam = searchParams.get('maxPrice');
    const ratingParam = searchParams.get('rating');
    const featuredParam = searchParams.get('featured');
    const sortParam = searchParams.get('sort') || 'featured';

    const where: Prisma.ProductWhereInput = {};

    // Category filter
    if (category && category !== 'all') {
      if (category.includes(',')) {
        const slugs = category.split(',').map((s) => s.trim()).filter(Boolean);
        where.categorySlug = { in: slugs };
      } else {
        where.categorySlug = category;
      }
    }

    // Brand filter
    if (brand) {
      if (brand.includes(',')) {
        const brands = brand.split(',').map((b) => b.trim()).filter(Boolean);
        where.brand = { in: brands };
      } else {
        where.brand = brand;
      }
    }

    // Search filter (searches across name, description, brand, and tags)
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { shortDescription: { contains: search } },
        { description: { contains: search } },
        { brand: { contains: search } },
        { tags: { contains: search } },
      ];
    }

    // Price range filter
    const minPrice = minPriceParam ? parseFloat(minPriceParam) : NaN;
    const maxPrice = maxPriceParam ? parseFloat(maxPriceParam) : NaN;
    if (!isNaN(minPrice) || !isNaN(maxPrice)) {
      where.price = {};
      if (!isNaN(minPrice) && minPrice >= 0) {
        where.price.gte = minPrice;
      }
      if (!isNaN(maxPrice) && maxPrice >= 0) {
        where.price.lte = maxPrice;
      }
    }

    // Rating filter
    const minRating = ratingParam ? parseFloat(ratingParam) : NaN;
    if (!isNaN(minRating) && minRating > 0) {
      where.rating = { gte: minRating };
    }

    // Featured filter
    if (featuredParam === 'true') {
      where.isFeatured = true;
    }

    // Safe sorting
    let orderBy: Prisma.ProductOrderByWithRelationInput[] = [];
    switch (sortParam) {
      case 'newest':
        orderBy = [{ createdAt: 'desc' }];
        break;
      case 'price_asc':
        orderBy = [{ price: 'asc' }];
        break;
      case 'price_desc':
        orderBy = [{ price: 'desc' }];
        break;
      case 'rating':
        orderBy = [{ rating: 'desc' }, { reviewCount: 'desc' }];
        break;
      case 'popular':
        orderBy = [{ reviewCount: 'desc' }, { rating: 'desc' }];
        break;
      case 'featured':
      default:
        orderBy = [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
        break;
    }

    // Database queries for count and paginated items
    const [total, products] = await prisma.$transaction([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          images: true,
          variants: true,
          specifications: true,
          category: {
            select: { name: true, slug: true },
          },
        },
      }),
    ]);

    // Format products matching frontend schema
    const formattedProducts = products.map((prod) => ({
      id: prod.id,
      name: prod.name,
      slug: prod.slug,
      category: prod.category.name,
      categorySlug: prod.categorySlug,
      brand: prod.brand,
      shortDescription: prod.shortDescription,
      description: prod.description,
      images: prod.images.map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
      })),
      price: prod.price,
      originalPrice: prod.originalPrice ?? undefined,
      discountPercentage: prod.discountPercentage ?? undefined,
      rating: prod.rating,
      reviewCount: prod.reviewCount,
      inStock: prod.inStock,
      stockCount: prod.stockCount,
      isFeatured: prod.isFeatured,
      isNew: prod.isNew,
      isBestseller: prod.isBestseller,
      isTrending: prod.isTrending,
      tags: prod.tags ? prod.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      variants: prod.variants.map((v) => ({
        id: v.id,
        name: v.name,
        value: v.value,
        type: v.type as 'color' | 'size' | 'storage' | 'material',
        inStock: v.inStock,
        priceModifier: v.priceModifier ?? undefined,
      })),
      specifications: prod.specifications.map((s) => ({
        label: s.label,
        value: s.value,
      })),
      shippingInfo: prod.shippingInfo ?? undefined,
      returnInfo: prod.returnInfo ?? undefined,
    }));

    return NextResponse.json(
      {
        products: formattedProducts,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to list products:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching products.' },
      { status: 500 }
    );
  }
}
