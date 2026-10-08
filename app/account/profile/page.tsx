'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Save, Loader2 } from 'lucide-react';
import AccountSidebar from '@/components/account/AccountSidebar';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function ProfilePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/account/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setName(data.user.name || '');
            setEmail(data.user.email || '');
            setPhone(data.user.phone || '');
          }
        }
      } catch (err) {
        console.error('Failed to load profile details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }, 600);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-3xl font-bold text-white mb-8">Profile</h1>
      <div className="flex flex-col lg:flex-row gap-6">
        <AccountSidebar />
        <div className="flex-1">
          {loading ? (
            <div className="glass rounded-2xl border border-white/8 p-12 flex justify-center items-center min-h-[300px]">
              <Loader2 className="animate-spin text-indigo-400" size={32} />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl border border-white/8 p-6"
            >
              {/* Avatar */}
              <div className="flex items-center gap-5 mb-8 pb-8 border-b border-white/8">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-3xl">
                    {name ? name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <button
                    aria-label="Change avatar"
                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg hover:bg-indigo-400 transition-colors cursor-pointer"
                  >
                    <Camera size={14} className="text-white" />
                  </button>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{name || 'NovaShop User'}</h2>
                  <p className="text-slate-400 text-sm">{email}</p>
                </div>
              </div>

              <form onSubmit={handleSave} className="grid sm:grid-cols-2 gap-5">
                <Input
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  id="profile-name"
                />
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  disabled
                  placeholder="Email"
                  hint="Email cannot be changed directly"
                  id="profile-email"
                />
                <Input
                  label="Phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 …"
                  id="profile-phone"
                />
                <div />

                <div className="sm:col-span-2">
                  <p className="text-sm font-semibold text-white mb-4">Change Password</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input label="Current Password" type="password" placeholder="••••••••" id="current-pass" />
                    <Input label="New Password" type="password" placeholder="••••••••" id="new-pass" />
                  </div>
                </div>

                <div className="sm:col-span-2 flex justify-end">
                  <Button
                    type="submit"
                    loading={saving}
                    leftIcon={<Save size={16} />}
                    variant={saved ? 'secondary' : 'primary'}
                  >
                    {saved ? '✓ Saved!' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
