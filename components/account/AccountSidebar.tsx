'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, MapPin, Heart, Settings, Package, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/account', label: 'Overview', icon: User, exact: true },
  { href: '/account/profile', label: 'Profile', icon: User, exact: false },
  { href: '/account/addresses', label: 'Addresses', icon: MapPin, exact: false },
  { href: '/account/wishlist', label: 'Wishlist', icon: Heart, exact: false },
  { href: '/account/settings', label: 'Settings', icon: Settings, exact: false },
  { href: '/orders', label: 'Orders', icon: Package, exact: false },
];

export default function AccountSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 flex-shrink-0">
      <div className="glass rounded-2xl border border-white/8 p-3 sticky top-24">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group',
                active
                  ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/25'
                  : 'text-slate-400 hover:bg-white/6 hover:text-white',
              )}
            >
              <Icon size={16} />
              <span>{label}</span>
              <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
