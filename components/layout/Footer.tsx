'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Zap,
  Globe,
  MessageCircle,
  Play,
  Users,
  Mail,
  ArrowRight,
  MapPin,
  Phone,
  Shield,
  Truck,
  RotateCcw,
  Headphones,
} from 'lucide-react';

const footerLinks = {
  Shop: [
    { label: 'All Products', href: '/shop' },
    { label: 'New Arrivals', href: '/shop?sort=newest' },
    { label: 'Best Sellers', href: '/shop?sort=popular' },
    { label: 'Deals & Offers', href: '/shop?filter=sale' },
  ],
  'Customer Service': [
    { label: 'Contact Us', href: '/contact' },
    { label: 'Shipping Info', href: '/shipping' },
    { label: 'Returns & Refunds', href: '/returns' },
    { label: 'FAQ', href: '/faq' },
  ],
  Account: [
    { label: 'My Account', href: '/account' },
    { label: 'Orders', href: '/orders' },
    { label: 'Wishlist', href: '/wishlist' },
    { label: 'Addresses', href: '/account/addresses' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms & Conditions', href: '/terms' },
    { label: 'Careers', href: '/careers' },
  ],
};

const socialLinks = [
  { icon: Globe, href: '#', label: 'Instagram' },
  { icon: MessageCircle, href: '#', label: 'Twitter/X' },
  { icon: Play, href: '#', label: 'YouTube' },
  { icon: Users, href: '#', label: 'Facebook' },
];

const trustItems = [
  { icon: Shield, label: 'Secure Payments' },
  { icon: Truck, label: 'Fast Delivery' },
  { icon: RotateCcw, label: 'Easy Returns' },
  { icon: Headphones, label: '24/7 Support' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="border-t border-white/6 bg-[#0a0a0f]">
      {/* Trust bar */}
      <div className="border-b border-white/6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustItems.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-indigo-400" />
                </div>
                <span className="text-sm font-medium text-slate-300">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/40">
                <Zap size={16} className="text-white fill-white" />
              </div>
              <span className="font-display font-bold text-xl text-white">
                Nova<span className="text-indigo-400">Shop</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-5 max-w-xs">
              Premium products. Seamless shopping. Delivered to your door with care and speed.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-2 mb-6">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/15 transition-all duration-200"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>

            {/* Contact info */}
            <div className="flex flex-col gap-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Mail size={13} />
                <span>support@novashop.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={13} />
                <span>+91 1800-000-0000</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={13} />
                <span>Mumbai, Maharashtra, India</span>
              </div>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-sm font-semibold text-white mb-4">{section}</h4>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 hover:text-indigo-300 transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className="border-t border-white/6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-base font-semibold text-white mb-1">Stay in the loop</h4>
              <p className="text-sm text-slate-500">
                Get exclusive deals and early access to new arrivals.
              </p>
            </div>
            {subscribed ? (
              <p className="text-sm text-emerald-400 font-medium">
                ✓ You're subscribed! Thanks.
              </p>
            ) : (
              <form
                onSubmit={handleSubscribe}
                className="flex w-full sm:w-auto gap-2"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 sm:w-64 h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/60 transition-colors"
                />
                <button
                  type="submit"
                  className="h-10 px-4 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium transition-colors flex items-center gap-1.5"
                >
                  Subscribe <ArrowRight size={14} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <p>© {new Date().getFullYear()} NovaShop. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="text-slate-500">Payments accepted:</span>
                {['VISA', 'MC', 'UPI', 'Paytm'].map((m) => (
                  <span
                    key={m}
                    className="px-2 py-0.5 rounded bg-white/5 border border-white/8 font-medium text-slate-400"
                  >
                    {m}
                  </span>
                ))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
