'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';
import Button from '@/components/ui/Button';
import ProductRating from '@/components/product/ProductRating';

export default function WishlistPage() {
  const { items, removeItem, clearWishlist, loading, isItemPending } = useWishlist();
  const { addItem: addToCart } = useCart();
  const [movingId, setMovingId] = useState<string | null>(null);

  const handleMoveToCart = async (product: any) => {
    setMovingId(product.id);
    try {
      const added = await addToCart(product);
      if (added !== false) {
        await removeItem(product.id);
      }
    } finally {
      setMovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="h-9 w-48 bg-white/5 rounded-xl animate-pulse mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-[#12121e] border border-white/6 overflow-hidden animate-pulse p-4"
            >
              <div className="aspect-square bg-white/5 rounded-xl mb-4" />
              <div className="h-3 w-20 bg-white/5 rounded mb-2" />
              <div className="h-4 w-3/4 bg-white/5 rounded mb-4" />
              <div className="h-4 w-24 bg-white/5 rounded mb-4" />
              <div className="h-10 bg-white/5 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6"
        >
          <Heart size={36} className="text-slate-600" />
        </motion.div>
        <h1 className="font-display text-2xl font-bold text-white mb-2">Your wishlist is empty</h1>
        <p className="text-slate-400 mb-8">Save items you love and come back to them anytime.</p>
        <Link href="/shop">
          <Button rightIcon={<ArrowRight size={16} />}>Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h1 className="font-display text-3xl font-bold text-white">
          Wishlist <span className="text-slate-500 font-normal text-xl">({items.length})</span>
        </h1>
        <button
          onClick={() => clearWishlist()}
          className="text-xs text-slate-400 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg border border-white/10 hover:border-red-500/30 hover:bg-red-500/10 cursor-pointer"
        >
          Clear Wishlist
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <AnimatePresence>
          {items.map((product, i) => {
            const pending = isItemPending(product.id) || movingId === product.id;
            const imageUrl = product.images?.[0]?.url || '/placeholder.png';
            const imageAlt = product.images?.[0]?.alt ?? product.name;

            return (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.04 }}
                className="relative rounded-2xl bg-[#12121e] border border-white/6 overflow-hidden group flex flex-col"
              >
                <Link
                  href={`/product/${product.id}`}
                  className="block aspect-square overflow-hidden bg-black/20"
                  suppressHydrationWarning
                >
                  <img
                    src={imageUrl}
                    alt={imageAlt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    suppressHydrationWarning
                  />
                </Link>

                {/* Remove button */}
                <button
                  disabled={pending}
                  onClick={() => removeItem(product.id)}
                  aria-label="Remove from wishlist"
                  className="absolute top-3 right-3 p-2 rounded-xl bg-black/50 backdrop-blur-sm border border-white/10 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-all disabled:opacity-40 cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>

                <div className="p-4 flex flex-col flex-1">
                  <p className="text-xs text-indigo-400 font-medium mb-1">{product.brand}</p>
                  <Link href={`/product/${product.id}`}>
                    <h3 className="text-sm font-semibold text-white mb-2 hover:text-indigo-300 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  <ProductRating
                    rating={product.rating}
                    reviewCount={product.reviewCount}
                    size="sm"
                    className="mb-3"
                  />
                  <div className="flex items-center gap-2 mb-4 mt-auto">
                    <span className="text-base font-bold text-white">
                      {formatCurrency(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-slate-500 line-through">
                        {formatCurrency(product.originalPrice)}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      disabled={pending}
                      onClick={() => addToCart(product)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      <ShoppingCart size={13} /> Add
                    </button>
                    <button
                      disabled={pending}
                      onClick={() => handleMoveToCart(product)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-40 cursor-pointer shadow-lg shadow-indigo-600/20"
                    >
                      Move to Cart
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
