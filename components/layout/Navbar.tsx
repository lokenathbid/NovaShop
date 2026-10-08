'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
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
  LogOut,
  LogIn,
  UserPlus,
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
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const { itemCount: cartCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setCategoriesOpen(false);
    setUserDropdownOpen(false);
  }, [pathname]);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    setMobileOpen(false);
    await signOut({ callbackUrl: '/login' });
  };

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
                      'text-slate-300 hover:text-white hover:bg-white/8 cursor-pointer',
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
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 glass-strong rounded-2xl shadow-2xl overflow-hidden z-20 border border-white/10"
                        >
                          <div className="p-2">
                            {categories.map((cat) => (
                              <Link
                                key={cat.id}
                                href={`/shop/${cat.slug}`}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/8 transition-colors group"
                                onClick={() => setCategoriesOpen(false)}
                              >
                                <img
                                  src={cat.image}
                                  alt={cat.name}
                                  className="w-8 h-8 rounded-lg flex-shrink-0 object-cover"
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

            {/* Authenticated Links in Nav */}
            {isAuthenticated && (
              <Link
                href="/orders"
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                  pathname === '/orders'
                    ? 'text-white bg-white/8'
                    : 'text-slate-300 hover:text-white hover:bg-white/8',
                )}
              >
                Orders
              </Link>
            )}
          </div>

          {/* Desktop Icon Links */}
          <div className="hidden md:flex items-center gap-1.5">
            {/* Search */}
            <Link
              href="/search"
              aria-label="Search"
              className={cn(
                'relative p-2.5 rounded-xl transition-all duration-200',
                'text-slate-400 hover:text-white hover:bg-white/8',
                pathname === '/search' && 'text-white bg-white/8',
              )}
            >
              <Search size={20} />
            </Link>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className={cn(
                'relative p-2.5 rounded-xl transition-all duration-200',
                'text-slate-400 hover:text-white hover:bg-white/8',
                pathname === '/wishlist' && 'text-white bg-white/8',
              )}
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <motion.span
                  key={wishlistCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-indigo-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white leading-none px-0.5"
                >
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </motion.span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              aria-label="Cart"
              className={cn(
                'relative p-2.5 rounded-xl transition-all duration-200',
                'text-slate-400 hover:text-white hover:bg-white/8',
                pathname === '/cart' && 'text-white bg-white/8',
              )}
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-indigo-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white leading-none px-0.5"
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </motion.span>
              )}
            </Link>

            {/* Authenticated: User Dropdown / Icon */}
            {isAuthenticated ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen((o) => !o)}
                  aria-label="User Account"
                  className={cn(
                    'flex items-center gap-2 p-1.5 pl-2 rounded-xl transition-all duration-200 cursor-pointer',
                    'text-slate-300 hover:text-white hover:bg-white/8 border border-white/10',
                    userDropdownOpen && 'bg-white/10 border-indigo-500/40',
                  )}
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/30 text-indigo-300 flex items-center justify-center font-bold text-xs">
                    {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <ChevronDown
                    size={14}
                    className={cn('transition-transform text-slate-400', userDropdownOpen && 'rotate-180')}
                  />
                </button>

                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 glass-strong rounded-2xl shadow-2xl p-2 z-50 border border-white/10"
                    >
                      {/* User Info Header */}
                      <div className="px-3 py-2.5 border-b border-white/8 mb-1">
                        <p className="text-sm font-semibold text-white truncate">
                          {session?.user?.name || 'My Account'}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {session?.user?.email}
                        </p>
                      </div>

                      {/* Dropdown Items */}
                      <Link
                        href="/account"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/8 transition-colors"
                      >
                        <User size={16} />
                        <span>Account</span>
                      </Link>

                      <Link
                        href="/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/8 transition-colors"
                      >
                        <Package size={16} />
                        <span>Orders</span>
                      </Link>

                      <Link
                        href="/account/wishlist"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/8 transition-colors"
                      >
                        <Heart size={16} />
                        <span>Wishlist</span>
                      </Link>

                      <div className="h-px bg-white/8 my-1" />

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-left cursor-pointer"
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Unauthenticated: Login button */
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-slate-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 ml-1"
              >
                <LogIn size={16} />
                <span>Login</span>
              </Link>
            )}
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
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/8 transition-colors cursor-pointer"
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
              <div className="p-5 flex flex-col min-h-full">
                <div className="flex items-center justify-between mb-6">
                  <span className="font-display font-bold text-white text-lg">Menu</span>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Authenticated User Banner in Mobile */}
                {isAuthenticated && (
                  <div className="p-3 mb-4 rounded-xl bg-white/5 border border-white/8 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                      {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">
                        {session?.user?.name}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {session?.user?.email}
                      </p>
                    </div>
                  </div>
                )}

                {/* Nav Links */}
                <nav className="flex flex-col gap-1 mb-6">
                  {(isAuthenticated
                    ? [
                        { label: 'Home', href: '/' },
                        { label: 'Shop All', href: '/shop' },
                        { label: 'Search', href: '/search' },
                        { label: 'Wishlist', href: '/wishlist' },
                        { label: 'Cart', href: '/cart' },
                        { label: 'Orders', href: '/orders' },
                        { label: 'My Account', href: '/account' },
                      ]
                    : [
                        { label: 'Home', href: '/' },
                        { label: 'Shop All', href: '/shop' },
                        { label: 'Search', href: '/search' },
                        { label: 'Cart', href: '/cart' },
                      ]
                  ).map((link) => (
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
                <div className="mb-6">
                  <p className="text-xs uppercase tracking-widest text-slate-500 mb-3 px-4">
                    Categories
                  </p>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/shop/${cat.slug}`}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/8 transition-colors"
                    >
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-7 h-7 rounded-lg flex-shrink-0 object-cover"
                      />
                      <span className="text-sm text-slate-300">{cat.name}</span>
                    </Link>
                  ))}
                </div>

                {/* Bottom Auth Section in Mobile Menu */}
                <div className="mt-auto pt-4 border-t border-white/8">
                  {isAuthenticated ? (
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-sm font-medium transition-colors cursor-pointer"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Link
                        href="/login"
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors shadow-lg shadow-indigo-500/30"
                      >
                        <LogIn size={16} />
                        <span>Sign In</span>
                      </Link>
                      <Link
                        href="/register"
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-sm font-medium transition-colors"
                      >
                        <UserPlus size={16} />
                        <span>Create Account</span>
                      </Link>
                    </div>
                  )}
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
