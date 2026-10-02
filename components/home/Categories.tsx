'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { categories } from '@/data/categories';

function CategoryCard({
  category,
  index,
}: {
  category: (typeof categories)[0];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/shop/${category.slug}`}
        className="group relative block rounded-2xl overflow-hidden aspect-[4/3] card-hover"
      >
        {/* Gradient background */}
        <div
          className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
          style={{ background: category.image }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-display font-bold text-xl mb-1">{category.name}</h3>
          <p className="text-white/70 text-sm mb-3 line-clamp-2">{category.description}</p>
          <div className="flex items-center gap-1.5 text-white/80 text-xs font-medium group-hover:text-white transition-colors">
            <span>{category.productCount} products</span>
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function Categories() {
  return (
    <section id="categories" className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Section header */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-indigo-400 text-sm font-medium mb-2"
          >
            Browse by Category
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="font-display text-3xl sm:text-4xl font-bold text-white"
          >
            Shop by <span className="gradient-text">Category</span>
          </motion.h2>
        </div>
        <Link
          href="/shop"
          className="hidden sm:flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
        >
          View all <ArrowRight size={14} />
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((cat, i) => (
          <CategoryCard key={cat.id} category={cat} index={i} />
        ))}
      </div>
    </section>
  );
}
