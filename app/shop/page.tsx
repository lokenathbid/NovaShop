'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, ChevronDown, ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import ProductGrid from '@/components/product/ProductGrid';
import type { Product, Category, SortOption } from '@/types';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popular', label: 'Most Popular' },
];

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [query, setQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sort, setSort] = useState<SortOption>('featured');
  const [priceMax, setPriceMax] = useState(100000);
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 12;

  // Load categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    fetchCategories();
  }, []);

  // Fetch products from database API
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', limit.toString());
      params.set('sort', sort);

      if (query.trim()) {
        params.set('search', query.trim());
      }
      if (selectedCategories.length > 0) {
        params.set('category', selectedCategories.join(','));
      }
      if (priceMax < 100000) {
        params.set('maxPrice', priceMax.toString());
      }
      if (minRating > 0) {
        params.set('rating', minRating.toString());
      }

      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await res.json();
      setProducts(data.products || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalCount(data.pagination?.total || 0);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Unable to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, sort, query, selectedCategories, priceMax, minRating]);

  // Debounced fetch when search or price filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 250);

    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const toggleCategory = (slug: string) => {
    setPage(1);
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceMax(100000);
    setMinRating(0);
    setQuery('');
    setPage(1);
  };

  const hasFilters = selectedCategories.length > 0 || priceMax < 100000 || minRating > 0 || query;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl sm:text-4xl font-bold text-white mb-2"
        >
          All <span className="gradient-text">Products</span>
        </motion.h1>
        <p className="text-slate-400">
          {loading ? 'Searching catalog...' : `${totalCount} products found`}
        </p>
      </div>

      {/* Search + controls bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search products..."
            className="w-full h-11 pl-10 pr-10 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/60 transition-colors"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setPage(1);
              }}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as SortOption);
              setPage(1);
            }}
            className="h-11 pl-4 pr-8 rounded-xl bg-white/5 border border-white/10 text-sm text-white appearance-none focus:outline-none focus:border-indigo-500/60 cursor-pointer min-w-[180px]"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-[#12121e]">
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
          />
        </div>

        {/* Filter toggle (mobile) */}
        <button
          onClick={() => setShowFilters((v) => !v)}
          className="sm:hidden flex items-center gap-2 h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300"
        >
          <SlidersHorizontal size={16} />
          Filters
          {hasFilters && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <aside className={`w-56 flex-shrink-0 ${showFilters ? 'block' : 'hidden'} sm:block`}>
          <div className="glass rounded-2xl p-5 border border-white/6 sticky top-24">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-white">Filters</h3>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Categories */}
            <div className="mb-5">
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Category</p>
              <div className="flex flex-col gap-1.5">
                {categories.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.slug)}
                      onChange={() => toggleCategory(cat.slug)}
                      className="w-4 h-4 rounded accent-indigo-500"
                    />
                    <span className="text-sm text-slate-400 group-hover:text-white transition-colors">
                      {cat.name}
                    </span>
                    <span className="text-xs text-slate-600 ml-auto">{cat.productCount}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-5">
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Max Price</p>
              <input
                type="range"
                min={500}
                max={100000}
                step={500}
                value={priceMax}
                onChange={(e) => {
                  setPriceMax(Number(e.target.value));
                  setPage(1);
                }}
                className="w-full accent-indigo-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>₹500</span>
                <span className="text-white font-medium">₹{priceMax.toLocaleString()}</span>
              </div>
            </div>

            {/* Rating */}
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Min Rating</p>
              <div className="flex flex-col gap-1.5">
                {[4, 3, 2, 0].map((r) => (
                  <label key={r} className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="radio"
                      name="rating"
                      checked={minRating === r}
                      onChange={() => {
                        setMinRating(r);
                        setPage(1);
                      }}
                      className="accent-indigo-500"
                    />
                    <span className="text-sm text-slate-400 group-hover:text-white transition-colors">
                      {r === 0 ? 'All' : `${r}★ & above`}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="flex-1 min-w-0">
          {error ? (
            <div className="glass rounded-2xl border border-red-500/20 p-8 flex items-center gap-4 text-red-400">
              <AlertCircle size={24} className="flex-shrink-0" />
              <div>
                <p className="font-medium">{error}</p>
                <button
                  onClick={fetchProducts}
                  className="mt-2 text-xs text-indigo-400 hover:underline cursor-pointer"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : loading ? (
            /* Loading skeletons */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-white/5 border border-white/6 p-4 animate-pulse">
                  <div className="aspect-square bg-white/10 rounded-xl mb-4" />
                  <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-white/5 rounded w-1/2 mb-4" />
                  <div className="h-5 bg-white/10 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            /* Empty state */
            <div className="glass rounded-2xl border border-white/8 p-12 text-center">
              <p className="text-slate-300 text-lg font-medium mb-2">No products found</p>
              <p className="text-slate-500 text-sm mb-6">
                Try adjusting your search query, price limit, or category selection.
              </p>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="px-5 py-2.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-sm font-medium transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <ProductGrid
                products={products}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              />

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-xl glass border border-white/10 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    const isActive = pageNum === page;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-xl font-medium text-sm transition-all ${
                          isActive
                            ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                            : 'glass border border-white/10 text-slate-300 hover:text-white'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-xl glass border border-white/10 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    aria-label="Next page"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
