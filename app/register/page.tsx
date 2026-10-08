'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Zap, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to create account. Please try again.');
        setLoading(false);
        return;
      }

      // Automatically authenticate user after registration
      const signInRes = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (!signInRes?.error) {
        router.push('/account');
        router.refresh();
      } else {
        // Fallback redirect to login page with registered query
        router.push('/login?registered=true');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setErrorMessage('Something went wrong. Please check your internet connection.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/4 right-1/3 w-80 h-80 bg-indigo-500/8 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
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

        <div className="glass-strong rounded-3xl border border-white/10 p-8">
          <h1 className="font-display text-2xl font-bold text-white text-center mb-1">Create account</h1>
          <p className="text-slate-400 text-sm text-center mb-6">Join NovaShop — it's free</p>

          {/* Error Notification */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

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
            <span className="text-xs text-slate-600">or sign up with email</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input
              label="Full Name"
              type="text"
              placeholder="Arjun Mehta"
              leftIcon={<User size={16} />}
              id="register-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              autoComplete="name"
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail size={16} />}
              id="register-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
              required
            />
            <Input
              label="Password"
              type={showPass ? 'text' : 'password'}
              placeholder="At least 8 characters"
              leftIcon={<Lock size={16} />}
              id="register-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
              required
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label="Toggle password"
                  className="hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock size={16} />}
              id="register-confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
              required
            />

            <p className="text-xs text-slate-500">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-indigo-400 hover:underline">Terms</Link> and{' '}
              <Link href="/privacy" className="text-indigo-400 hover:underline">Privacy Policy</Link>.
            </p>

            <Button fullWidth size="lg" type="submit" loading={loading} className="mt-1">
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
