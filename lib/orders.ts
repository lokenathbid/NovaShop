import { prisma } from '@/lib/prisma';
import type { Order, OrderItem, ShippingAddress, OrderStatus, PaymentStatus, PaymentMethod } from '@/types';

/**
 * Decimal-safe rounding for currency amounts to 2 decimal places.
 */
export function roundCurrency(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export interface OrderCalculationInput {
  items: {
    price: number;
    originalPrice?: number | null;
    quantity: number;
  }[];
  deliveryMethod?: 'standard' | 'express' | 'overnight';
}

export interface CalculatedOrderTotals {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
}

/**
 * Calculates order totals based on server-verified prices.
 * Shipping rules:
 * - standard: Free for subtotal > 999, else 99
 * - express: 149
 * - overnight: 299
 * Tax rules:
 * - Default standard is 0.00 (All prices are retail MRP inclusive of GST)
 */
export function calculateOrderTotals({
  items,
  deliveryMethod = 'standard',
}: OrderCalculationInput): CalculatedOrderTotals {
  const subtotal = roundCurrency(
    items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  );

  const discount = roundCurrency(
    items.reduce((acc, item) => {
      const orig = item.originalPrice ?? item.price;
      const diff = Math.max(0, orig - item.price);
      return acc + diff * item.quantity;
    }, 0)
  );

  let shipping = 0;
  if (deliveryMethod === 'express') {
    shipping = 149;
  } else if (deliveryMethod === 'overnight') {
    shipping = 299;
  } else {
    // standard
    shipping = subtotal > 999 || subtotal === 0 ? 0 : 99;
  }

  // Tax: Configurable default (standard inclusive pricing)
  const tax = 0;

  const total = roundCurrency(subtotal + shipping + tax);

  return {
    subtotal,
    discount,
    shipping,
    tax,
    total,
  };
}

/**
 * Formats a raw database order into the typed Order interface.
 */
export function formatOrderData(rawOrder: any): Order {
  if (!rawOrder) throw new Error('Order not found');

  const shippingAddress: ShippingAddress =
    typeof rawOrder.shippingAddress === 'string'
      ? JSON.parse(rawOrder.shippingAddress)
      : rawOrder.shippingAddress;

  const items: OrderItem[] = (rawOrder.items || []).map((item: any) => ({
    id: item.id,
    orderId: item.orderId,
    productId: item.productId,
    productName: item.productName,
    productImage: item.productImage,
    variant: item.variant ?? undefined,
    quantity: item.quantity,
    price: roundCurrency(item.price),
    originalPrice: item.originalPrice != null ? roundCurrency(item.originalPrice) : undefined,
  }));

  const payments: any[] = (rawOrder.payments || []).map((p: any) => ({
    id: p.id,
    orderId: p.orderId,
    razorpayOrderId: p.razorpayOrderId,
    razorpayPaymentId: p.razorpayPaymentId ?? null,
    razorpaySignature: p.razorpaySignature ?? null,
    amount: roundCurrency(p.amount),
    currency: p.currency,
    status: p.status,
    method: p.method ?? null,
    errorMessage: p.errorMessage ?? null,
    idempotencyKey: p.idempotencyKey ?? null,
    metadata: p.metadata ?? null,
    createdAt: new Date(p.createdAt).toISOString(),
    updatedAt: new Date(p.updatedAt).toISOString(),
  }));

  return {
    id: rawOrder.id,
    userId: rawOrder.userId,
    status: rawOrder.status as OrderStatus,
    paymentStatus: rawOrder.paymentStatus as PaymentStatus,
    paymentMethod: rawOrder.paymentMethod as PaymentMethod,
    shippingAddress,
    subtotal: roundCurrency(rawOrder.subtotal),
    discount: roundCurrency(rawOrder.discount ?? 0),
    shipping: roundCurrency(rawOrder.shipping ?? 0),
    tax: roundCurrency(rawOrder.tax ?? 0),
    total: roundCurrency(rawOrder.total),
    idempotencyKey: rawOrder.idempotencyKey ?? undefined,
    razorpayOrderId: rawOrder.razorpayOrderId ?? undefined,
    razorpayPaymentId: rawOrder.razorpayPaymentId ?? undefined,
    razorpaySignature: rawOrder.razorpaySignature ?? undefined,
    payments: payments.length > 0 ? payments : undefined,
    estimatedDelivery: rawOrder.estimatedDelivery
      ? new Date(rawOrder.estimatedDelivery).toISOString()
      : undefined,
    trackingNumber: rawOrder.trackingNumber ?? undefined,
    items,
    createdAt: new Date(rawOrder.createdAt).toISOString(),
    updatedAt: new Date(rawOrder.updatedAt).toISOString(),
  };
}

export interface CreateOrderParams {
  userId: string;
  addressId?: string;
  shippingAddress?: Partial<ShippingAddress>;
  deliveryMethod?: 'standard' | 'express' | 'overnight';
  paymentMethod?: 'card' | 'upi' | 'cod';
  idempotencyKey?: string;
}

/**
 * Validates shipping address payload.
 */
function validateAddressSnapshot(addr: any): ShippingAddress {
  if (!addr || typeof addr !== 'object') {
    throw new Error('A valid delivery address is required.');
  }

  const { fullName, phone, addressLine1, addressLine2, landmark, city, state, zipCode, country } = addr;

  if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
    throw new Error('Full Name is required for the delivery address.');
  }
  if (!phone || typeof phone !== 'string' || !phone.trim()) {
    throw new Error('Phone number is required for the delivery address.');
  }
  if (!addressLine1 || typeof addressLine1 !== 'string' || !addressLine1.trim()) {
    throw new Error('Address Line 1 is required.');
  }
  if (!city || typeof city !== 'string' || !city.trim()) {
    throw new Error('City is required.');
  }
  if (!state || typeof state !== 'string' || !state.trim()) {
    throw new Error('State is required.');
  }
  if (!zipCode || typeof zipCode !== 'string' || !zipCode.trim()) {
    throw new Error('ZIP / PIN code is required.');
  }

  return {
    fullName: fullName.trim(),
    phone: phone.trim(),
    addressLine1: addressLine1.trim(),
    addressLine2: addressLine2?.trim() || null,
    landmark: landmark?.trim() || null,
    city: city.trim(),
    state: state.trim(),
    zipCode: zipCode.trim(),
    country: (country || 'India').trim(),
  };
}

