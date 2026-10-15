'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Smartphone,
  Banknote,
  Package,
  Truck,
  Clock,
  Check,
  MapPin,
  Plus,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import type { Address, Order } from '@/types';
import { openRazorpayCheckout, isRazorpayClientConfigured } from '@/lib/razorpay-client';
import { restoreBodyScroll } from '@/lib/scroll-lock';

type PaymentMethod = 'card' | 'upi' | 'cod';
type DeliveryMethod = 'standard' | 'express' | 'overnight';

interface NewAddressForm {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

const initialAddressForm: NewAddressForm = {
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  landmark: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'India',
};

export default function CheckoutPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const { items, subtotal, discount, loading: cartLoading, refreshCart } = useCart();

  // Address state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [useCustomAddress, setUseCustomAddress] = useState(false);
  const [addressForm, setAddressForm] = useState<NewAddressForm>(initialAddressForm);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // Delivery & payment
  const [delivery, setDelivery] = useState<DeliveryMethod>('standard');
  const [payment, setPayment] = useState<PaymentMethod>('card');

  // Confirmation, submission & payment verification
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Idempotency key per checkout attempt
  const idempotencyKeyRef = useRef<string>('');

  useEffect(() => {
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = `checkout-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }
    return () => {
      restoreBodyScroll();
    };
  }, []);

  // Fetch saved addresses
  useEffect(() => {
    let isMounted = true;
    async function loadAddresses() {
      if (authStatus !== 'authenticated') {
        if (authStatus === 'unauthenticated') {
          setLoadingAddresses(false);
        }
        return;
      }

      try {
        setLoadingAddresses(true);
        const res = await fetch('/api/account/addresses');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.addresses) {
            setAddresses(data.addresses);
            const defaultAddr = data.addresses.find((a: Address) => a.isDefault);
            if (defaultAddr) {
              setSelectedAddressId(defaultAddr.id);
            } else if (data.addresses.length > 0) {
              setSelectedAddressId(data.addresses[0].id);
            } else {
              setUseCustomAddress(true);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load addresses:', err);
      } finally {
        if (isMounted) setLoadingAddresses(false);
      }
    }

    loadAddresses();
    return () => {
      isMounted = false;
    };
  }, [authStatus]);

  // Delivery calculation matching server rules
  let deliveryCost = 0;
  if (delivery === 'express') {
    deliveryCost = 149;
  } else if (delivery === 'overnight') {
    deliveryCost = 299;
  } else {
    deliveryCost = subtotal > 999 || subtotal === 0 ? 0 : 99;
  }

  const tax = 0; // standard inclusive
  const finalTotal = Math.round((subtotal + deliveryCost + tax) * 100) / 100;

  // Unauthenticated view
  if (authStatus === 'unauthenticated') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="glass rounded-3xl border border-white/8 p-8 sm:p-12">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-6 text-indigo-400">
            <ShieldCheck size={32} />
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3">
            Sign in to Complete Checkout
          </h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto text-sm sm:text-base">
            Please log in or create an account to access your saved addresses, secure payment, and track your orders.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login?callbackUrl=/checkout">
              <Button size="lg" className="w-full sm:w-auto">
                Sign In to Proceed
              </Button>
            </Link>
            <Link href="/register?callbackUrl=/checkout">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (cartLoading || authStatus === 'loading') {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-indigo-400" size={36} />
        <p className="text-slate-400 text-sm">Preparing checkout details...</p>
      </div>
    );
  }

  // Empty cart view
  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="glass rounded-3xl border border-white/8 p-8 sm:p-12">
          <ShoppingBag size={48} className="text-slate-600 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-white mb-2">Your Cart is Empty</h2>
          <p className="text-slate-400 text-sm mb-6">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Link href="/shop">
            <Button leftIcon={<Package size={16} />}>Explore Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!confirmed) {
      setError('Please check the confirmation box to verify your order.');
      return;
    }

    if (!useCustomAddress && !selectedAddressId) {
      setError('Please select a shipping address or enter a new one.');
      return;
    }

    if (useCustomAddress) {
      if (
        !addressForm.fullName ||
        !addressForm.phone ||
        !addressForm.addressLine1 ||
        !addressForm.city ||
        !addressForm.state ||
        !addressForm.zipCode
      ) {
        setError('Please fill in all required shipping address fields.');
        return;
      }
    }

    // Step 0: If online payment selected, detect missing Razorpay credentials before opening popup
    if (payment !== 'cod' && !isRazorpayClientConfigured()) {
      setError(
        'Razorpay Test Mode credentials are not configured. Please set RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, and NEXT_PUBLIC_RAZORPAY_KEY_ID in your environment variables to enable card and UPI payments.'
      );
      return;
    }

    try {
      setSubmitting(true);

      const payload: any = {
        deliveryMethod: delivery,
        paymentMethod: payment,
        idempotencyKey: idempotencyKeyRef.current,
      };

      if (useCustomAddress) {
        payload.shippingAddress = addressForm;
      } else {
        payload.addressId = selectedAddressId;
      }

      let data: any;

      // If user previously placed order that remained unpaid in this session, re-initiate payment
      if (pendingOrder && payment !== 'cod') {
        const payRes = await fetch('/api/payments/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: pendingOrder.id }),
        });

        const payData = await payRes.json();
        if (!payRes.ok) {
          throw new Error(payData.error || 'Failed to re-initiate payment.');
        }

        data = {
          order: pendingOrder,
          razorpay: {
            orderId: payData.razorpayOrderId,
            amount: payData.amount,
            currency: payData.currency,
            keyId: payData.keyId,
          },
        };
      } else {
        // Step 1 & 2: Create local order and gateway order on server using authoritative prices
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to place order.');
        }
      }

      // If Cash on Delivery, no gateway required
      if (payment === 'cod') {
        await refreshCart();
        router.push(`/orders/${data.order.id}?confirmed=true`);
        return;
      }

      // Validate payment gateway response from server before opening Razorpay
      if (!data.razorpay || typeof data.razorpay !== 'object') {
        throw new Error(
          'Payment gateway initialization failed: No payment order received from server.'
        );
      }

      const { keyId, orderId: rzpOrderId, amount: rzpAmount } = data.razorpay;

      if (!keyId || keyId.includes('placeholder') || !keyId.startsWith('rzp_')) {
        throw new Error(
          'Razorpay credentials are not configured on the server. Please set valid RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment variables.'
        );
      }

      if (!rzpOrderId || typeof rzpOrderId !== 'string' || !rzpOrderId.startsWith('order_')) {
        throw new Error(
          'Invalid Razorpay order ID received from server. A valid order ID is required.'
        );
      }

      if (typeof rzpAmount !== 'number' || rzpAmount <= 0) {
        throw new Error('Invalid payment amount received from server.');
      }

      // Step 3 & 4: Open Razorpay Checkout with authoritative details
      const activeAddress = useCustomAddress
        ? addressForm
        : addresses.find((a) => a.id === selectedAddressId);

      try {
        await openRazorpayCheckout({
          keyId,
          orderId: rzpOrderId,
          amount: rzpAmount,
          currency: data.razorpay.currency || 'INR',
          name: 'NovaShop',
          description: `Order #${data.order.id}`,
          prefill: {
            name: activeAddress?.fullName || session?.user?.name || '',
            email: session?.user?.email || '',
            contact: activeAddress?.phone || '',
          },
          onSuccess: async (rzpResponse) => {
            // Step 5 & 6: Cryptographic server-side verification of payment signature
            try {
              restoreBodyScroll();
              setVerifying(true);
              const verifyRes = await fetch('/api/payments/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: data.order.id,
                  razorpayOrderId: rzpResponse.razorpay_order_id,
                  razorpayPaymentId: rzpResponse.razorpay_payment_id,
                  razorpaySignature: rzpResponse.razorpay_signature,
                }),
              });

              const verifyData = await verifyRes.json();
              if (!verifyRes.ok) {
                throw new Error(verifyData.error || 'Payment signature verification failed.');
              }

              // Step 7: Clear cart and transition to confirmed & paid order page
              await refreshCart();
              router.push(`/orders/${data.order.id}?confirmed=true&paid=true`);
            } catch (vErr: any) {
              restoreBodyScroll();
              console.error('Payment verification error:', vErr);
              setError(vErr.message || 'Payment verification failed on the server.');
              setSubmitting(false);
              setVerifying(false);
              await refreshCart();
              router.push(`/orders/${data.order.id}?paymentFailed=true`);
            }
          },
          onDismiss: async () => {
            // Handle abandoned or dismissed payment window safely
            restoreBodyScroll();
            setSubmitting(false);
            setVerifying(false);
            setError(
              'Payment window was closed before completion. Your order has been placed in Pending status. You can retry payment anytime.'
            );
            try {
              await fetch('/api/payments/fail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: data.order.id,
                  razorpayOrderId: data.razorpay.orderId,
                  errorMessage: 'Payment window was closed by the user.',
                }),
              });
            } catch (failLogErr) {
              console.error('Failed to report payment dismissal:', failLogErr);
            }
            await refreshCart();
            setPendingOrder(data.order);
          },
          onFailure: async (failData) => {
            // Handle explicit card/bank decline from Razorpay
            restoreBodyScroll();
            setSubmitting(false);
            setVerifying(false);
            setError(
              `Payment failed: ${failData?.description || 'Transaction declined'}. Your reserved items are saved. Please retry.`
            );
            try {
              await fetch('/api/payments/fail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: data.order.id,
                  razorpayOrderId: data.razorpay.orderId,
                  razorpayPaymentId: failData?.metadata?.payment_id,
                  errorMessage: failData?.description || 'Payment failed',
                  metadata: failData,
                }),
              });
            } catch (failLogErr) {
              console.error('Failed to report payment failure:', failLogErr);
            }
            await refreshCart();
            setPendingOrder(data.order);
          },
        });
      } catch (checkoutErr: any) {
        restoreBodyScroll();
        console.error('Razorpay initialization error:', checkoutErr);
        setSubmitting(false);
        setVerifying(false);
        await refreshCart();
        setPendingOrder(data.order);
        setError(
          checkoutErr.message || 'Unable to open Razorpay payment gateway. You can view your order to retry payment.'
        );
      }
    } catch (err: any) {
      restoreBodyScroll();
      console.error('Order placement error:', err);
      setError(err?.message || 'Something went wrong while placing your order.');
      idempotencyKeyRef.current = `checkout-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      setSubmitting(false);
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white mb-1">Checkout</h1>
          <p className="text-slate-400 text-sm">Review your delivery and payment details</p>
        </div>
        <Link href="/cart" className="text-sm text-indigo-400 hover:text-indigo-300">
          ← Back to Cart
        </Link>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-3"
        >
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">Unable to place order</p>
            <p>{error}</p>
          </div>
        </motion.div>
      )}

      <form onSubmit={handlePlaceOrder} className="flex flex-col lg:flex-row gap-8">
        {/* Left: Forms */}
        <div className="flex-1 flex flex-col gap-6">
          {/* 1. Delivery Address */}
          <section className="glass rounded-2xl border border-white/8 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <MapPin size={20} className="text-indigo-400" />
                <h2 className="font-semibold text-white text-lg">1. Shipping Address</h2>
              </div>
              <Link
                href="/account/addresses"
                target="_blank"
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Manage Saved Addresses ↗
              </Link>
            </div>

            {loadingAddresses ? (
              <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
                <Loader2 className="animate-spin text-indigo-400" size={18} />
                Loading saved addresses...
              </div>
            ) : (
              <div className="space-y-4">
                {/* Saved addresses options */}
                {addresses.length > 0 && (
                  <div className="grid sm:grid-cols-2 gap-3 mb-4">
                    {addresses.map((addr) => {
                      const isSelected = !useCustomAddress && selectedAddressId === addr.id;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => {
                            setSelectedAddressId(addr.id);
                            setUseCustomAddress(false);
                          }}
                          className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-indigo-500/60 bg-indigo-500/10 ring-1 ring-indigo-500/30'
                              : 'border-white/8 hover:border-white/15 bg-white/[0.02]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/10 text-white capitalize">
                              {addr.label || addr.type || 'Home'}
                            </span>
                            {addr.isDefault && (
                              <span className="text-[10px] text-emerald-400 font-medium">Default</span>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-white">{addr.fullName}</p>
                          <p className="text-xs text-slate-400 line-clamp-1">{addr.addressLine1}</p>
                          {addr.addressLine2 && (
                            <p className="text-xs text-slate-400 line-clamp-1">{addr.addressLine2}</p>
                          )}
                          <p className="text-xs text-slate-400">
                            {addr.city}, {addr.state} - {addr.zipCode}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">{addr.phone}</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Option to toggle custom address */}
                <div className="pt-2">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-indigo-300 hover:text-indigo-200">
                    <input
                      type="checkbox"
                      checked={useCustomAddress}
                      onChange={(e) => setUseCustomAddress(e.target.checked)}
                      className="rounded accent-indigo-500"
                    />
                    <span>Deliver to a new address</span>
                  </label>
                </div>

                {/* New address input fields */}
                <AnimatePresence>
                  {useCustomAddress && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-white/8 mt-3"
                    >
                      <Input
                        label="Full Name *"
                        placeholder="Arjun Mehta"
                        value={addressForm.fullName}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, fullName: e.target.value })
                        }
                        className="sm:col-span-2"
                        required
                      />
                      <Input
                        label="Phone Number *"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={addressForm.phone}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, phone: e.target.value })
                        }
                        required
                      />
                      <Input
                        label="Country"
                        value={addressForm.country}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, country: e.target.value })
                        }
                      />
                      <Input
                        label="Address Line 1 *"
                        placeholder="House / Flat / Street"
                        value={addressForm.addressLine1}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, addressLine1: e.target.value })
                        }
                        className="sm:col-span-2"
                        required
                      />
                      <Input
                        label="Address Line 2 (Optional)"
                        placeholder="Apartment, suite, unit"
                        value={addressForm.addressLine2}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, addressLine2: e.target.value })
                        }
                        className="sm:col-span-2"
                      />
                      <Input
                        label="Landmark (Optional)"
                        placeholder="Near Metro Station"
                        value={addressForm.landmark}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, landmark: e.target.value })
                        }
                      />
                      <Input
                        label="City *"
                        placeholder="Mumbai"
                        value={addressForm.city}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, city: e.target.value })
                        }
                        required
                      />
                      <Input
                        label="State *"
                        placeholder="Maharashtra"
                        value={addressForm.state}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, state: e.target.value })
                        }
                        required
                      />
                      <Input
                        label="PIN / ZIP Code *"
                        placeholder="400058"
                        value={addressForm.zipCode}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, zipCode: e.target.value })
                        }
                        required
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </section>

          {/* 2. Delivery Method */}
          <section className="glass rounded-2xl border border-white/8 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Truck size={20} className="text-indigo-400" />
              <h2 className="font-semibold text-white text-lg">2. Delivery Method</h2>
            </div>
            <div className="flex flex-col gap-3">
              {[
                {
                  id: 'standard' as DeliveryMethod,
                  label: 'Standard Delivery',
                  time: '4–6 business days',
                  price: subtotal > 999 || subtotal === 0 ? 0 : 99,
                  badge: subtotal > 999 ? 'Free on orders above ₹999' : '₹99 standard rate',
                },
                {
                  id: 'express' as DeliveryMethod,
                  label: 'Express Delivery',
                  time: '2–3 business days',
                  price: 149,
                  badge: 'Faster transit',
                },
                {
                  id: 'overnight' as DeliveryMethod,
                  label: 'Overnight Delivery',
                  time: 'Next business day',
                  price: 299,
                  badge: 'Priority processing',
                },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    delivery === opt.id
                      ? 'border-indigo-500/60 bg-indigo-500/10 ring-1 ring-indigo-500/30'
                      : 'border-white/8 hover:border-white/15'
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    value={opt.id}
                    checked={delivery === opt.id}
                    onChange={() => setDelivery(opt.id)}
                    className="accent-indigo-500"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{opt.label}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Clock size={11} /> {opt.time} • <span className="text-slate-500">{opt.badge}</span>
                    </p>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      opt.price === 0 ? 'text-emerald-400' : 'text-white'
                    }`}
                  >
                    {opt.price === 0 ? 'Free' : formatCurrency(opt.price)}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* 3. Payment Method */}
          <section className="glass rounded-2xl border border-white/8 p-6">
            <div className="flex items-center gap-2 mb-5">
              <CreditCard size={20} className="text-indigo-400" />
              <h2 className="font-semibold text-white text-lg">3. Payment Method</h2>
            </div>
            <div className="flex flex-col gap-3 mb-4">
              {[
                {
                  id: 'card' as PaymentMethod,
                  icon: CreditCard,
                  label: 'Credit / Debit Card',
                  sub: 'Visa, Mastercard, RuPay & Amex via Razorpay Test Gateway',
                },
                {
                  id: 'upi' as PaymentMethod,
                  icon: Smartphone,
                  label: 'UPI (Instant Pay)',
                  sub: 'Google Pay, PhonePe, Paytm & BHIM UPI via Razorpay',
                },
                {
                  id: 'cod' as PaymentMethod,
                  icon: Banknote,
                  label: 'Cash on Delivery (COD)',
                  sub: 'Pay when your package arrives (Recorded as Unpaid until delivered)',
                },
              ].map(({ id, icon: Icon, label, sub }) => (
                <label
                  key={id}
                  className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    payment === id
                      ? 'border-indigo-500/60 bg-indigo-500/10 ring-1 ring-indigo-500/30'
                      : 'border-white/8 hover:border-white/15'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={id}
                    checked={payment === id}
                    onChange={() => setPayment(id)}
                    className="accent-indigo-500 mt-1"
                  />
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-indigo-400 flex-shrink-0">
                    <Icon size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
                  </div>
                </label>
              ))}
            </div>

            {payment !== 'cod' && !isRazorpayClientConfigured() && (
              <div className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-3">
                <AlertCircle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-200">Razorpay Test Mode Credentials Required</p>
                  <p className="text-amber-300/80 mt-1 leading-relaxed">
                    Razorpay test keys have not been configured yet. To test online payments, please set{' '}
                    <code className="px-1.5 py-0.5 rounded bg-black/40 text-amber-200 font-mono">NEXT_PUBLIC_RAZORPAY_KEY_ID</code>,{' '}
                    <code className="px-1.5 py-0.5 rounded bg-black/40 text-amber-200 font-mono">RAZORPAY_KEY_ID</code>, and{' '}
                    <code className="px-1.5 py-0.5 rounded bg-black/40 text-amber-200 font-mono">RAZORPAY_KEY_SECRET</code> in your local{' '}
                    <code className="px-1.5 py-0.5 rounded bg-black/40 text-amber-200 font-mono">.env</code> file. Alternatively, select{' '}
                    <span className="font-semibold text-white">Cash on Delivery (COD)</span> to test placing an order without payment gateway keys.
                  </p>
                </div>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-center gap-2.5">
              <ShieldCheck size={16} className="flex-shrink-0" />
              <span>
                Razorpay Test Mode: Payments are verified server-side with HMAC-SHA256 signatures. Sensitive payment credentials (cards, CVVs, UPI PINs) are never processed or stored on our servers.
              </span>
            </div>
          </section>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:w-96 flex-shrink-0">
          <div className="glass rounded-2xl border border-white/8 p-6 sticky top-24">
            <h3 className="font-semibold text-white text-lg mb-5">Order Summary</h3>

            {/* Cart items list */}
            <div className="flex flex-col gap-3 mb-5 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id || item.productId} className="flex items-center gap-3">
                  <img
                    src={
                      item.product.images[0]?.url ||
                      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'
                    }
                    alt={item.product.name}
                    className="w-12 h-12 rounded-lg flex-shrink-0 object-cover bg-white/5 border border-white/10"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white line-clamp-1 font-medium">{item.product.name}</p>
                    {item.variant && <p className="text-[10px] text-slate-400">{item.variant}</p>}
                    <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-xs font-semibold text-white">
                    {formatCurrency(item.product.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="border-t border-white/8 pt-4 flex flex-col gap-2.5 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Subtotal</span>
                <span className="text-white font-medium">{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Discount</span>
                  <span className="text-emerald-400">-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Shipping</span>
                <span className={deliveryCost === 0 ? 'text-emerald-400 font-medium' : 'text-white'}>
                  {deliveryCost === 0 ? 'Free' : formatCurrency(deliveryCost)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Tax</span>
                <span className="text-slate-400">Included (₹0.00)</span>
              </div>
              <div className="border-t border-white/8 pt-3 flex justify-between font-bold">
                <span className="text-white text-base">Total Amount</span>
                <span className="text-xl text-white font-display">{formatCurrency(finalTotal)}</span>
              </div>
            </div>

            {/* Pending order recovery if payment was interrupted */}
            {pendingOrder && (
              <div className="mb-5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                <p className="font-semibold mb-1">Order #{pendingOrder.id} Saved</p>
                <p className="mb-2 text-slate-300">
                  Your order has been recorded with reserved stock. You can complete payment now or view order details.
                </p>
                <Link
                  href={`/orders/${pendingOrder.id}`}
                  className="inline-flex items-center gap-1.5 font-semibold text-indigo-400 hover:text-indigo-300 underline"
                >
                  Go to Order Details <ArrowRight size={13} />
                </Link>
              </div>
            )}

            {/* Explicit confirmation */}
            <div className="mb-5 p-3.5 rounded-xl bg-white/[0.03] border border-white/8">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="rounded accent-indigo-500 mt-1 cursor-pointer"
                />
                <span className="text-xs text-slate-300 leading-relaxed select-none">
                  I have verified my delivery address and order items, and confirm this order placement.
                </span>
              </label>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              disabled={submitting || verifying || !confirmed}
              leftIcon={
                submitting || verifying ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Check size={18} />
                )
              }
            >
              {verifying
                ? 'Verifying Payment...'
                : submitting
                ? 'Connecting to Gateway...'
                : payment === 'cod'
                ? `Place COD Order • ${formatCurrency(finalTotal)}`
                : `Pay with Razorpay • ${formatCurrency(finalTotal)}`}
            </Button>

            <p className="text-center text-[11px] text-slate-500 mt-4 flex items-center justify-center gap-1.5">
              <ShieldCheck size={13} className="text-emerald-400" />
              Razorpay Secured • Idempotency Protected
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
