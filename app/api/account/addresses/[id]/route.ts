import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-utils';
import {
  getUserAddressById,
  updateAddress,
  deleteAddress,
  validateAndNormalizeAddressInput,
} from '@/lib/addresses';

interface RouteProps {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/account/addresses/[id]
 * Fetch a single address belonging to the authenticated user.
 */
export async function GET(req: NextRequest, props: RouteProps) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to access this address.' },
        { status: 401 }
      );
    }

    const { id } = await props.params;
    if (!id) {
      return NextResponse.json({ error: 'Address ID is required.' }, { status: 400 });
    }

    const address = await getUserAddressById(user.id, id);
    if (!address) {
      return NextResponse.json(
        { error: 'Address not found or you do not have permission to access it.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ address }, { status: 200 });
  } catch (error) {
    console.error('Failed to get address:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching the address.' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/account/addresses/[id]
 * Full or partial update of an address owned by the authenticated user.
 */
export async function PUT(req: NextRequest, props: RouteProps) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to update this address.' },
        { status: 401 }
      );
    }

    const { id } = await props.params;
    if (!id) {
      return NextResponse.json({ error: 'Address ID is required.' }, { status: 400 });
    }

    // Check ownership first
    const existing = await getUserAddressById(user.id, id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Address not found or you do not have permission to edit it.' },
        { status: 404 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body. JSON payload expected.' },
        { status: 400 }
      );
    }

    const validation = validateAndNormalizeAddressInput(body);
    if (!validation.isValid || !validation.data) {
      return NextResponse.json(
        {
          error: 'Validation failed. Please correct the highlighted errors.',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    const updated = await updateAddress(user.id, id, validation.data);
    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to update address. Address not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Address updated successfully.',
        address: updated,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to update address:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while updating the address.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/account/addresses/[id]
 * Alias to update for partial changes.
 */
export async function PATCH(req: NextRequest, props: RouteProps) {
  return PUT(req, props);
}

/**
 * DELETE /api/account/addresses/[id]
 * Deletes an address owned by the authenticated user.
 * Automatically chooses a sensible default policy if deleting the default address.
 */
export async function DELETE(req: NextRequest, props: RouteProps) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to delete this address.' },
        { status: 401 }
      );
    }

    const { id } = await props.params;
    if (!id) {
      return NextResponse.json({ error: 'Address ID is required.' }, { status: 400 });
    }

    const result = await deleteAddress(user.id, id);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Address not found or you do not have permission to delete it.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Address deleted successfully.',
        newDefaultId: result.newDefaultId ?? null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to delete address:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while deleting the address.' },
      { status: 500 }
    );
  }
}
