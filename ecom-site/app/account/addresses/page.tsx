'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, MapPin, Edit, Trash2, Star } from 'lucide-react';
import { mockUser } from '@/data/users';
import AccountSidebar from '@/components/account/AccountSidebar';
import Button from '@/components/ui/Button';

export default function AddressesPage() {
  const [addresses] = useState(mockUser.addresses);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-3xl font-bold text-white mb-8">Addresses</h1>
      <div className="flex flex-col lg:flex-row gap-6">
        <AccountSidebar />
        <div className="flex-1">
          <div className="flex justify-end mb-5">
            <Button leftIcon={<Plus size={16} />} variant="secondary">Add New Address</Button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {addresses.map((addr, i) => (
              <motion.div
                key={addr.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className={`glass rounded-2xl p-5 border ${addr.isDefault ? 'border-indigo-500/40' : 'border-white/8'}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-indigo-400" />
                    <span className="font-semibold text-white text-sm">{addr.label}</span>
                    {addr.isDefault && (
                      <span className="flex items-center gap-1 text-xs text-amber-400">
                        <Star size={10} className="fill-amber-400" /> Default
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button aria-label="Edit address" className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors">
                      <Edit size={14} />
                    </button>
                    <button aria-label="Delete address" className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-white font-medium">{addr.fullName}</p>
                <p className="text-sm text-slate-400">{addr.addressLine1}</p>
                {addr.addressLine2 && <p className="text-sm text-slate-400">{addr.addressLine2}</p>}
                <p className="text-sm text-slate-400">{addr.city}, {addr.state} {addr.zipCode}</p>
                <p className="text-sm text-slate-400">{addr.country}</p>
                <p className="text-sm text-slate-400 mt-1">{addr.phone}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
