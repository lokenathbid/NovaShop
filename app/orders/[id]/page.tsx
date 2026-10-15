'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Check,
  Package,
  Truck,
  Home,
  Clock,
  Loader2,
  AlertCircle,
  RotateCcw,
  CheckCircle,
  XCircle,
  ShieldCheck,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { openRazorpayCheckout, isRazorpayClientConfigured } from '@/lib/razorpay-client';
import { restoreBodyScroll } from '@/lib/scroll-lock';

const TIMELINE_STEPS: { status: OrderStatus; label: string; icon: React.ElementType }[] = [
  { status: 'processing', label: 'Order Placed', icon: Package },
  { status: 'confirmed', label: 'Confirmed', icon: Check },
  { status: 'shipped', label: 'Shipped', icon: Truck },
  { status: 'out_for_delivery', label: 'Out for Delivery', icon: Clock },
  { status: 'delivered', label: 'Delivered', icon: Home },
];

const STATUS_ORDER: OrderStatus[] = [
  'processing',
  'confirmed',
  'shipped',
  'out_for_delivery',
  'delivered',
];

function getStepIndex(status: OrderStatus): number {
  return STATUS_ORDER.indexOf(status);
}

const statusVariant: Record<
  OrderStatus,
  'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'ghost'
> = {
  pending: 'warning',
  processing: 'warning',
  confirmed: 'primary',
  shipped: 'accent',
  out_for_delivery: 'accent',
  delivered: 'success',
  cancelled: 'danger',
  returned: 'ghost',
};

function OrderItemDetailThumb({ src, alt }: { src: string; alt: string }) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div className="w-16 h-16 rounded-xl bg-indigo-500/10 border border-white/10 flex items-center justify-center text-indigo-400 flex-shrink-0">
        <Package size={24} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className="w-16 h-16 rounded-xl flex-shrink-0 object-cover bg-white/5 border border-white/10"
    />
  );
}

