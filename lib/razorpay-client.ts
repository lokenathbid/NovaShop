'use client';

import { lockBodyScroll } from '@/lib/scroll-lock';

/**
 * Checks whether Razorpay public key is configured for client-side usage.
 */
export function isRazorpayClientConfigured(): boolean {
  if (typeof window === 'undefined') return false;
  const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  return Boolean(
    key &&
      !key.includes('placeholder') &&
      key.startsWith('rzp_')
  );
}

/**
 * Loads Razorpay Checkout script dynamically in the browser.
 */
export function loadRazorpayCheckoutScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    // Check if script tag already exists in DOM
    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true), { once: true });
      existingScript.addEventListener('error', () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay checkout script from CDN.');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

export interface RazorpayCheckoutOptions {
  keyId: string;
  orderId: string;
  amount: number; // in paise
  currency?: string;
  name?: string;
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  onSuccess: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  onDismiss?: () => void;
  onFailure?: (error: any) => void;
}

/**
 * Validates options and safely opens Razorpay standard checkout popup.
 * Preserves scroll state and ensures scroll lock and DOM overlays are reliably cleaned up.
 */
export async function openRazorpayCheckout({
  keyId,
  orderId,
  amount,
  currency = 'INR',
  name = 'NovaShop',
  description,
  prefill,
  onSuccess,
  onDismiss,
  onFailure,
}: RazorpayCheckoutOptions): Promise<boolean> {
  // 1. Validate credentials and options before touching SDK or DOM
  if (!keyId || keyId.includes('placeholder') || !keyId.startsWith('rzp_')) {
    throw new Error(
      'Razorpay Test Mode credentials are not configured. Please set NEXT_PUBLIC_RAZORPAY_KEY_ID in your environment variables.'
    );
  }

  if (!orderId || typeof orderId !== 'string' || !orderId.startsWith('order_')) {
    throw new Error(
      'Invalid Razorpay order ID received from server. A valid order ID is required.'
    );
  }

  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
    throw new Error('Invalid payment amount. Amount must be a positive number in paise.');
  }

  // 2. Load SDK script
  const isLoaded = await loadRazorpayCheckoutScript();
  if (!isLoaded || !(window as any).Razorpay) {
    throw new Error(
      'Razorpay Checkout SDK could not be loaded. Please check your internet connection.'
    );
  }

  // 3. Manage scroll lock with preservation of previous overflow styles
  const unlockScroll = lockBodyScroll();
  let isCleanedUp = false;

  const cleanup = () => {
    if (isCleanedUp) return;
    isCleanedUp = true;
    unlockScroll();

    // Clean up any lingering razorpay container or backdrops if orphaned
    if (typeof document !== 'undefined') {
      const rzpContainers = document.querySelectorAll('.razorpay-container');
      rzpContainers.forEach((el) => {
        try {
          el.remove();
        } catch {}
      });
    }
  };

  const options: any = {
    key: keyId,
    amount,
    currency,
    name,
    description: description || `Order #${orderId}`,
    order_id: orderId,
    prefill: {
      name: prefill?.name || '',
      email: prefill?.email || '',
      contact: prefill?.contact || '',
    },
    theme: {
      color: '#6366f1', // NovaShop Indigo
    },
    handler: function (response: any) {
      cleanup();
      onSuccess({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      });
    },
    modal: {
      ondismiss: function () {
        cleanup();
        if (onDismiss) onDismiss();
      },
    },
  };

  try {
    const rzp = new (window as any).Razorpay(options);

    if (onFailure) {
      rzp.on('payment.failed', function (resp: any) {
        cleanup();
        onFailure(resp?.error);
      });
    }

    // Fallback: If Razorpay removes its DOM container without triggering ondismiss
    if (typeof document !== 'undefined' && typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver(() => {
        if (!document.querySelector('.razorpay-container')) {
          cleanup();
          observer.disconnect();
        }
      });
      observer.observe(document.body, { childList: true });
    }

    rzp.open();
    return true;
  } catch (err) {
    cleanup();
    console.error('Failed to open Razorpay modal:', err);
    throw err;
  }
}
