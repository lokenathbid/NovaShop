'use client';

import React from 'react';
import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';
import AccountSidebar from '@/components/account/AccountSidebar';
import Button from '@/components/ui/Button';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';

export default function AccountWishlistPage() {
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-3xl font-bold text-white mb-8">My Wishlist</h1>
      <div className="flex flex-col lg:flex-row gap-6">
        <AccountSidebar />
        <div className="flex-1">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <Heart size={40} className="text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">Your wishlist is empty.</p>
              <Link href="/shop"><Button>Browse Products</Button></Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((product) => (
                <div key={product.id} className="glass rounded-2xl border border-white/8 p-4 flex items-center gap-4">
                  <img src={product.images[0]?.url} alt={product.name} className="w-16 h-16 rounded-xl flex-shrink-0 object-cover" />
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${product.id}`}>
                      <p className="text-sm font-semibold text-white hover:text-indigo-300 transition-colors line-clamp-1">{product.name}</p>
                    </Link>
                    <p className="text-xs text-slate-500">{product.brand}</p>
                    <p className="text-base font-bold text-white mt-1">{formatCurrency(product.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => addItem(product)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-medium transition-colors">
                      <ShoppingCart size={12} /> Add to Cart
                    </button>
                    <button onClick={() => removeItem(product.id)} aria-label="Remove" className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