export default function OrderDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const isNewlyConfirmed = searchParams.get('confirmed') === 'true';

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cancellation state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Payment retry & verification state
  const [paying, setPaying] = useState(false);
  const [paymentActionError, setPaymentActionError] = useState<string | null>(null);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchOrder() {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/orders/${id}`);
        if (!res.ok) {
          if (res.status === 401) {
            window.location.href = `/login?callbackUrl=/orders/${id}`;
            return;
          }
          if (res.status === 404 || res.status === 403) {
            throw new Error('Order not found or you do not have permission to view it.');
          }
          throw new Error('Failed to load order details.');
        }
        const data = await res.json();
        if (isMounted) {
          setOrder(data.order);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Could not load order details.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchOrder();
    return () => {
      isMounted = false;
      restoreBodyScroll();
    };
  }, [id]);

  const handleRetryPayment = async () => {
    if (!order) return;
    try {
      setPaying(true);
      setPaymentActionError(null);
      setPaymentSuccessMsg(null);

      // Pre-flight check for client credentials
      if (!isRazorpayClientConfigured()) {
        throw new Error(
          'Razorpay Test Mode credentials are not configured. Please set NEXT_PUBLIC_RAZORPAY_KEY_ID, RAZORPAY_KEY_ID, and RAZORPAY_KEY_SECRET in your environment variables.'
        );
      }

      // 1. Create or retrieve gateway order
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initiate payment.');
      }

      // Validate gateway response
      const { keyId, razorpayOrderId, amount } = data;
      if (!keyId || keyId.includes('placeholder') || !keyId.startsWith('rzp_')) {
        throw new Error(
          'Razorpay credentials are not configured on the server. Please set valid keys in your environment variables.'
        );
      }

      if (!razorpayOrderId || !razorpayOrderId.startsWith('order_')) {
        throw new Error('Invalid Razorpay order ID received from server.');
      }

      if (typeof amount !== 'number' || amount <= 0) {
        throw new Error('Invalid payment amount received from server.');
      }

      // 2. Open Razorpay Checkout modal
      await openRazorpayCheckout({
        keyId,
        orderId: razorpayOrderId,
        amount,
        currency: data.currency || 'INR',
        name: 'NovaShop',
        description: `Order #${order.id}`,
        prefill: {
          name: order.shippingAddress.fullName,
          contact: order.shippingAddress.phone,
        },
        onSuccess: async (rzpResponse) => {
          try {
            restoreBodyScroll();
            // 3. Server-side signature verification
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: order.id,
                razorpayOrderId: rzpResponse.razorpay_order_id,
                razorpayPaymentId: rzpResponse.razorpay_payment_id,
                razorpaySignature: rzpResponse.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData.error || 'Payment signature verification failed.');
            }

            setOrder(verifyData.order);
            setPaymentSuccessMsg('Payment successfully verified and captured!');
          } catch (vErr: any) {
            restoreBodyScroll();
            setPaymentActionError(vErr.message || 'Payment verification failed on the server.');
          } finally {
            setPaying(false);
          }
        },
        onDismiss: async () => {
          restoreBodyScroll();
          setPaying(false);
          setPaymentActionError('Payment window was dismissed before completion.');
          try {
            await fetch('/api/payments/fail', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: order.id,
                razorpayOrderId: data.razorpayOrderId,
                errorMessage: 'Payment modal was dismissed by the user.',
              }),
            });
            const fresh = await fetch(`/api/orders/${order.id}`);
            if (fresh.ok) {
              const freshData = await fresh.json();
              setOrder(freshData.order);
            }
          } catch (logErr) {
            console.error('Failed to report payment dismissal:', logErr);
          }
        },
        onFailure: async (failData) => {
          restoreBodyScroll();
          setPaying(false);
          setPaymentActionError(
            `Payment failed: ${failData?.description || 'Transaction was declined.'}`
          );
          try {
            await fetch('/api/payments/fail', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: order.id,
                razorpayOrderId: data.razorpayOrderId,
                razorpayPaymentId: failData?.metadata?.payment_id,
                errorMessage: failData?.description || 'Payment failed',
                metadata: failData,
              }),
            });
            const fresh = await fetch(`/api/orders/${order.id}`);
            if (fresh.ok) {
              const freshData = await fresh.json();
              setOrder(freshData.order);
            }
          } catch (logErr) {
            console.error('Failed to report payment failure:', logErr);
          }
        },
      });
    } catch (err: any) {
      restoreBodyScroll();
      console.error('Payment initiation error:', err);
      setPaymentActionError(err.message || 'Could not launch payment gateway.');
      setPaying(false);
    }
  };

  const handleCancel = async () => {
    if (!order) return;
    try {
      setCancelling(true);
      setCancelError(null);

      const res = await fetch(`/api/orders/${order.id}/cancel`, {
        method: 'POST',
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to cancel order.');
      }

      setOrder(data.order);
      setShowCancelModal(false);
    } catch (err: any) {
      setCancelError(err?.message || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-indigo-400 mb-3" size={36} />
        <p className="text-slate-400 text-sm">Retrieving order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="glass rounded-3xl border border-white/8 p-8 sm:p-12">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-white mb-2">Order Not Available</h2>
          <p className="text-slate-400 text-sm mb-6">
            {error || 'This order does not exist or you do not have permission to view it.'}
          </p>
          <Link href="/orders">
            <Button leftIcon={<ArrowLeft size={16} />}>Back to My Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentStep = getStepIndex(order.status);
  const isCancelled = order.status === 'cancelled' || order.status === 'returned';
  const isCancellable = ['pending', 'processing', 'confirmed'].includes(order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Celebration Banner for New Orders */}
      <AnimatePresence>
        {isNewlyConfirmed && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-indigo-500/20 to-emerald-500/20 border border-emerald-500/30 flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <CheckCircle size={28} />
            </div>
            <div className="flex-1">
              <h2 className="font-display text-xl font-bold text-white mb-1">
                Order Placed Successfully!
              </h2>
              <p className="text-slate-300 text-sm">
                Thank you for shopping with NovaShop. Your order has been placed with database-verified prices and inventory reservation.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Payment State Banners */}
      {paymentSuccessMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-start gap-3"
        >
          <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">Payment Successful</p>
            <p>{paymentSuccessMsg}</p>
          </div>
        </motion.div>
      )}

      {paymentActionError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-3"
        >
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">Payment Alert</p>
            <p>{paymentActionError}</p>
          </div>
        </motion.div>
      )}

      {order.paymentStatus === 'failed' && order.status !== 'cancelled' && !paymentActionError && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5 text-amber-400" />
            <div className="text-sm">
              <p className="font-semibold text-white">Payment Incomplete or Failed</p>
              <p className="text-slate-300 text-xs">
                Your order is currently unpaid. Your reserved products will remain held until cancelled.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleRetryPayment}
            disabled={paying}
            leftIcon={paying ? <Loader2 className="animate-spin" size={14} /> : <CreditCard size={14} />}
          >
            {paying ? 'Opening...' : 'Retry Payment'}
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back to Orders
        </Link>

        {isCancellable && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowCancelModal(true)}
            leftIcon={<RotateCcw size={14} />}
          >
            Cancel Order
          </Button>
        )}
      </div>

      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
            Order Identifier
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-1">
            {order.id}
          </h1>
          <p className="text-slate-400 text-sm">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Badge variant={statusVariant[order.status]}>
            {order.status.replace(/_/g, ' ')}
          </Badge>
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

      {/* Timeline tracking */}
      {!isCancelled ? (
        <div className="glass rounded-2xl border border-white/8 p-6 mb-6">
          <h2 className="font-semibold text-white mb-6">Shipment Tracking</h2>
          <div className="relative">
            {/* Progress bar */}
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(
                    100,
                    (Math.max(0, currentStep) / (TIMELINE_STEPS.length - 1)) * 100
                  )}%`,
                }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-indigo-500 rounded-full"
              />
            </div>
            <div className="relative flex justify-between">
              {TIMELINE_STEPS.map(({ status, label, icon: Icon }, i) => {
                const done = i <= currentStep;
                return (
                  <div key={status} className="flex flex-col items-center gap-2 flex-1">
                    <div
                      className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        done
                          ? 'bg-indigo-500 border-indigo-500 text-white'
                          : 'bg-[#12121e] border-white/15 text-slate-600'
                      }`}
                    >
                      <Icon size={16} />
                    </div>
                    <p
                      className={`text-xs text-center hidden sm:block ${
                        done ? 'text-white' : 'text-slate-600'
                      }`}
                    >
                      {label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          {order.estimatedDelivery && (
            <p className="text-xs text-slate-400 mt-6 text-center">
              Estimated delivery: <span className="text-white font-medium">{formatDate(order.estimatedDelivery)}</span>
            </p>
          )}
          {order.trackingNumber && (
            <p className="text-xs text-slate-400 mt-1 text-center">
              Tracking Number: <span className="font-mono text-indigo-300 font-semibold">{order.trackingNumber}</span>
            </p>
          )}
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mb-6 flex items-center gap-3">
          <XCircle size={22} className="flex-shrink-0" />
          <p className="text-sm">
            This order was cancelled. Reserved inventory has been safely restored.
          </p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-6 mb-6">
        {/* Delivery Address Snapshot */}
        <div className="glass rounded-2xl border border-white/8 p-5">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={16} className="text-indigo-400" />
            <h3 className="font-semibold text-white text-sm">Delivery Address Snapshot</h3>
          </div>
          <p className="text-sm text-white font-medium">{order.shippingAddress.fullName}</p>
          <p className="text-sm text-slate-400">{order.shippingAddress.addressLine1}</p>
          {order.shippingAddress.addressLine2 && (
            <p className="text-sm text-slate-400">{order.shippingAddress.addressLine2}</p>
          )}
          {order.shippingAddress.landmark && (
            <p className="text-xs text-slate-500 mt-0.5">Landmark: {order.shippingAddress.landmark}</p>
          )}
          <p className="text-sm text-slate-400">
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
          </p>
          <p className="text-sm text-slate-400">{order.shippingAddress.country}</p>
          <p className="text-sm text-slate-400 mt-2">Phone: {order.shippingAddress.phone}</p>
        </div>

        {/* Payment & Billing */}
        <div className="glass rounded-2xl border border-white/8 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CreditCard size={16} className="text-indigo-400" />
                <h3 className="font-semibold text-white text-sm">Payment & Financials</h3>
              </div>
              <Badge
                variant={
                  order.paymentStatus === 'paid'
                    ? 'success'
                    : order.paymentStatus === 'refunded'
                    ? 'accent'
                    : order.paymentStatus === 'failed'
                    ? 'danger'
                    : 'warning'
                }
              >
                {order.paymentStatus}
              </Badge>
            </div>

            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">Payment Method</span>
              <span className="text-white capitalize font-medium">
                {order.paymentMethod === 'card'
                  ? 'Card (Razorpay)'
                  : order.paymentMethod === 'upi'
                  ? 'UPI (Razorpay)'
                  : 'Cash on Delivery'}
              </span>
            </div>

            {order.razorpayOrderId && (
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">Gateway Order ID</span>
                <span className="font-mono text-[11px] text-slate-300 select-all">
                  {order.razorpayOrderId}
                </span>
              </div>
            )}

            {order.razorpayPaymentId && (
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">Gateway Payment ID</span>
                <span className="font-mono text-[11px] text-emerald-400 select-all font-semibold">
                  {order.razorpayPaymentId}
                </span>
              </div>
            )}

            <div className="border-t border-white/8 pt-3 mt-3 flex flex-col gap-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Subtotal</span>
                <span className="text-white">{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Discount</span>
                  <span className="text-emerald-400">-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Shipping</span>
                <span className="text-white">
                  {order.shipping === 0 ? 'Free' : formatCurrency(order.shipping)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Tax</span>
                <span className="text-slate-400">Included ({formatCurrency(order.tax || 0)})</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-white/8 text-sm">
                <span className="text-white">Total</span>
                <span className="text-white font-display text-base">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Retry payment button if unpaid/failed and not cancelled */}
          {order.paymentStatus !== 'paid' && order.status !== 'cancelled' && order.paymentMethod !== 'cod' && (
            <div className="mt-5 pt-4 border-t border-white/8">
              <Button
                fullWidth
                size="sm"
                onClick={handleRetryPayment}
                disabled={paying}
                leftIcon={
                  paying ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <CreditCard size={14} />
                  )
                }
              >
                {paying ? 'Opening Gateway...' : `Pay ${formatCurrency(order.total)} with Razorpay`}
              </Button>
              <p className="text-[10px] text-slate-500 text-center mt-2 flex items-center justify-center gap-1">
                <ShieldCheck size={12} className="text-emerald-400" />
                Razorpay Test Mode • Secure Checkout
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="glass rounded-2xl border border-white/8 p-5">
        <h3 className="font-semibold text-white mb-4">
          Order Items ({order.items.length})
        </h3>
        <div className="flex flex-col gap-3">
          {order.items.map((item) => (
            <div
              key={item.id || item.productId}
              className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/6"
            >
              <OrderItemDetailThumb src={item.productImage} alt={item.productName} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white line-clamp-1">{item.productName}</p>
                {item.variant && <p className="text-xs text-slate-400">{item.variant}</p>}
                <p className="text-xs text-slate-500">
                  Unit Price: {formatCurrency(item.price)} • Quantity: {item.quantity}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-white">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cancellation Modal */}
      <AnimatePresence>
        {showCancelModal && (
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
                Cancel Order {order.id}?
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                Are you sure you want to cancel this order? The reserved inventory for all items will be restored immediately.
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
                    setShowCancelModal(false);
                    setCancelError(null);
                  }}
                  disabled={cancelling}
                >
                  Keep Order
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleCancel}
                  disabled={cancelling}
                  leftIcon={cancelling ? <Loader2 className="animate-spin" size={14} /> : <XCircle size={14} />}
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