/**
 * Places an order from the user's active cart in the database.
 * Executes within an atomic transaction with conditional inventory updates.
 */
export async function createOrderFromCart({
  userId,
  addressId,
  shippingAddress: customAddress,
  deliveryMethod = 'standard',
  paymentMethod = 'card',
  idempotencyKey,
}: CreateOrderParams): Promise<{ order: Order; isDuplicate: boolean }> {
  // 1. Check idempotency protection if key provided
  if (idempotencyKey) {
    const existing = await prisma.order.findUnique({
      where: { idempotencyKey },
      include: { items: true },
    });

    if (existing) {
      if (existing.userId !== userId) {
        throw new Error('Idempotency key does not match this account.');
      }
      return { order: formatOrderData(existing), isDuplicate: true };
    }
  }

  // 2. Fetch user's cart
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: { images: true },
          },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error('Your cart is empty. Please add items before checking out.');
  }

  // 3. Resolve shipping address snapshot
  let finalAddress: ShippingAddress;
  if (addressId) {
    const savedAddress = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!savedAddress) {
      throw new Error('Selected address was not found in your account.');
    }
    finalAddress = {
      fullName: savedAddress.fullName,
      phone: savedAddress.phone,
      addressLine1: savedAddress.addressLine1,
      addressLine2: savedAddress.addressLine2,
      landmark: savedAddress.landmark,
      city: savedAddress.city,
      state: savedAddress.state,
      zipCode: savedAddress.zipCode,
      country: savedAddress.country,
    };
  } else if (customAddress) {
    finalAddress = validateAddressSnapshot(customAddress);
  } else {
    // Check if user has a default address
    const defaultAddress = await prisma.address.findFirst({
      where: { userId, isDefault: true },
    });
    if (defaultAddress) {
      finalAddress = {
        fullName: defaultAddress.fullName,
        phone: defaultAddress.phone,
        addressLine1: defaultAddress.addressLine1,
        addressLine2: defaultAddress.addressLine2,
        landmark: defaultAddress.landmark,
        city: defaultAddress.city,
        state: defaultAddress.state,
        zipCode: defaultAddress.zipCode,
        country: defaultAddress.country,
      };
    } else {
      throw new Error('Please select or provide a shipping address.');
    }
  }

  // 4. Verify stock and calculate totals using trusted database product prices
  const itemsCalculationData = cart.items.map((item) => {
    if (!item.product) {
      throw new Error(`Product not found for item ${item.productId}`);
    }
    if (!item.product.inStock) {
      throw new Error(`"${item.product.name}" is currently out of stock.`);
    }
    if (item.product.stockCount < item.quantity) {
      throw new Error(
        `Insufficient stock for "${item.product.name}". Only ${item.product.stockCount} available, but ${item.quantity} requested.`
      );
    }
    return {
      price: item.product.price,
      originalPrice: item.product.originalPrice,
      quantity: item.quantity,
    };
  });

  const totals = calculateOrderTotals({
    items: itemsCalculationData,
    deliveryMethod,
  });

  // Calculate estimated delivery
  const now = new Date();
  const deliveryDays = deliveryMethod === 'overnight' ? 1 : deliveryMethod === 'express' ? 3 : 5;
  const estimatedDelivery = new Date(now.getTime() + deliveryDays * 24 * 60 * 60 * 1000);

  // Generate tracking number
  const trackingNumber = `NOVA${Date.now().toString().slice(-8)}${Math.random()
    .toString(36)
    .substring(2, 5)
    .toUpperCase()}IN`;

  // Payment status: Unpaid or Pending (No real payment gateway in Part 7)
  const initialPaymentStatus: PaymentStatus =
    paymentMethod === 'cod' ? 'unpaid' : 'pending';

  // 5. Atomic Transaction: Conditional stock decrement + Order creation + Cart clearing
  try {
    const createdOrder = await prisma.$transaction(async (tx) => {
      // a. Conditionally update stock for each product (prevents overselling concurrently)
      for (const item of cart.items) {
        const updateCount = await tx.$executeRaw`
          UPDATE \`Product\`
          SET \`stockCount\` = \`stockCount\` - ${item.quantity},
              \`inStock\` = IF(\`stockCount\` - ${item.quantity} <= 0, FALSE, \`inStock\`)
          WHERE \`id\` = ${item.productId} AND \`stockCount\` >= ${item.quantity}
        `;

        if (updateCount === 0) {
          throw new Error(
            `Insufficient stock for "${item.product.name}". The remaining stock was just purchased by another customer.`
          );
        }
      }

      // b. Create Order
      const newOrder = await tx.order.create({
        data: {
          userId,
          status: 'processing',
          paymentStatus: initialPaymentStatus,
          paymentMethod,
          shippingAddress: finalAddress as any,
          subtotal: totals.subtotal,
          discount: totals.discount,
          shipping: totals.shipping,
          tax: totals.tax,
          total: totals.total,
          estimatedDelivery,
          trackingNumber,
          idempotencyKey: idempotencyKey || null,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              productName: item.product.name,
              productImage:
                item.product.images[0]?.url ||
                'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
              variant: item.variant || null,
              quantity: item.quantity,
              price: item.product.price,
              originalPrice: item.product.originalPrice || null,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // c. Clear items from the user's cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    return { order: formatOrderData(createdOrder), isDuplicate: false };
  } catch (error: any) {
    // If caught duplicate idempotency key constraint error (P2002)
    if (error?.code === 'P2002' && idempotencyKey) {
      const existing = await prisma.order.findUnique({
        where: { idempotencyKey },
        include: { items: true },
      });
      if (existing) {
        return { order: formatOrderData(existing), isDuplicate: true };
      }
    }
    throw error;
  }
}

/**
 * Retrieves all orders for the specified user.
 */
export async function getUserOrders(userId: string): Promise<Order[]> {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: { items: true, payments: true },
    orderBy: { createdAt: 'desc' },
  });

  return orders.map(formatOrderData);
}

/**
 * Retrieves a single order by ID, verifying user ownership.
 */
export async function getOrderById(orderId: string, userId?: string): Promise<Order | null> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, payments: true },
  });

  if (!order) return null;

  // Strict ownership isolation
  if (userId && order.userId !== userId) {
    return null;
  }

  return formatOrderData(order);
}

