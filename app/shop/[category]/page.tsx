'use client';

import React, { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, AlertCircle, Package } from 'lucide-react';
import Link from 'next/link';
import ProductGrid from '@/components/product/ProductGrid';
import type { Product, Category } from '@/types';

export default function CategoryPage() {
  const params = useParams();
  const slug = typeof params.category === 'string' ? params.category : '';

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    let isMounted = true;
    async function loadCategoryData() {
      try {
        setLoading(true);
        setError(null);
        setNotFoundState(false);

        // Fetch category info and products in parallel from MySQL APIs
        const [catRes, prodsRes] = await Promise.all([
          fetch(`/api/categories/${slug}`),
          fetch(`/api/products?category=${slug}&limit=50`),
        ]);

        if (catRes.status === 404) {
          if (isMounted) setNotFoundState(true);
          return;
        }

        if (!catRes.ok || !prodsRes.ok) {
          throw new Error('Failed to load category data');
        }

        const [catData, prodsData] = await Promise.all([
          catRes.json(),
          prodsRes.json(),
        ]);

        if (isMounted) {
          setCategory(catData.category);
          setProducts(prodsData.products || []);
        }
      } catch (err) {
        console.error('Error loading category:', err);
        if (isMounted) {
          setError('Unable to load this category. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadCategoryData();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (notFoundState) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Back to Shop */}
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Shop
      </Link>

      {error ? (
        <div className="glass rounded-2xl border border-red-500/20 p-8 flex items-center gap-4 text-red-400">
          <AlertCircle size={24} className="flex-shrink-0" />
          <div>
            <p className="font-medium">{error}</p>
            <Link href="/shop" className="mt-2 text-xs text-indigo-400 hover:underline inline-block">
              Return to All Products
            </Link>
          </div>
        </div>
      ) : loading ? (
        <div>
          {/* Skeleton Banner */}
          <div className="rounded-3xl bg-white/5 border border-white/6 h-56 animate-pulse mb-10 p-8 flex flex-col justify-end">
            <div className="h-8 bg-white/10 rounded w-1/3 mb-3" />
            <div className="h-4 bg-white/5 rounded w-1/2" />
          </div>

          {/* Skeleton Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white/5 border border-white/6 p-4 animate-pulse">
                <div className="aspect-square bg-white/10 rounded-xl mb-4" />
                <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
                <div className="h-4 bg-white/5 rounded w-1/3" />
              </div>
            ))}
          </div>
        </div>
      ) : category ? (
        <>
          {/* Banner */}
          <div className="relative rounded-3xl overflow-hidden mb-10 p-8 sm:p-12 shadow-2xl">
            {category.image && (
              <img
                src={category.image}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/35" />
            <div className="relative z-10">
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-4xl sm:text-5xl font-bold text-white mb-2"
              >
                {category.name}
              </motion.h1>
              <p className="text-white/70 text-lg max-w-xl">{category.description}</p>
              <p className="text-white/50 text-sm mt-2">{products.length} products</p>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="glass rounded-2xl border border-white/8 p-12 text-center">
              <Package size={40} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-300 text-lg font-medium mb-1">No products in this category yet</p>
              <p className="text-slate-500 text-sm mb-6">Check back soon for new arrivals.</p>
              <Link
                href="/shop"
                className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors inline-block"
              >
                Explore Other Products
              </Link>
            </div>
          ) : (
            <ProductGrid products={products} />
          )}
        </>
      ) : null}
    </div>
  );
}
