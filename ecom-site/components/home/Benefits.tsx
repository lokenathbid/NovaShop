'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Truck, RotateCcw, BadgeCheck, Headphones } from 'lucide-react';

const benefits = [
  {
    icon: Shield,
    title: 'Secure Payments',
    description:
      '256-bit SSL encryption on every transaction. Your financial data is always protected.',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description:
      'Express shipping available. Standard delivery in 2–4 business days across India.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    description:
      '30-day hassle-free return policy. No questions asked on most products.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  {
    icon: BadgeCheck,
    title: 'Genuine Products',
    description:
      '100% authentic products sourced directly from verified brands and manufacturers.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description:
      'Our support team is always available via chat, email, or phone to help you.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
  },
];

export default function Benefits() {
  return (
    <section className="py-20 bg-[#0d0d18]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-indigo-400 text-sm font-medium mb-2"
          >
            Why Choose NovaShop
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="font-display text-3xl sm:text-4xl font-bold text-white"
          >
            Shopping Made <span className="gradient-text">Premium</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {benefits.map(({ icon: Icon, title, description, color, bg, border }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className={`relative p-5 rounded-2xl border ${border} ${bg} group card-hover`}
            >
              <div
                className={`w-11 h-11 rounded-xl ${bg} border ${border} flex items-center justify-center mb-4`}
              >
                <Icon size={22} className={color} />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">{title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
