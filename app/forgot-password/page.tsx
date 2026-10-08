'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Zap, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to submit request.');
        setLoading(false);
        return;
      }

      setSent(true);
    } catch (err) {
      console.error('Forgot password error:', err);
      setErrorMessage('Something went wrong. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

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
          <span className="font-display font-bold text-2xl text-white">
            Nova<span className="text-indigo-400">Shop</span>
          </span>
        </div>

        <div className="glass-strong rounded-3xl border border-white/10 p-8 text-center">
          {sent ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
                <Check size={28} className="text-emerald-400" />
              </div>
              <h1 className="font-display text-2xl font-bold text-white mb-2">Check your inbox</h1>
              <p className="text-slate-400 text-sm mb-6">
                If an account matches <span className="text-white font-medium">{email}</span>, we've sent password reset instructions.
              </p>
              <Link href="/login">
                <Button fullWidth variant="secondary">Back to Login</Button>
              </Link>
            </motion.div>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center mx-auto mb-5">
                <Mail size={26} className="text-indigo-400" />
              </div>
              <h1 className="font-display text-2xl font-bold text-white mb-2">Forgot Password?</h1>
              <p className="text-slate-400 text-sm mb-6">
                Enter your email address and we'll send you instructions to reset your password.
              </p>

              {errorMessage && (
                <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 text-left">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form className="flex flex-col gap-4 text-left" onSubmit={handleSubmit}>
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  leftIcon={<Mail size={16} />}
                  id="forgot-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
                <Button fullWidth size="lg" type="submit" loading={loading}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
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
