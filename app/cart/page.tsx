'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  Heart,
  ArrowLeft,
  ArrowRight,
  Tag,
  Loader2,
  LogIn,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { formatCurrency } from '@/lib/utils';
import Button from '@/components/ui/Button';

function EmptyCart({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
        <ShoppingBag size={36} className="text-slate-600" />
      </div>
      <h2 className="font-display text-2xl font-bold text-white mb-2">Your cart is empty</h2>
      <p className="text-slate-400 mb-8 max-w-xs">
        Looks like you haven't added anything yet. Explore our premium collection.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link href="/shop">
          <Button leftIcon={<ArrowLeft size={16} />}>Continue Shopping</Button>
        </Link>
        {!isAuthenticated && (
          <Link href="/login?callbackUrl=/cart">
            <Button variant="secondary" leftIcon={<LogIn size={16} />}>
              Sign In to View Saved Cart
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      <div className="h-9 w-64 bg-white/5 rounded-xl mb-8" />
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 flex flex-col gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="glass rounded-2xl border border-white/6 p-4 h-32 flex gap-4">
              <div className="w-20 h-20 rounded-xl bg-white/5 flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-white/10 rounded w-1/2" />
                <div className="h-3 bg-white/5 rounded w-1/4" />
                <div className="h-8 bg-white/5 rounded w-24 mt-2" />
              </div>
            </div>
          ))}
        </div>
        <div className="lg:w-80 flex-shrink-0">
          <div className="glass rounded-2xl border border-white/8 p-6 h-80 bg-white/5" />
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';

  const {
    items,
    itemCount,
    subtotal,
    discount,
    shipping,
    total,
    loading,
    isItemPending,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();
  const { addItem: wishlistAdd } = useWishlist();

  if (loading) {
    return <CartSkeleton />;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <EmptyCart isAuthenticated={isAuthenticated} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold text-white">
          Shopping Cart{' '}
          <span className="text-slate-500 text-xl font-normal">({itemCount} items)</span>
        </h1>
        <button
          onClick={() => clearCart()}
          className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Trash2 size={13} /> Clear Cart
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Items */}
        <div className="flex-1 flex flex-col gap-4">
          {items.map((item, i) => {
            const itemKey = item.id || `${item.productId}-${item.variant || ''}`;
            const pending = isItemPending(item.id || item.productId);

            return (
              <motion.div
                key={itemKey}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl border border-white/6 p-4 relative overflow-hidden"
              >
                {pending && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10 flex items-center justify-center">
                    <Loader2 size={24} className="text-indigo-400 animate-spin" />
                  </div>
                )}
                <div className="flex gap-4">
                  {/* Image */}
                  <Link href={`/product/${item.productId}`} suppressHydrationWarning>
                    <img
                      src={item.product?.images?.[0]?.url || ''}
                      alt={item.product?.name || 'Product'}
                      className="w-20 h-20 rounded-xl flex-shrink-0 object-cover"
                      suppressHydrationWarning
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <Link href={`/product/${item.productId}`}>
                        <p className="text-sm font-semibold text-white hover:text-indigo-300 transition-colors line-clamp-2">
                          {item.product?.name}
                        </p>
                      </Link>
                      <p className="text-base font-bold text-white flex-shrink-0">
                        {formatCurrency((item.product?.price || 0) * item.quantity)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mb-2">
                      <span>{item.product?.brand}</span>
                      <span>•</span>
                      <span>Unit: {formatCurrency(item.product?.price || 0)}</span>
                      {item.variant && (
                        <>
                          <span>•</span>
                          <span className="text-indigo-300 font-medium">{item.variant}</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Qty controls */}
                      <div className="flex items-center gap-2 glass rounded-xl border border-white/10 px-3 py-1.5">
                        <button
                          disabled={pending}
                          onClick={() =>
                            updateQuantity(item.id || item.productId, item.quantity - 1)
                          }
                          className="text-slate-400 hover:text-white transition-colors disabled:opacity-40 cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="text-white text-sm font-medium w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          disabled={
                            pending ||
                            (item.product?.stockCount !== null &&
                              item.product?.stockCount !== undefined &&
                              item.quantity >= item.product.stockCount)
                          }
                          onClick={() =>
                            updateQuantity(item.id || item.productId, item.quantity + 1)
                          }
                          className="text-slate-400 hover:text-white transition-colors disabled:opacity-40 cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      {/* Save for later */}
                      <button
                        disabled={pending}
                        onClick={() => {
                          if (item.product) wishlistAdd(item.product);
                          removeItem(item.id || item.productId);
                        }}
                        className="text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-40"
                      >
                        <Heart size={12} /> Save
                      </button>

                      {/* Remove */}
                      <button
                        disabled={pending}
                        onClick={() => removeItem(item.id || item.productId)}
                        className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors ml-auto cursor-pointer disabled:opacity-40"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          <Link
            href="/shop"
            className="text-sm text-slate-400 hover:text-white flex items-center gap-1.5 mt-2 transition-colors"
          >
            <ArrowLeft size={14} /> Continue Shopping
          </Link>
        </div>

        {/* Summary */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="glass rounded-2xl border border-white/8 p-6 sticky top-24">
            <h3 className="font-semibold text-white text-lg mb-5">Order Summary</h3>

            {/* Coupon */}
            <div className="flex gap-2 mb-5">
              <div className="relative flex-1">
                <Tag
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  placeholder="Coupon code"
                  className="w-full h-9 pl-9 pr-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
              </div>
              <button className="h-9 px-3 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm hover:bg-indigo-500/30 transition-colors cursor-pointer">
                Apply
              </button>
            </div>

            <div className="flex flex-col gap-3 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Subtotal</span>
                <span className="text-white">{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Discount</span>
                  <span className="text-emerald-400">-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Shipping</span>
                <span className={shipping === 0 ? 'text-emerald-400' : 'text-white'}>
                  {shipping === 0 ? 'Free' : formatCurrency(shipping)}
                </span>
              </div>
              <div className="border-t border-white/8 pt-3 flex justify-between font-bold">
                <span className="text-white">Total</span>
                <span className="text-xl text-white">{formatCurrency(total)}</span>
              </div>
            </div>

            <Link href="/checkout">
              <Button fullWidth size="lg" rightIcon={<ArrowRight size={16} />}>
                Proceed to Checkout
              </Button>
            </Link>

            <p className="text-center text-xs text-slate-600 mt-4">
              🔒 Secure checkout with SSL encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
