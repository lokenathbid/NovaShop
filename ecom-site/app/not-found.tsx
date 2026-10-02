'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Search, ShoppingBag } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4">
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-indigo-500/6 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-violet-500/5 rounded-full blur-[80px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="font-display font-black text-[120px] sm:text-[160px] leading-none gradient-text mb-4"
        >
          404
        </motion.div>
        <h1 className="font-display text-2xl font-bold text-white mb-3">Page not found</h1>
        <p className="text-slate-400 mb-10 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/">
            <Button leftIcon={<Home size={16} />}>Go Home</Button>
          </Link>
          <Link href="/shop">
            <Button variant="secondary" leftIcon={<ShoppingBag size={16} />}>Shop Products</Button>
          </Link>
          <Link href="/search">
            <Button variant="ghost" leftIcon={<Search size={16} />}>Search</Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
