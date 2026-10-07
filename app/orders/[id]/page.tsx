'use client';

import React from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, CreditCard, Check, Package, Truck, Home, Clock } from 'lucide-react';
import { getOrderById } from '@/data/orders';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { OrderStatus } from '@/types';
import Badge from '@/components/ui/Badge';

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

const statusVariant: Record<OrderStatus, 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'ghost'> = {
  processing: 'warning',
  confirmed: 'primary',
  shipped: 'accent',
  out_for_delivery: 'accent',
  delivered: 'success',
  cancelled: 'danger',
  returned: 'ghost',
};

export default function OrderDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const order = getOrderById(id);

  if (!order) notFound();

  const currentStep = getStepIndex(order.status);
  const isCancelled = order.status === 'cancelled' || order.status === 'returned';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/orders"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Orders
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-white mb-1">{order.id}</h1>
          <p className="text-slate-400 text-sm">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <Badge variant={statusVariant[order.status]}>
          {order.status.replace(/_/g, ' ')}
        </Badge>
      </div>

      {/* Timeline */}
      {!isCancelled && (
        <div className="glass rounded-2xl border border-white/8 p-6 mb-6">
          <h2 className="font-semibold text-white mb-6">Order Tracking</h2>
          <div className="relative">
            {/* Progress bar */}
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(100, (currentStep / (TIMELINE_STEPS.length - 1)) * 100)}%`,
                }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                className="h-full bg-indigo-500 rounded-full"
              />
            </div>
            <div className="relative flex justify-between">
              {TIMELINE_STEPS.map(({ status, label, icon: Icon }, i) => {
                const done = i <= currentStep;
                return (
                  <div key={status} className="flex flex-col items-center gap-2 flex-1">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 + i * 0.1, type: 'spring' }}
                      className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        done
                          ? 'bg-indigo-500 border-indigo-500 text-white'
                          : 'bg-[#12121e] border-white/15 text-slate-600'
                      }`}
                    >
                      <Icon size={16} />
                    </motion.div>
                    <p className={`text-xs text-center hidden sm:block ${done ? 'text-white' : 'text-slate-600'}`}>
                      {label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          {order.estimatedDelivery && (
            <p className="text-xs text-slate-500 mt-5 text-center">
              Estimated delivery: <span className="text-white">{formatDate(order.estimatedDelivery)}</span>
            </p>
          )}
          {order.trackingNumber && (
            <p className="text-xs text-slate-500 mt-1 text-center">
              Tracking #: <span className="font-mono text-indigo-300">{order.trackingNumber}</span>
            </p>
          )}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-6 mb-6">
        {/* Shipping Address */}
        <div className="glass rounded-2xl border border-white/8 p-5">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={16} className="text-indigo-400" />
            <h3 className="font-semibold text-white text-sm">Shipping Address</h3>
          </div>
          <p className="text-sm text-white font-medium">{order.shippingAddress.fullName}</p>
          <p className="text-sm text-slate-400">{order.shippingAddress.addressLine1}</p>
          {order.shippingAddress.addressLine2 && (
            <p className="text-sm text-slate-400">{order.shippingAddress.addressLine2}</p>
          )}
          <p className="text-sm text-slate-400">
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
          </p>
          <p className="text-sm text-slate-400">{order.shippingAddress.country}</p>
          <p className="text-sm text-slate-400 mt-1">{order.shippingAddress.phone}</p>
        </div>

        {/* Payment */}
        <div className="glass rounded-2xl border border-white/8 p-5">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={16} className="text-indigo-400" />
            <h3 className="font-semibold text-white text-sm">Payment Details</h3>
          </div>
          <p className="text-sm text-white capitalize mb-1">
            {order.paymentMethod === 'card' ? 'Credit / Debit Card' : order.paymentMethod.toUpperCase()}
          </p>
          <p className={`text-sm capitalize ${order.paymentStatus === 'paid' ? 'text-emerald-400' : order.paymentStatus === 'refunded' ? 'text-amber-400' : 'text-slate-400'}`}>
            {order.paymentStatus}
          </p>

          <div className="border-t border-white/8 mt-4 pt-4 flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Subtotal</span>
              <span className="text-white">{formatCurrency(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Discount</span>
                <span className="text-emerald-400">-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Shipping</span>
              <span className="text-emerald-400">{order.shipping === 0 ? 'Free' : formatCurrency(order.shipping)}</span>
            </div>
            <div className="flex justify-between font-bold pt-2 border-t border-white/8">
              <span className="text-white">Total</span>
              <span className="text-white text-lg">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="glass rounded-2xl border border-white/8 p-5">
        <h3 className="font-semibold text-white mb-4">Order Items ({order.items.length})</h3>
        <div className="flex flex-col gap-3">
          {order.items.map((item) => (
            <div key={item.productId} className="flex items-center gap-4">
              <img src={item.productImage} alt={item.productName} className="w-16 h-16 rounded-xl flex-shrink-0 object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white line-clamp-1">{item.productName}</p>
                {item.variant && <p className="text-xs text-slate-500">{item.variant}</p>}
                <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-bold text-white">{formatCurrency(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
