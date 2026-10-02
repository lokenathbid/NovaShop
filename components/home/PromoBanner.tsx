'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';

export default function PromoBanner() {
  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-3xl"
        style={{
          background:
            'linear-gradient(135deg, #1a1a3e 0%, #0f0f2a 50%, #1a0a2e 100%)',
        }}
      >
        {/* Ambient glows */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px]" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-violet-600/15 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 right-1/4 w-40 h-40 bg-amber-500/10 rounded-full blur-[60px]" />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative grid lg:grid-cols-2 items-center gap-8 p-8 sm:p-12 lg:p-16">
          {/* Text */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-medium mb-5">
              <Zap size={12} className="fill-amber-300" />
              Limited Time Offer
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
              Upgrade Your
              <br />
              <span className="gradient-text">Everyday</span>
            </h2>
            <p className="text-slate-400 text-lg mb-6 leading-relaxed max-w-md">
              Get up to <span className="text-amber-400 font-bold">40% off</span> on premium
              electronics, fashion, and lifestyle products. Shop more, save more — this weekend only.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold px-6 py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-amber-500/30"
            >
              Shop the Sale <ArrowRight size={16} />
            </Link>
          </div>

          {/* Visual */}
          <div className="relative h-60 lg:h-80 hidden sm:flex items-center justify-center">
            {/* Floating shapes */}
            <div className="absolute w-48 h-48 rounded-3xl animate-float"
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.4) 0%, rgba(139,92,246,0.4) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 30px 80px rgba(99,102,241,0.3)',
              }}
            />
            <div
              className="absolute w-32 h-32 rounded-2xl animate-float-reverse"
              style={{
                background: 'linear-gradient(135deg, rgba(245,158,11,0.3) 0%, rgba(251,191,36,0.3) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                transform: 'translateX(60px) translateY(-20px)',
                boxShadow: '0 20px 60px rgba(245,158,11,0.2)',
              }}
            />
            <div className="absolute text-6xl animate-float" style={{ animationDelay: '0.5s' }}>
              ✨
            </div>
            {/* Badge */}
            <div className="absolute -top-4 -right-4 bg-amber-500 text-slate-900 font-display font-black text-xl w-20 h-20 rounded-full flex items-center justify-center shadow-xl shadow-amber-500/40 animate-pulse-glow">
              40%<br />
              <span className="text-xs">OFF</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
