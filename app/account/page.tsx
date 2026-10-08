'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, Heart, MapPin, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { formatDate } from '@/lib/utils';
import AccountSidebar from '@/components/account/AccountSidebar';

interface DbAddress {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

interface DbOrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
}

interface DbOrder {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  items: DbOrderItem[];
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  role: string;
  createdAt: string;
  addresses: DbAddress[];
  orders: DbOrder[];
}

export default function AccountPage() {
  const { items: wishlistItems } = useWishlist();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchProfile() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/account/me');
        if (!res.ok) {
          if (res.status === 401) {
            window.location.href = '/login?callbackUrl=/account';
            return;
          }
          throw new Error('Failed to load profile');
        }
        const data = await res.json();
        if (isMounted) {
          setProfile(data.user);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error loading account:', err);
          setError('Could not load your account information. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalOrders = profile?.orders?.length ?? 0;
  const savedAddresses = profile?.addresses?.length ?? 0;

  const quickStats = [
    { label: 'Total Orders', value: totalOrders, icon: Package, href: '/orders' },
    { label: 'Wishlist Items', value: wishlistItems.length, icon: Heart, href: '/account/wishlist' },
    { label: 'Saved Addresses', value: savedAddresses, icon: MapPin, href: '/account/addresses' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-3xl font-bold text-white mb-8">My Account</h1>
      <div className="flex flex-col lg:flex-row gap-6">
        <AccountSidebar />
        <div className="flex-1">
          {loading ? (
            <div className="glass rounded-2xl border border-white/8 p-12 flex flex-col items-center justify-center min-h-[300px]">
              <Loader2 className="animate-spin text-indigo-400 mb-3" size={32} />
              <p className="text-slate-400 text-sm">Loading your account details...</p>
            </div>
          ) : error ? (
            <div className="glass rounded-2xl border border-red-500/20 p-8 flex items-center gap-4 text-red-400">
              <AlertCircle size={24} className="flex-shrink-0" />
              <div>
                <p className="font-medium">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 text-xs text-indigo-400 hover:underline"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : profile ? (
            <>
              {/* Profile card */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl border border-white/8 p-6 mb-6 flex items-center gap-5"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 shadow-lg shadow-indigo-500/20">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-xl font-bold text-white truncate">{profile.name}</h2>
                  <p className="text-slate-400 text-sm truncate">{profile.email}</p>
                  <p className="text-slate-500 text-xs mt-1">
                    Member since {formatDate(profile.createdAt)}
                  </p>
                </div>
                <Link
                  href="/account/profile"
                  className="ml-auto text-indigo-400 hover:text-indigo-300 transition-colors text-sm flex items-center gap-1 flex-shrink-0"
                >
                  Edit <ArrowRight size={14} />
                </Link>
              </motion.div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {quickStats.map(({ label, value, icon: Icon, href }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                  >
                    <Link
                      href={href}
                      className="glass rounded-2xl border border-white/8 p-4 flex flex-col items-center gap-2 hover:border-indigo-500/30 transition-colors group"
                    >
                      <Icon size={22} className="text-indigo-400" />
                      <span className="font-display text-2xl font-bold text-white">{value}</span>
                      <span className="text-xs text-slate-500 text-center">{label}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Recent orders */}
              <div className="glass rounded-2xl border border-white/8 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">Recent Orders</h3>
                  <Link href="/orders" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                    View all <ArrowRight size={12} className="inline" />
                  </Link>
                </div>

                {profile.orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package size={36} className="text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">No orders yet</p>
                    <Link
                      href="/shop"
                      className="inline-block mt-3 px-4 py-2 rounded-xl bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 text-xs font-medium transition-colors"
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {profile.orders.slice(0, 3).map((order) => (
                      <Link
                        key={order.id}
                        href={`/orders/${order.id}`}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors"
                      >
                        {order.items[0]?.productImage ? (
                          <img
                            src={order.items[0]?.productImage}
                            alt={order.id}
                            className="w-10 h-10 rounded-xl flex-shrink-0 object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300">
                            <Package size={18} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{order.id}</p>
                          <p className="text-xs text-slate-500">{formatDate(order.createdAt)}</p>
                        </div>
                        <span className="text-sm text-white font-semibold">
                          ₹{order.total.toLocaleString()}
                        </span>
                        <ArrowRight size={14} className="text-slate-600" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
