'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getCategoryBySlug } from '@/data/categories';
import { getProductsByCategory } from '@/data/products';
import ProductGrid from '@/components/product/ProductGrid';

export default function CategoryPage() {
  const params = useParams();
  const slug = typeof params.category === 'string' ? params.category : '';
  const category = getCategoryBySlug(slug);

  if (!category) notFound();

  const prods = getProductsByCategory(slug);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Back */}
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Shop
      </Link>

      {/* Header */}
      <div className="relative rounded-3xl overflow-hidden mb-10 p-8 sm:p-12" suppressHydrationWarning>
        <img
          src={category.image}
          alt={category.name}
          className="absolute inset-0 w-full h-full object-cover"
          suppressHydrationWarning
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 to-black/35" />
        <div className="relative">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl sm:text-5xl font-bold text-white mb-2"
          >
            {category.name}
          </motion.h1>
          <p className="text-white/70 text-lg max-w-xl">{category.description}</p>
          <p className="text-white/50 text-sm mt-2">{prods.length} products</p>
        </div>
      </div>

      <ProductGrid products={prods} />
    </div>
  );
}
