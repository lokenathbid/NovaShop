'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ShoppingBag, Sparkles, Star, Zap } from 'lucide-react';
import Button from '@/components/ui/Button';

// Floating decorative elements for the hero
function FloatingCard({
  className,
  delay,
  children,
}: {
  className?: string;
  delay?: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: delay ?? 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`absolute glass rounded-2xl p-3 shadow-2xl ${className ?? ''}`}
      style={{ animation: `float ${5 + (delay ?? 0) * 0.5}s ease-in-out infinite` }}
    >
      {children}
    </motion.div>
  );
}

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative min-h-[calc(100vh-4rem)] flex items-center overflow-hidden"
    >
      {/* Ambient gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-500/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-600/5 rounded-full blur-[80px]" />
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(99,102,241,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.8) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <motion.div
        style={{ y, opacity }}
        className="max-w-7xl mx-auto px-4 sm:px-6 w-full py-20"
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-indigo-500/30 text-sm text-indigo-300 mb-6"
            >
              <Sparkles size={14} className="text-amber-400" />
              New Season Collection — 2026
              <Sparkles size={14} className="text-amber-400" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-5xl sm:text-6xl xl:text-7xl font-bold leading-[1.05] tracking-tight mb-6"
            >
              <span className="text-white">Elevate</span>
              <br />
              <span className="gradient-text">Your World</span>
              <br />
              <span className="text-white">in Style</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="text-lg text-slate-400 leading-relaxed mb-8 max-w-lg"
            >
              Discover a curated selection of premium electronics, fashion, and lifestyle products —
              designed for those who appreciate quality and style.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="flex flex-wrap gap-3 mb-10"
            >
              <Link href="/shop">
                <Button size="lg" leftIcon={<ShoppingBag size={18} />}>
                  Shop Now
                </Button>
              </Link>
              <Link href="/shop">
                <Button size="lg" variant="secondary" rightIcon={<ArrowRight size={16} />}>
                  Explore Collection
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="flex items-center gap-8"
            >
              {[
                { value: '50K+', label: 'Happy Customers' },
                { value: '1200+', label: 'Products' },
                { value: '4.8★', label: 'Avg. Rating' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="text-2xl font-bold font-display text-white">{value}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* 3D / Visual area */}
          <div className="relative h-[420px] sm:h-[520px] hidden lg:block">
            {/* Central orb */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {/* Outer glow ring */}
              <div className="absolute w-72 h-72 rounded-full bg-indigo-500/5 border border-indigo-500/15 animate-spin-slow" />
              <div
                className="absolute w-56 h-56 rounded-full bg-indigo-500/8 border border-indigo-500/25"
                style={{ animation: 'spin-slow 15s linear infinite reverse' }}
              />

              {/* Central product visual */}
              <div className="relative w-40 h-40 rounded-3xl animate-float"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 30px 80px rgba(99,102,241,0.4), 0 0 40px rgba(99,102,241,0.2)',
                }}
              >
                <div className="absolute inset-0 rounded-3xl flex items-center justify-center">
                  <Zap size={56} className="text-white/90" />
                </div>
                <div className="absolute -inset-3 rounded-[2.5rem] border border-white/10" />
              </div>
            </motion.div>

            {/* Floating cards */}
            <FloatingCard className="top-8 left-0 min-w-[140px]" delay={0.5}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center">
                  <Star size={14} className="text-white fill-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Top Rated</p>
                  <p className="text-xs text-slate-400">4.9 / 5.0</p>
                </div>
              </div>
            </FloatingCard>

            <FloatingCard className="top-12 right-4 min-w-[130px]" delay={0.7}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center">
                  <ShoppingBag size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Flash Sale</p>
                  <p className="text-xs text-emerald-400">Up to 40% off</p>
                </div>
              </div>
            </FloatingCard>

            <FloatingCard className="bottom-20 left-8 min-w-[150px]" delay={0.6}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center">
                  <Zap size={14} className="text-white fill-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Fast Delivery</p>
                  <p className="text-xs text-slate-400">2–4 days</p>
                </div>
              </div>
            </FloatingCard>

            <FloatingCard className="bottom-12 right-2 min-w-[160px]" delay={0.8}>
              <div>
                <p className="text-xs text-slate-400 mb-1">New Arrival</p>
                <p className="text-xs font-semibold text-white">NovaPro X15</p>
                <p className="text-xs text-indigo-400 font-bold">₹8,999</p>
              </div>
            </FloatingCard>
          </div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-slate-600">Scroll to explore</span>
        <div className="w-5 h-8 rounded-full border border-slate-700 flex items-center justify-center">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="w-1 h-2 rounded-full bg-indigo-500"
          />
        </div>
      </motion.div>
    </section>
  );
}
