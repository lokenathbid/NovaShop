'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Smartphone, Package, Truck, Clock, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Link from 'next/link';

type PaymentMethod = 'card' | 'upi' | 'cod';
type DeliveryMethod = 'standard' | 'express' | 'overnight';

const deliveryOptions = [
  { id: 'standard' as DeliveryMethod, label: 'Standard Delivery', time: '4–6 business days', price: 0 },
  { id: 'express' as DeliveryMethod, label: 'Express Delivery', time: '2–3 business days', price: 149 },
  { id: 'overnight' as DeliveryMethod, label: 'Overnight Delivery', time: 'Next business day', price: 299 },
];

export default function CheckoutPage() {
  const { items, subtotal, discount, total } = useCart();
  const [delivery, setDelivery] = useState<DeliveryMethod>('standard');
  const [payment, setPayment] = useState<PaymentMethod>('card');
  const [placed, setPlaced] = useState(false);

  const deliveryCost = deliveryOptions.find((d) => d.id === delivery)?.price ?? 0;
  const grandTotal = total + deliveryCost;

  if (placed) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-sm"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
            <Check size={36} className="text-emerald-400" />
          </div>
          <h2 className="font-display text-3xl font-bold text-white mb-2">Order Placed!</h2>
          <p className="text-slate-400 mb-8">
            Thank you for your order. You'll receive a confirmation email shortly.
          </p>
          <Link href="/orders">
            <Button fullWidth>View My Orders</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-3xl font-bold text-white mb-8">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Forms */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Contact */}
          <section className="glass rounded-2xl border border-white/8 p-6">
            <h2 className="font-semibold text-white mb-5">1. Contact Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Email" type="email" placeholder="you@example.com" />
              <Input label="Phone" type="tel" placeholder="+91 98765 43210" />
            </div>
          </section>

          {/* Shipping Address */}
          <section className="glass rounded-2xl border border-white/8 p-6">
            <h2 className="font-semibold text-white mb-5">2. Shipping Address</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Full Name" placeholder="Arjun Mehta" className="sm:col-span-2" />
              <Input label="Address Line 1" placeholder="Flat 4B, Skyline Residency" className="sm:col-span-2" />
              <Input label="Address Line 2 (optional)" placeholder="Andheri West" className="sm:col-span-2" />
              <Input label="City" placeholder="Mumbai" />
              <Input label="State" placeholder="Maharashtra" />
              <Input label="PIN Code" placeholder="400058" />
              <Input label="Country" placeholder="India" />
              <Input label="Phone" type="tel" placeholder="+91 98765 43210" />
            </div>
          </section>

          {/* Delivery */}
          <section className="glass rounded-2xl border border-white/8 p-6">
            <h2 className="font-semibold text-white mb-5">3. Delivery Method</h2>
            <div className="flex flex-col gap-3">
              {deliveryOptions.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    delivery === opt.id
                      ? 'border-indigo-500/60 bg-indigo-500/10'
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
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Clock size={11} /> {opt.time}
                    </p>
                  </div>
                  <span className={`text-sm font-semibold ${opt.price === 0 ? 'text-emerald-400' : 'text-white'}`}>
                    {opt.price === 0 ? 'Free' : formatCurrency(opt.price)}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Payment */}
          <section className="glass rounded-2xl border border-white/8 p-6">
            <h2 className="font-semibold text-white mb-5">4. Payment Method</h2>
            <div className="flex flex-col gap-3 mb-5">
              {[
                { id: 'card' as PaymentMethod, icon: CreditCard, label: 'Credit / Debit Card' },
                { id: 'upi' as PaymentMethod, icon: Smartphone, label: 'UPI' },
                { id: 'cod' as PaymentMethod, icon: Package, label: 'Cash on Delivery' },
              ].map(({ id, icon: Icon, label }) => (
                <label
                  key={id}
                  className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    payment === id
                      ? 'border-indigo-500/60 bg-indigo-500/10'
                      : 'border-white/8 hover:border-white/15'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={id}
                    checked={payment === id}
                    onChange={() => setPayment(id)}
                    className="accent-indigo-500"
                  />
                  <Icon size={18} className="text-slate-400" />
                  <span className="text-sm font-medium text-white">{label}</span>
                </label>
              ))}
            </div>

            {payment === 'card' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="border-t border-white/8 pt-5 grid sm:grid-cols-2 gap-4"
              >
                <Input label="Card Number" placeholder="1234 5678 9012 3456" className="sm:col-span-2" />
                <Input label="Cardholder Name" placeholder="ARJUN MEHTA" className="sm:col-span-2" />
                <Input label="Expiry" placeholder="MM / YY" />
                <Input label="CVV" placeholder="•••" type="password" />
              </motion.div>
            )}
            {payment === 'upi' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="border-t border-white/8 pt-5"
              >
                <Input label="UPI ID" placeholder="yourname@upi" />
              </motion.div>
            )}
          </section>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="glass rounded-2xl border border-white/8 p-6 sticky top-24">
            <h3 className="font-semibold text-white text-lg mb-5">Order Summary</h3>

            <div className="flex flex-col gap-3 mb-5 max-h-64 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg flex-shrink-0"
                    style={{ background: item.product.images[0]?.url }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white line-clamp-1">{item.product.name}</p>
                    <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-xs font-semibold text-white">
                    {formatCurrency(item.product.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-white/8 pt-4 flex flex-col gap-2.5 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Subtotal</span>
                <span className="text-white">{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Discount</span>
                  <span className="text-emerald-400">-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Shipping</span>
                <span className={deliveryCost === 0 ? 'text-emerald-400' : 'text-white'}>
                  {deliveryCost === 0 ? 'Free' : formatCurrency(deliveryCost)}
                </span>
              </div>
              <div className="border-t border-white/8 pt-3 flex justify-between font-bold">
                <span className="text-white">Total</span>
                <span className="text-xl text-white">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <Button
              fullWidth
              size="lg"
              onClick={() => setPlaced(true)}
              leftIcon={<Truck size={18} />}
            >
              Place Order
            </Button>

            <p className="text-center text-xs text-slate-600 mt-4">
              🔒 Secured by 256-bit SSL encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
