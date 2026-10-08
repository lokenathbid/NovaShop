'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/account';
  const registered = searchParams.get('registered');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState(
    registered ? 'Account created successfully! Please sign in.' : ''
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setErrorMessage('Invalid email or password. Please try again.');
        setLoading(false);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMessage('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="glass-strong rounded-3xl border border-white/10 p-8">
      <h1 className="font-display text-2xl font-bold text-white text-center mb-1">Welcome back</h1>
      <p className="text-slate-400 text-sm text-center mb-6">Sign in to your account to continue</p>

      {/* Success Notification */}
      {successMessage && (
        <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 size={16} className="flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Social login buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {['Google', 'Apple'].map((provider) => (
          <button
            key={provider}
            type="button"
            className="h-11 rounded-xl glass border border-white/10 hover:border-white/20 text-sm text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="text-base">{provider === 'Google' ? '🌐' : '🍎'}</span>
            {provider}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-white/8" />
        <span className="text-xs text-slate-600">or continue with email</span>
        <div className="flex-1 h-px bg-white/8" />
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          leftIcon={<Mail size={16} />}
          id="login-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          autoComplete="email"
          required
        />
        <Input
          label="Password"
          type={showPass ? 'text' : 'password'}
          placeholder="••••••••"
          leftIcon={<Lock size={16} />}
          id="login-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          autoComplete="current-password"
          required
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              aria-label="Toggle password visibility"
              className="hover:text-white transition-colors"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="accent-indigo-500 w-4 h-4 rounded" disabled={loading} />
            <span className="text-xs text-slate-400">Remember me</span>
          </label>
          <Link href="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
            Forgot password?
          </Link>
        </div>

        <Button fullWidth size="lg" type="submit" loading={loading} className="mt-1">
          {loading ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-5">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
          Create one
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      {/* Ambient BG */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-indigo-500/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-violet-500/6 rounded-full blur-[80px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/40">
            <Zap size={20} className="text-white fill-white" />
          </div>
          <span className="font-display font-bold text-2xl text-white">
            Nova<span className="text-indigo-400">Shop</span>
          </span>
        </div>

        <Suspense fallback={<div className="glass-strong rounded-3xl border border-white/10 p-8 h-96 flex items-center justify-center text-slate-400">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
