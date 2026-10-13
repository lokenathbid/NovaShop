'use client';

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
 * Opens Razorpay standard checkout popup.
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
  const isLoaded = await loadRazorpayCheckoutScript();
  if (!isLoaded || !(window as any).Razorpay) {
    throw new Error(
      'Razorpay Checkout SDK could not be loaded. Please check your internet connection.'
    );
  }

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
      onSuccess({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      });
    },
    modal: {
      ondismiss: function () {
        if (onDismiss) onDismiss();
      },
    },
  };

  try {
    const rzp = new (window as any).Razorpay(options);
    if (onFailure) {
      rzp.on('payment.failed', function (resp: any) {
        onFailure(resp?.error);
      });
    }
    rzp.open();
    return true;
  } catch (err) {
    console.error('Failed to open Razorpay modal:', err);
    throw err;
  }
}
