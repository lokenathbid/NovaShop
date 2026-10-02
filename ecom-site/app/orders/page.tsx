'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, ArrowRight } from 'lucide-react';
import { orders } from '@/data/orders';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { OrderStatus } from '@/types';
import Badge from '@/components/ui/Badge';

const statusConfig: Record<
  OrderStatus,
  { label: string; variant: 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'ghost' }
> = {
  processing: { label: 'Processing', variant: 'warning' },
  confirmed: { label: 'Confirmed', variant: 'primary' },
  shipped: { label: 'Shipped', variant: 'accent' },
  out_for_delivery: { label: 'Out for Delivery', variant: 'accent' },
  delivered: { label: 'Delivered', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'danger' },
  returned: { label: 'Returned', variant: 'ghost' },
};

export default function OrdersPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-3xl font-bold text-white mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Package size={48} className="text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">No orders yet.</p>
          <Link href="/shop" className="text-indigo-400 hover:text-indigo-300 text-sm mt-2 inline-block">
            Start shopping →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="glass rounded-2xl border border-white/8 p-5"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Order ID</p>
                  <p className="font-mono text-sm font-semibold text-white">{order.id}</p>
                  <p className="text-xs text-slate-500 mt-1">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={statusConfig[order.status].variant}>
                    {statusConfig[order.status].label}
                  </Badge>
                  <span className="text-xs text-slate-500">
                    {order.paymentStatus === 'paid' ? '✓ Paid' : order.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Items preview */}
              <div className="flex items-center gap-3 mb-4 overflow-x-auto pb-1">
                {order.items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex-shrink-0 flex items-center gap-2"
                  >
                    <div
                      className="w-12 h-12 rounded-xl"
                      style={{ background: item.productImage }}
                    />
                    <div>
                      <p className="text-xs text-white line-clamp-1 max-w-[120px]">{item.productName}</p>
                      <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/8">
                <div>
                  <span className="text-slate-400 text-sm">Total: </span>
                  <span className="text-white font-bold text-lg">{formatCurrency(order.total)}</span>
                </div>
                <Link href={`/orders/${order.id}`}>
                  <button className="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                    View Order <ArrowRight size={14} />
                  </button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
