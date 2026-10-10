'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';
import AccountSidebar from '@/components/account/AccountSidebar';
import Button from '@/components/ui/Button';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AccountWishlistPage() {
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h1 className="font-display text-3xl font-bold text-white">My Wishlist</h1>
        {items.length > 0 && !loading && (
          <button
            onClick={() => clearWishlist()}
            className="text-xs text-slate-400 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg border border-white/10 hover:border-red-500/30 hover:bg-red-500/10 cursor-pointer"
          >
            Clear Wishlist
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <AccountSidebar />
        <div className="flex-1">
          {loading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="glass rounded-2xl border border-white/8 p-4 flex items-center gap-4 animate-pulse"
                >
                  <div className="w-16 h-16 rounded-xl bg-white/5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="h-4 w-48 bg-white/5 rounded mb-2" />
                    <div className="h-3 w-20 bg-white/5 rounded mb-2" />
                    <div className="h-4 w-16 bg-white/5 rounded" />
                  </div>
                  <div className="h-8 w-24 bg-white/5 rounded-xl" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 bg-white/2 rounded-2xl border border-white/6 p-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4"
              >
                <Heart size={32} className="text-slate-600" />
              </motion.div>
              <h2 className="text-lg font-semibold text-white mb-1">Your wishlist is empty</h2>
              <p className="text-slate-400 mb-6 text-sm">Save items you love to view or buy them later.</p>
              <Link href="/shop">
                <Button rightIcon={<ArrowRight size={15} />}>Browse Products</Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <AnimatePresence>
                {items.map((product) => {
                  const pending = isItemPending(product.id) || movingId === product.id;
                  const imageUrl = product.images?.[0]?.url || '/placeholder.png';
                  const imageAlt = product.images?.[0]?.alt ?? product.name;

                  return (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="glass rounded-2xl border border-white/8 p-4 flex items-center gap-4 flex-wrap sm:flex-nowrap"
                    >
                      <img
                        src={imageUrl}
                        alt={imageAlt}
                        className="w-16 h-16 rounded-xl flex-shrink-0 object-cover bg-black/20"
                      />
                      <div className="flex-1 min-w-0">
                        <Link href={`/product/${product.id}`}>
                          <p className="text-sm font-semibold text-white hover:text-indigo-300 transition-colors line-clamp-1">
                            {product.name}
                          </p>
                        </Link>
                        <p className="text-xs text-slate-500">{product.brand}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-base font-bold text-white">
                            {formatCurrency(product.price)}
                          </p>
                          {product.originalPrice && (
                            <span className="text-xs text-slate-500 line-through">
                              {formatCurrency(product.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                          disabled={pending}
                          onClick={() => addToCart(product)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-colors disabled:opacity-40 cursor-pointer"
                        >
                          <ShoppingCart size={12} /> Add
                        </button>
                        <button
                          disabled={pending}
                          onClick={() => handleMoveToCart(product)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors disabled:opacity-40 cursor-pointer shadow-md shadow-indigo-600/20"
                        >
                          Move to Cart
                        </button>
                        <button
                          disabled={pending}
                          onClick={() => removeItem(product.id)}
                          aria-label="Remove"
                          className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
