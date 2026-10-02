'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'ghost' | 'new' | 'sale';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
  accent: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  success: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  warning: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
  danger: 'bg-red-500/20 text-red-300 border border-red-500/30',
  ghost: 'bg-white/5 text-slate-400 border border-white/10',
  new: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
  sale: 'bg-rose-500/90 text-white',
};

export default function Badge({ variant = 'primary', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium',
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
