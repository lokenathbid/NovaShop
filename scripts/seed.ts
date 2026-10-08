import { prisma } from '../lib/prisma';
import { categories } from '../data/categories';
import { products } from '../data/products';
import { reviews } from '../data/reviews';

async function main() {
  console.log('--- SEEDING DATABASE ---');

  // 1. Seed Categories
  console.log('Seeding categories...');
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        image: cat.image,
        featured: cat.featured ?? false,
      },
      create: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
        featured: cat.featured ?? false,
      },
    });
  }
  console.log(`Seeded ${categories.length} categories.`);

  // 2. Ensure reviewer user exists for foreign key constraint
  const defaultReviewer = await prisma.user.upsert({
    where: { email: 'reviewer@novashop.com' },
    update: {},
    create: {
      id: 'reviewer-user-001',
      name: 'NovaShop Reviewer',
      email: 'reviewer@novashop.com',
      role: 'customer',
    },
  });

  // 3. Seed Products
  console.log('Seeding products...');
  for (const prod of products) {
    // Upsert product
    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {
        name: prod.name,
        categorySlug: prod.categorySlug,
        brand: prod.brand,
        shortDescription: prod.shortDescription,
        description: prod.description,
        price: prod.price,
        originalPrice: prod.originalPrice ?? null,
        discountPercentage: prod.discountPercentage ?? null,
        rating: prod.rating,
        reviewCount: prod.reviewCount,
        inStock: prod.inStock,
        stockCount: prod.stockCount ?? 100,
        isFeatured: prod.isFeatured ?? false,
        isNew: prod.isNew ?? false,
        isBestseller: prod.isBestseller ?? false,
        isTrending: prod.isTrending ?? false,
        tags: Array.isArray(prod.tags) ? prod.tags.join(',') : '',
        shippingInfo: prod.shippingInfo ?? null,
        returnInfo: prod.returnInfo ?? null,
      },
      create: {
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        categorySlug: prod.categorySlug,
        brand: prod.brand,
        shortDescription: prod.shortDescription,
        description: prod.description,
        price: prod.price,
        originalPrice: prod.originalPrice ?? null,
        discountPercentage: prod.discountPercentage ?? null,
        rating: prod.rating,
        reviewCount: prod.reviewCount,
        inStock: prod.inStock,
        stockCount: prod.stockCount ?? 100,
        isFeatured: prod.isFeatured ?? false,
        isNew: prod.isNew ?? false,
        isBestseller: prod.isBestseller ?? false,
        isTrending: prod.isTrending ?? false,
        tags: Array.isArray(prod.tags) ? prod.tags.join(',') : '',
        shippingInfo: prod.shippingInfo ?? null,
        returnInfo: prod.returnInfo ?? null,
      },
    });

    // Delete existing relation records to prevent duplicates during re-seeding
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productSpecification.deleteMany({ where: { productId: prod.id } });

    // Seed images
    if (prod.images && prod.images.length > 0) {
      await prisma.productImage.createMany({
        data: prod.images.map((img) => ({
          productId: prod.id,
          url: img.url,
          alt: img.alt,
        })),
      });
    }

    // Seed variants
    if (prod.variants && prod.variants.length > 0) {
      await prisma.productVariant.createMany({
        data: prod.variants.map((v) => ({
          productId: prod.id,
          name: v.name,
          value: v.value,
          type: v.type,
          inStock: v.inStock,
          priceModifier: v.priceModifier ?? 0,
        })),
      });
    }

    // Seed specifications
    if (prod.specifications && prod.specifications.length > 0) {
      await prisma.productSpecification.createMany({
        data: prod.specifications.map((spec) => ({
          productId: prod.id,
          label: spec.label,
          value: spec.value,
        })),
      });
    }
  }
  console.log(`Seeded ${products.length} products with images, variants, and specifications.`);

  // 4. Seed Reviews
  console.log('Seeding reviews...');
  for (const rev of reviews) {
    // Check if the product exists
    if (rev.productId) {
      const prodExists = await prisma.product.findUnique({ where: { id: rev.productId } });
      if (prodExists) {
        await prisma.review.upsert({
          where: { id: rev.id },
          update: {
            rating: rev.rating,
            title: rev.title,
            content: rev.content,
            helpful: rev.helpful,
            verified: rev.verified,
          },
          create: {
            id: rev.id,
            productId: rev.productId,
            userId: defaultReviewer.id,
            userName: rev.userName,
            userAvatar: rev.userAvatar ?? null,
            rating: rev.rating,
            title: rev.title,
            content: rev.content,
            helpful: rev.helpful,
            verified: rev.verified,
            createdAt: new Date(rev.date),
          },
        });
      }
    }

  }
  console.log(`Seeded reviews.`);
  console.log('--- DATABASE SEEDING COMPLETED ---');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });
