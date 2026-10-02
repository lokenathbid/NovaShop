'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { products, sortProducts } from '@/data/products';
import { categories } from '@/data/categories';
import ProductGrid from '@/components/product/ProductGrid';
import type { SortOption } from '@/types';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popular', label: 'Most Popular' },
];

export default function ShopPage() {
  const [query, setQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sort, setSort] = useState<SortOption>('featured');
  const [priceMax, setPriceMax] = useState(100000);
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = [...products];
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      );
    }
    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.categorySlug));
    }
    result = result.filter((p) => p.price <= priceMax);
    if (minRating > 0) {
      result = result.filter((p) => p.rating >= minRating);
    }
    return sortProducts(result, sort);
  }, [query, selectedCategories, sort, priceMax, minRating]);

  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceMax(100000);
    setMinRating(0);
    setQuery('');
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
        <p className="text-slate-400">{filtered.length} products found</p>
      </div>

      {/* Search + controls bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full h-11 pl-10 pr-10 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/60 transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
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
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="h-11 pl-4 pr-8 rounded-xl bg-white/5 border border-white/10 text-sm text-white appearance-none focus:outline-none focus:border-indigo-500/60 cursor-pointer min-w-[180px]"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-[#12121e]">
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
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
        <aside
          className={`w-56 flex-shrink-0 ${showFilters ? 'block' : 'hidden'} sm:block`}
        >
          <div className="glass rounded-2xl p-5 border border-white/6 sticky top-24">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-white">Filters</h3>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
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
                  <label
                    key={cat.id}
                    className="flex items-center gap-2.5 cursor-pointer group"
                  >
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
                onChange={(e) => setPriceMax(Number(e.target.value))}
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
                      onChange={() => setMinRating(r)}
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

        {/* Product Grid */}
        <div className="flex-1 min-w-0">
          <ProductGrid
            products={filtered}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          />
        </div>
      </div>
    </div>
  );
}
