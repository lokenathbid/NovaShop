'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  ArrowRight,
  Loader2,
  AlertCircle,
  XCircle,
  Calendar,
  Clock,
  CheckCircle2,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

const statusConfig: Record<
  OrderStatus,
  { label: string; variant: 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'ghost' }
> = {
  pending: { label: 'Pending', variant: 'warning' },
  processing: { label: 'Processing', variant: 'warning' },
  confirmed: { label: 'Confirmed', variant: 'primary' },
  shipped: { label: 'Shipped', variant: 'accent' },
  out_for_delivery: { label: 'Out for Delivery', variant: 'accent' },
  delivered: { label: 'Delivered', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'danger' },
  returned: { label: 'Returned', variant: 'ghost' },
};

function OrderItemThumb({ src, alt }: { src: string; alt: string }) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-white/10 flex items-center justify-center text-indigo-400 flex-shrink-0">
        <Package size={20} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className="w-12 h-12 rounded-xl object-cover bg-white/5 border border-white/10 flex-shrink-0"
    />
  );
}

export default function OrdersPage() {
  const { data: session, status: authStatus } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cancellation state
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);
  const [cancelActionLoading, setCancelActionLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/orders');
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/login?callbackUrl=/orders';
          return;
        }
        throw new Error('Failed to load orders.');
      }
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError('Could not load your orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authStatus === 'authenticated') {
      fetchOrders();
    } else if (authStatus === 'unauthenticated') {
      setLoading(false);
    }
  }, [authStatus]);

  const handleCancelOrder = async () => {
    if (!cancelModalOrder) return;

    try {
      setCancelActionLoading(true);
      setCancelError(null);

      const res = await fetch(`/api/orders/${cancelModalOrder.id}/cancel`, {
        method: 'POST',
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to cancel order.');
      }

      // Update local orders list
      setOrders((prev) =>
        prev.map((o) => (o.id === cancelModalOrder.id ? data.order : o))
      );
      setCancelModalOrder(null);
    } catch (err: any) {
      console.error('Cancel order error:', err);
      setCancelError(err?.message || 'Failed to cancel order.');
    } finally {
      setCancelActionLoading(false);
    }
  };

  if (authStatus === 'unauthenticated') {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="glass rounded-3xl border border-white/8 p-8 sm:p-12">
          <Package size={48} className="text-slate-600 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-white mb-2">Sign in to View Orders</h2>
          <p className="text-slate-400 text-sm mb-6">
            Please log in to your NovaShop account to see your order history and track shipments.
          </p>
          <Link href="/login?callbackUrl=/orders">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white mb-1">My Orders</h1>
          <p className="text-slate-400 text-sm">
            Track shipments, review past purchases, or manage cancellations
          </p>
        </div>
        <Link href="/shop" className="text-sm text-indigo-400 hover:text-indigo-300">
          Continue Shopping →
        </Link>
      </div>

      {loading ? (
        <div className="glass rounded-2xl border border-white/8 p-16 flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="animate-spin text-indigo-400 mb-3" size={32} />
          <p className="text-slate-400 text-sm">Loading your orders...</p>
        </div>
      ) : error ? (
        <div className="glass rounded-2xl border border-red-500/20 p-8 flex items-center gap-4 text-red-400 mb-6">
          <AlertCircle size={24} className="flex-shrink-0" />
          <div>
            <p className="font-medium">{error}</p>
            <button
              onClick={fetchOrders}
              className="mt-2 text-xs text-indigo-400 hover:underline"
            >
              Retry
            </button>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="glass rounded-2xl border border-white/8 text-center py-20 px-4">
          <Package size={48} className="text-slate-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-1">No orders found</h3>
          <p className="text-slate-400 text-sm mb-6">
            You haven't placed any orders yet. Discover our latest collection today!
          </p>
          <Link href="/shop">
            <Button>Start Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order, i) => {
            const isCancellable = ['pending', 'processing', 'confirmed'].includes(order.status);
            const statusInfo = statusConfig[order.status] || {
              label: order.status,
              variant: 'primary',
            };

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl border border-white/8 p-5 sm:p-6"
              >
                <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-slate-500">Order</span>
                      <span className="font-mono text-sm font-semibold text-white">
                        {order.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Calendar size={13} /> {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    <span
                      className={`text-xs capitalize font-medium ${
                        order.paymentStatus === 'paid'
                          ? 'text-emerald-400'
                          : order.paymentStatus === 'refunded'
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }`}
                    >
                      Payment: {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Items preview */}
                <div className="flex items-center gap-3 mb-4 overflow-x-auto pb-2 pt-1 border-t border-b border-white/6">
                  {order.items.map((item) => (
                    <div
                      key={item.id || item.productId}
                      className="flex-shrink-0 flex items-center gap-2.5 bg-white/[0.02] p-2 rounded-xl border border-white/6"
                    >
                      <OrderItemThumb src={item.productImage} alt={item.productName} />
                      <div className="min-w-0">
                        <p className="text-xs text-white font-medium line-clamp-1 max-w-[140px]">
                          {item.productName}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Qty: {item.quantity} • {formatCurrency(item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 flex-wrap gap-3">
                  <div>
                    <span className="text-xs text-slate-400">Total: </span>
                    <span className="text-white font-bold text-lg">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {isCancellable && (
                      <button
                        onClick={() => setCancelModalOrder(order)}
                        className="text-xs text-red-400 hover:text-red-300 font-medium px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 transition-colors"
                      >
                        Cancel Order
                      </button>
                    )}
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="secondary" size="sm" rightIcon={<ArrowRight size={14} />}>
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      <AnimatePresence>
        {cancelModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass rounded-2xl border border-white/10 p-6 max-w-md w-full"
            >
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4">
                <RotateCcw size={24} />
              </div>

              <h3 className="font-display text-lg font-bold text-white mb-2">
                Cancel Order {cancelModalOrder.id}?
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                Are you sure you want to cancel this order? Reserved stock for all items will be restored to inventory. This action cannot be reversed.
              </p>

              {cancelError && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  {cancelError}
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCancelModalOrder(null);
                    setCancelError(null);
                  }}
                  disabled={cancelActionLoading}
                >
                  Keep Order
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleCancelOrder}
                  disabled={cancelActionLoading}
                  leftIcon={
                    cancelActionLoading ? (
                      <Loader2 className="animate-spin" size={14} />
                    ) : (
                      <XCircle size={14} />
                    )
                  }
                >
                  {cancelActionLoading ? 'Cancelling...' : 'Confirm Cancellation'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
