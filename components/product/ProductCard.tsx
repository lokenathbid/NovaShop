'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Eye, Loader2 } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import type { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import ProductRating from './ProductRating';
import Badge from '@/components/ui/Badge';

interface ProductCardProps {
  product: Product;
  className?: string;
  index?: number;
}

export default function ProductCard({ product, className, index = 0 }: ProductCardProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { addItem, isInCart, isItemPending } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();

  const inCart = isInCart(product.id);
  const pending = isItemPending(product.id);
  const wishlisted = isWishlisted(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className={cn('group relative', className)}
    >
      <div className="relative rounded-2xl bg-[#12121e] border border-white/6 overflow-hidden card-hover shine-effect" suppressHydrationWarning>
        {/* Image Area */}
        <Link href={`/product/${product.id}`} className="block relative aspect-square overflow-hidden" suppressHydrationWarning>
          {/* Product image */}
          {mounted ? (
            <img
              src={product.images[0]?.url}
              alt={product.images[0]?.alt ?? product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              suppressHydrationWarning
            />
          ) : (
            <div className="w-full h-full bg-[#181826]" />
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2 text-xs font-medium text-white">
                <Eye size={14} />
                Quick View
              </div>
            </motion.div>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isNew && <Badge variant="new">New</Badge>}
            {product.isBestseller && <Badge variant="accent">Bestseller</Badge>}
            {product.discountPercentage && (
              <Badge variant="sale">-{product.discountPercentage}%</Badge>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleItem(product);
            }}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className={cn(
              'absolute top-3 right-3 p-2 rounded-xl transition-all duration-200',
              'bg-black/40 backdrop-blur-sm border border-white/10',
              'hover:bg-black/60 hover:scale-110',
              wishlisted
                ? 'text-rose-400 border-rose-500/30'
                : 'text-slate-400 hover:text-rose-400',
            )}
          >
            <Heart
              size={16}
              className={cn('transition-all', wishlisted && 'fill-rose-400')}
            />
          </button>
        </Link>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs text-indigo-400 font-medium mb-1">{product.brand}</p>
          <Link href={`/product/${product.id}`}>
            <h3 className="text-sm font-semibold text-white leading-snug mb-2 hover:text-indigo-300 transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>

          <ProductRating rating={product.rating} reviewCount={product.reviewCount} size="sm" />

          <div className="flex items-center gap-2 mt-3 mb-3">
            <span className="text-lg font-bold text-white">
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-slate-500 line-through">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>

          {!product.inStock ? (
            <div className="text-xs text-red-400 font-medium py-1">Out of Stock</div>
          ) : (
            <button
              disabled={pending}
              onClick={() => addItem(product)}
              aria-label={`Add ${product.name} to cart`}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer disabled:opacity-50',
                inCart
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/20',
              )}
            >
              {pending ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={15} />
                  <span>{inCart ? 'In Cart' : 'Add to Cart'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
