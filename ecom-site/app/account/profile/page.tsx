'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Save } from 'lucide-react';
import { mockUser } from '@/data/users';
import AccountSidebar from '@/components/account/AccountSidebar';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function ProfilePage() {
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-3xl font-bold text-white mb-8">Profile</h1>
      <div className="flex flex-col lg:flex-row gap-6">
        <AccountSidebar />
        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl border border-white/8 p-6"
          >
            {/* Avatar */}
            <div className="flex items-center gap-5 mb-8 pb-8 border-b border-white/8">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-3xl">
                  {mockUser.name.charAt(0)}
                </div>
                <button
                  aria-label="Change avatar"
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg hover:bg-indigo-400 transition-colors"
                >
                  <Camera size={14} className="text-white" />
                </button>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{mockUser.name}</h2>
                <p className="text-slate-400 text-sm">{mockUser.email}</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="grid sm:grid-cols-2 gap-5">
              <Input label="Full Name" defaultValue={mockUser.name} placeholder="Your full name" />
              <Input label="Email" type="email" defaultValue={mockUser.email} placeholder="Email" />
              <Input label="Phone" type="tel" defaultValue={mockUser.phone} placeholder="+91 …" />
              <div />

              <div className="sm:col-span-2">
                <p className="text-sm font-semibold text-white mb-4">Change Password</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Current Password" type="password" placeholder="••••••••" />
                  <Input label="New Password" type="password" placeholder="••••••••" />
                </div>
              </div>

              <div className="sm:col-span-2 flex justify-end">
                <Button type="submit" leftIcon={<Save size={16} />} variant={saved ? 'secondary' : 'primary'}>
                  {saved ? '✓ Saved!' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
