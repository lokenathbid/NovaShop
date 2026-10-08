'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Loader2, AlertCircle } from 'lucide-react';
import ProductGrid from '@/components/product/ProductGrid';
import type { Product } from '@/types';

const recentSearches = ['headphones', 'yoga mat', 'leather wallet', 'smart watch'];
const suggestions = ['Electronics', 'Fashion', 'Cashmere', 'Sunglasses', 'Dumbbells', 'Serum'];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setProducts([]);
      setLoading(false);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError(null);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(trimmed)}&limit=24`);
        if (!res.ok) {
          throw new Error('Search failed');
        }
        const data = await res.json();
        setProducts(data.products || []);
        setHasSearched(true);
      } catch (err) {
        console.error('Search error:', err);
        setError('Unable to perform search right now. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
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
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors cursor-pointer"
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
                  className="px-4 py-2 rounded-xl glass border border-white/10 text-sm text-slate-300 hover:text-white hover:border-white/20 transition-all cursor-pointer"
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
                  className="px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-sm text-indigo-300 hover:bg-indigo-500/20 transition-all cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="glass rounded-2xl border border-red-500/20 p-6 flex items-center gap-3 text-red-400 mb-6">
          <AlertCircle size={20} className="flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Loader2 size={32} className="animate-spin text-indigo-400 mb-3" />
          <p className="text-sm">Searching the catalog...</p>
        </div>
      )}

      {/* Results */}
      {!loading && hasQuery && hasSearched && (
        <div>
          <p className="text-sm text-slate-400 mb-5">
            {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;
            <span className="text-white font-medium">{query}</span>&rdquo;
          </p>
          {results.length === 0 ? (
            <div className="glass rounded-2xl border border-white/8 text-center py-16 p-6">
              <p className="text-slate-300 text-lg font-medium mb-1">No products found</p>
              <p className="text-slate-500 text-sm">
                Try searching for broader terms, brand names, or check your spelling.
              </p>
            </div>
          ) : (
            <ProductGrid products={results} />
          )}
        </div>
      )}
    </div>
  );
}
