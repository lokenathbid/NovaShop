import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-utils';
import {
  getUserAddresses,
  getUserDefaultAddress,
  createAddress,
  validateAndNormalizeAddressInput,
} from '@/lib/addresses';

/**
 * GET /api/account/addresses
 * List all saved addresses for the authenticated user, or get the default address with ?default=true
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to access your addresses.' },
        { status: 401 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const isDefaultOnly = searchParams.get('default') === 'true';

    if (isDefaultOnly) {
      const defaultAddress = await getUserDefaultAddress(user.id);
      return NextResponse.json({ address: defaultAddress }, { status: 200 });
    }

    const addresses = await getUserAddresses(user.id);
    return NextResponse.json({ addresses }, { status: 200 });
  } catch (error) {
    console.error('Failed to get addresses:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching addresses.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/account/addresses
 * Create a new address for the authenticated user
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to add an address.' },
        { status: 401 }
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

    const created = await createAddress(user.id, validation.data);

    return NextResponse.json(
      {
        message: 'Address saved successfully.',
        address: created,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create address:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while saving the address.' },
      { status: 500 }
    );
  }
}
