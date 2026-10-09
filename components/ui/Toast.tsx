'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export default function ToastContainer({ toasts, onDismiss }: ToastProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'pointer-events-auto flex items-center gap-3 p-4 rounded-2xl glass-strong border shadow-2xl backdrop-blur-md',
              toast.type === 'success' && 'border-emerald-500/30 bg-emerald-950/40 text-emerald-200',
              toast.type === 'error' && 'border-rose-500/30 bg-rose-950/40 text-rose-200',
              toast.type === 'info' && 'border-indigo-500/30 bg-indigo-950/40 text-indigo-200'
            )}
          >
            {toast.type === 'success' && (
              <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
            )}
            {toast.type === 'error' && (
              <AlertCircle size={18} className="text-rose-400 flex-shrink-0" />
            )}
            {toast.type === 'info' && (
              <Info size={18} className="text-indigo-400 flex-shrink-0" />
            )}

            <p className="text-sm font-medium text-white flex-1 leading-snug">
              {toast.message}
            </p>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
