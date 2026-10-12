import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-utils';
import { cancelOrder } from '@/lib/orders';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to cancel this order.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Order ID is required.' }, { status: 400 });
    }

    const order = await cancelOrder(id, authUser.id);

    return NextResponse.json(
      {
        success: true,
        message: 'Order cancelled successfully. Stock has been restored.',
        order,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Failed to cancel order:', error);
    const message = error?.message || 'Failed to cancel order.';
    const statusCode =
      message.includes('not found')
        ? 404
        : message.includes('permission')
        ? 403
        : message.includes('eligible') || message.includes('already')
        ? 400
        : 500;

    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
