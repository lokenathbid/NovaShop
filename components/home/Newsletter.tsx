'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Sparkles } from 'lucide-react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
    }
  };

  return (
    <section className="py-20 bg-[#0d0d18]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium mb-5">
            <Sparkles size={12} className="text-amber-400" />
            Exclusive Newsletter
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3">
            Get <span className="gradient-text">Early Access</span>
          </h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Subscribe to NovaShop's newsletter for exclusive deals, new arrivals, and members-only
            offers delivered straight to your inbox.
          </p>

          {subscribed ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-2xl">
                ✓
              </div>
              <p className="text-emerald-400 font-semibold">You're in! Welcome to the club 🎉</p>
              <p className="text-slate-500 text-sm">Check your inbox for a special welcome offer.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
              <div className="relative flex-1">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  id="newsletter-email"
                  className="w-full h-12 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/60 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="h-12 px-5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-medium text-sm transition-all duration-200 hover:scale-105 shadow-lg shadow-indigo-500/30 flex items-center gap-1.5"
              >
                Subscribe
                <ArrowRight size={14} />
              </button>
            </form>
          )}

          {!subscribed && (
            <p className="text-xs text-slate-600 mt-4">
              No spam. Unsubscribe anytime. We respect your privacy.
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
