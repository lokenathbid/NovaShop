'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { getTrendingProducts } from '@/data/products';
import ProductGrid from '@/components/product/ProductGrid';

export default function TrendingProducts() {
  const products = getTrendingProducts().slice(0, 8);

  return (
    <section className="py-20 bg-[#0d0d18]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-indigo-400 text-sm font-medium mb-2"
            >
              What's Hot Right Now
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="font-display text-3xl sm:text-4xl font-bold text-white"
            >
              Trending <span className="gradient-text">Products</span>
            </motion.h2>
          </div>
          <Link
            href="/shop?sort=popular"
            className="hidden sm:flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
          >
            See all <ArrowRight size={14} />
          </Link>
        </div>

        <ProductGrid products={products} />

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            View all products <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
