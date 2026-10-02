'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Zap, ArrowLeft, Check } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/40">
            <Zap size={20} className="text-white fill-white" />
          </div>
        </div>

        <div className="glass-strong rounded-3xl border border-white/10 p-8 text-center">
          {sent ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
                <Check size={28} className="text-emerald-400" />
              </div>
              <h1 className="font-display text-2xl font-bold text-white mb-2">Check your inbox</h1>
              <p className="text-slate-400 text-sm mb-6">
                We've sent a password reset link to your email. Check your spam folder if it doesn't arrive.
              </p>
              <Link href="/login"><Button fullWidth variant="secondary">Back to Login</Button></Link>
            </motion.div>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center mx-auto mb-5">
                <Mail size={26} className="text-indigo-400" />
              </div>
              <h1 className="font-display text-2xl font-bold text-white mb-2">Forgot Password?</h1>
              <p className="text-slate-400 text-sm mb-6">
                Enter your email and we'll send you a link to reset your password.
              </p>
              <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
                <Input label="Email" type="email" placeholder="you@example.com" leftIcon={<Mail size={16} />} id="forgot-email" />
                <Button fullWidth size="lg" type="submit">Send Reset Link</Button>
              </form>
              <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 mt-5 transition-colors">
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
