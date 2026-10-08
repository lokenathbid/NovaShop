import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to access your account.' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        createdAt: true,
        addresses: {
          select: {
            id: true,
            label: true,
            fullName: true,
            phone: true,
            addressLine1: true,
            addressLine2: true,
            city: true,
            state: true,
            zipCode: true,
            country: true,
            isDefault: true,
          },
        },
        orders: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            status: true,
            total: true,
            createdAt: true,
            items: {
              select: {
                id: true,
                productId: true,
                productName: true,
                productImage: true,
                quantity: true,
                price: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch account profile:', error);
    return NextResponse.json(
      { error: 'Something went wrong fetching account details.' },
      { status: 500 }
    );
  }
}
