import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    const formatted = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? '',
      image: cat.image ?? '',
      featured: cat.featured,
      productCount: cat._count.products,
    }));

    return NextResponse.json({ categories: formatted }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching categories.' },
      { status: 500 }
    );
  }
}
