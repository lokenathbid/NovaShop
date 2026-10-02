'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Heart,
  User,
  Search,
  Menu,
  X,
  Zap,
  ChevronDown,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { categories } from '@/data/categories';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Categories', href: '#categories', hasDropdown: true },
];

export default function Navbar() {
  const pathname = usePathname();
  const { itemCount: cartCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setCategoriesOpen(false);
  }, [pathname]);

  const iconLinks = [
    { label: 'Search', href: '/search', icon: Search, count: null },
    { label: 'Wishlist', href: '/wishlist', icon: Heart, count: wishlistCount },
    { label: 'Cart', href: '/cart', icon: ShoppingCart, count: cartCount },
    { label: 'Account', href: '/account', icon: User, count: null },
  ];

  return (
    <>
      <header
        className={cn(
          'fixed top-0 inset-x-0 z-40 transition-all duration-300',
          scrolled
            ? 'glass border-b border-white/8 shadow-2xl shadow-black/30'
            : 'bg-transparent',
        )}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/40 group-hover:scale-110 transition-transform">
              <Zap size={16} className="text-white fill-white" />
            </div>
            <span className="font-display font-bold text-lg text-white tracking-tight">
              Nova<span className="text-indigo-400">Shop</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) =>
              link.hasDropdown ? (
                <div key={link.label} className="relative">
                  <button
                    onClick={() => setCategoriesOpen((o) => !o)}
                    className={cn(
                      'flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                      'text-slate-300 hover:text-white hover:bg-white/8',
                    )}
                  >
                    {link.label}
                    <ChevronDown
                      size={14}
                      className={cn(
                        'transition-transform duration-200',
                        categoriesOpen && 'rotate-180',
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {categoriesOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setCategoriesOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.96 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 glass-strong rounded-2xl shadow-2xl overflow-hidden z-20"
                        >
                          <div className="p-2">
                            {categories.map((cat) => (
                              <Link
                                key={cat.id}
                                href={`/shop/${cat.slug}`}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/8 transition-colors group"
                                onClick={() => setCategoriesOpen(false)}
                              >
                                <div
                                  className="w-8 h-8 rounded-lg flex-shrink-0"
                                  style={{ background: cat.image }}
                                />
                                <div>
                                  <p className="text-sm font-medium text-white">{cat.name}</p>
                                  <p className="text-xs text-slate-500">{cat.productCount} products</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                    pathname === link.href
                      ? 'text-white bg-white/8'
                      : 'text-slate-300 hover:text-white hover:bg-white/8',
                  )}
                >
                  {link.label}
                </Link>
              ),
            )}
          </div>

          {/* Desktop Icon Links */}
          <div className="hidden md:flex items-center gap-1">
            {iconLinks.map(({ label, href, icon: Icon, count }) => (
              <Link
                key={label}
                href={href}
                aria-label={label}
                className={cn(
                  'relative p-2.5 rounded-xl transition-all duration-200',
                  'text-slate-400 hover:text-white hover:bg-white/8',
                  pathname === href && 'text-white bg-white/8',
                )}
              >
                <Icon size={20} />
                {count !== null && count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-indigo-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white leading-none px-0.5"
                  >
                    {count > 99 ? '99+' : count}
                  </motion.span>
                )}
              </Link>
            ))}
          </div>

          {/* Mobile Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <Link href="/cart" className="relative p-2 text-slate-300">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] bg-indigo-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle mobile menu"
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/8 transition-colors"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 z-40 w-72 glass-strong border-l border-white/8 md:hidden overflow-y-auto"
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-6">
                  <span className="font-display font-bold text-white text-lg">Menu</span>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Nav Links */}
                <nav className="flex flex-col gap-1 mb-6">
                  {[
                    { label: 'Home', href: '/' },
                    { label: 'Shop All', href: '/shop' },
                    { label: 'Search', href: '/search' },
                    { label: 'Wishlist', href: '/wishlist' },
                    { label: 'Cart', href: '/cart' },
                    { label: 'Orders', href: '/orders' },
                    { label: 'My Account', href: '/account' },
                  ].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        'px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                        pathname === link.href
                          ? 'bg-indigo-500/20 text-indigo-300'
                          : 'text-slate-300 hover:bg-white/8 hover:text-white',
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                {/* Categories */}
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-500 mb-3 px-4">
                    Categories
                  </p>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/shop/${cat.slug}`}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/8 transition-colors"
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex-shrink-0"
                        style={{ background: cat.image }}
                      />
                      <span className="text-sm text-slate-300">{cat.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="h-16" />
    </>
  );
}
