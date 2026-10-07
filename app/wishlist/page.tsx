'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';
import Button from '@/components/ui/Button';
import ProductRating from '@/components/product/ProductRating';

export default function WishlistPage() {
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
          <Heart size={36} className="text-slate-600" />
        </div>
        <h1 className="font-display text-2xl font-bold text-white mb-2">Your wishlist is empty</h1>
        <p className="text-slate-400 mb-8">Save items you love and come back to them anytime.</p>
        <Link href="/shop">
          <Button>Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-3xl font-bold text-white mb-8">
        Wishlist <span className="text-slate-500 font-normal text-xl">({items.length})</span>
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {items.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: i * 0.05 }}
            className="relative rounded-2xl bg-[#12121e] border border-white/6 overflow-hidden group"
          >
            <Link href={`/product/${product.id}`} className="block aspect-square overflow-hidden" suppressHydrationWarning>
              <img
                src={product.images[0]?.url}
                alt={product.images[0]?.alt ?? product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                suppressHydrationWarning
              />
            </Link>

            {/* Remove */}
            <button
              onClick={() => removeItem(product.id)}
              aria-label="Remove from wishlist"
              className="absolute top-3 right-3 p-2 rounded-xl bg-black/40 backdrop-blur-sm border border-white/10 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-all"
            >
              <Trash2 size={14} />
            </button>

            <div className="p-4">
              <p className="text-xs text-indigo-400 font-medium mb-1">{product.brand}</p>
              <Link href={`/product/${product.id}`}>
                <h3 className="text-sm font-semibold text-white mb-2 hover:text-indigo-300 transition-colors line-clamp-2">
                  {product.name}
                </h3>
              </Link>
              <ProductRating rating={product.rating} reviewCount={product.reviewCount} size="sm" className="mb-3" />
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base font-bold text-white">{formatCurrency(product.price)}</span>
                {product.originalPrice && (
                  <span className="text-sm text-slate-500 line-through">{formatCurrency(product.originalPrice)}</span>
                )}
              </div>
              <button
                onClick={() => addItem(product)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium bg-indigo-500 hover:bg-indigo-400 text-white transition-colors"
              >
                <ShoppingCart size={14} /> Add to Cart
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
