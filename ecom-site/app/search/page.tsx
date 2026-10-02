'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { products, searchProducts } from '@/data/products';
import ProductGrid from '@/components/product/ProductGrid';

const recentSearches = ['headphones', 'yoga mat', 'leather wallet', 'smart watch'];
const suggestions = ['Electronics', 'Fashion', 'Cashmere', 'Sunglasses', 'Dumbbells', 'Serum'];

export default function SearchPage() {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return searchProducts(query);
  }, [query]);

  const hasQuery = query.trim().length > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-3xl font-bold text-white mb-6 text-center"
      >
        Search Products
      </motion.h1>

      {/* Search input */}
      <div className="relative mb-8">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for products, brands, categories..."
          className="w-full h-14 pl-12 pr-12 rounded-2xl glass border border-white/10 text-base text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/60 transition-colors shadow-xl"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* No query: show suggestions + recent searches */}
      {!hasQuery && (
        <div className="flex flex-col gap-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-600 mb-3">Recent Searches</p>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((s) => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  className="px-4 py-2 rounded-xl glass border border-white/10 text-sm text-slate-300 hover:text-white hover:border-white/20 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-600 mb-3">Popular Searches</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  className="px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-sm text-indigo-300 hover:bg-indigo-500/20 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {hasQuery && (
        <div>
          <p className="text-sm text-slate-400 mb-5">
            {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;<span className="text-white">{query}</span>&rdquo;
          </p>
          {results.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-slate-400 text-lg mb-2">No results found</p>
              <p className="text-slate-600 text-sm">Try a different search term or browse by category.</p>
            </div>
          ) : (
            <ProductGrid products={results} />
          )}
        </div>
      )}
    </div>
  );
}
