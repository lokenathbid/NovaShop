import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-utils';
import { setDefaultAddress } from '@/lib/addresses';

interface RouteProps {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/account/addresses/[id]/default
 * Sets the specified address as the default address for the authenticated user.
 */
export async function POST(req: NextRequest, props: RouteProps) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to update address settings.' },
        { status: 401 }
      );
    }

    const { id } = await props.params;
    if (!id) {
      return NextResponse.json({ error: 'Address ID is required.' }, { status: 400 });
    }

    const updated = await setDefaultAddress(user.id, id);
    if (!updated) {
      return NextResponse.json(
        { error: 'Address not found or you do not have permission to modify it.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Default address updated successfully.',
        address: updated,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to set default address:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while setting default address.' },
      { status: 500 }
    );
  }
}
