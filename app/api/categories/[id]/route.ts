import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Invalid category identifier.' }, { status: 400 });
    }

    const category = await prisma.category.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
    }

    const formatted = {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description ?? '',
      image: category.image ?? '',
      featured: category.featured,
      productCount: category._count.products,
    };

    return NextResponse.json({ category: formatted }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch category:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching category.' },
      { status: 500 }
    );
  }
}