const CANCELLABLE_STATUSES: OrderStatus[] = ['pending', 'processing', 'confirmed'];

/**
 * Cancels an eligible order and safely restores product inventory exactly once.
 */
export async function cancelOrder(orderId: string, userId: string): Promise<Order> {
  const existingOrder = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!existingOrder) {
    throw new Error('Order not found.');
  }

  if (existingOrder.userId !== userId) {
    throw new Error('You do not have permission to cancel this order.');
  }

  if (existingOrder.status === 'cancelled') {
    throw new Error('This order has already been cancelled.');
  }

  if (!CANCELLABLE_STATUSES.includes(existingOrder.status as OrderStatus)) {
    throw new Error(
      `Order cannot be cancelled because it is already ${existingOrder.status.replace(/_/g, ' ')}.`
    );
  }

  // Atomic transaction: conditionally update order status + restore stock exactly once
  const updated = await prisma.$transaction(async (tx) => {
    // 1. Atomic status transition: will match ONLY if status is still in cancellable list
    const updateResult = await tx.order.updateMany({
      where: {
        id: orderId,
        userId,
        status: { in: CANCELLABLE_STATUSES },
      },
      data: {
        status: 'cancelled',
        paymentStatus: existingOrder.paymentStatus === 'paid' ? 'refunded' : 'cancelled',
      },
    });

    if (updateResult.count === 0) {
      throw new Error('Order is no longer eligible for cancellation.');
    }

    // 2. Safely restore product stock
    for (const item of existingOrder.items) {
      await tx.$executeRaw`
        UPDATE \`Product\`
        SET \`stockCount\` = \`stockCount\` + ${item.quantity},
            \`inStock\` = TRUE
        WHERE \`id\` = ${item.productId}
      `;
    }

    // 3. Return updated order
    const freshOrder = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true, payments: true },
    });

    return freshOrder!;
  });

  return formatOrderData(updated);
}
