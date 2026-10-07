'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, Heart, MapPin, Settings, ArrowRight } from 'lucide-react';
import { mockUser } from '@/data/users';
import { orders } from '@/data/orders';
import { useWishlist } from '@/context/WishlistContext';
import { formatDate } from '@/lib/utils';
import AccountSidebar from '@/components/account/AccountSidebar';

export default function AccountPage() {
  const { items: wishlistItems } = useWishlist();
  const userOrders = orders;

  const quickStats = [
    { label: 'Total Orders', value: userOrders.length, icon: Package, href: '/orders' },
    { label: 'Wishlist Items', value: wishlistItems.length, icon: Heart, href: '/account/wishlist' },
    { label: 'Saved Addresses', value: mockUser.addresses.length, icon: MapPin, href: '/account/addresses' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-3xl font-bold text-white mb-8">My Account</h1>
      <div className="flex flex-col lg:flex-row gap-6">
        <AccountSidebar />
        <div className="flex-1">
          {/* Profile card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl border border-white/8 p-6 mb-6 flex items-center gap-5"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
              {mockUser.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-white">{mockUser.name}</h2>
              <p className="text-slate-400 text-sm">{mockUser.email}</p>
              <p className="text-slate-500 text-xs mt-1">Member since {formatDate(mockUser.createdAt)}</p>
            </div>
            <Link href="/account/profile" className="ml-auto text-indigo-400 hover:text-indigo-300 transition-colors text-sm flex items-center gap-1">
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
                <Link href={href} className="glass rounded-2xl border border-white/8 p-4 flex flex-col items-center gap-2 hover:border-indigo-500/30 transition-colors group">
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
            <div className="flex flex-col gap-3">
              {userOrders.slice(0, 3).map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <img src={order.items[0]?.productImage} alt={order.id} className="w-10 h-10 rounded-xl flex-shrink-0 object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{order.id}</p>
                    <p className="text-xs text-slate-500">{formatDate(order.createdAt)}</p>
                  </div>
                  <span className="text-sm text-white font-semibold">₹{order.total.toLocaleString()}</span>
                  <ArrowRight size={14} className="text-slate-600" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
