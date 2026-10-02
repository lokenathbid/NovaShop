'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Shield, Eye, Moon, Globe, Save } from 'lucide-react';
import AccountSidebar from '@/components/account/AccountSidebar';
import Button from '@/components/ui/Button';

function ToggleSetting({ label, description, defaultChecked = false }: { label: string; description: string; defaultChecked?: boolean }) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between py-4 border-b border-white/6 last:border-0">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => setOn((v) => !v)}
        aria-checked={on}
        role="switch"
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${on ? 'bg-indigo-500' : 'bg-white/10'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${on ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

const settingSections = [
  {
    title: 'Notifications',
    icon: Bell,
    settings: [
      { label: 'Order Updates', description: 'Get notified about your order status', defaultChecked: true },
      { label: 'Promotions & Deals', description: 'Receive exclusive offers and discounts', defaultChecked: true },
      { label: 'New Arrivals', description: 'Be the first to know about new products', defaultChecked: false },
    ],
  },
  {
    title: 'Privacy',
    icon: Shield,
    settings: [
      { label: 'Profile Visibility', description: 'Allow others to see your public profile', defaultChecked: false },
      { label: 'Activity Tracking', description: 'Help us improve with anonymous analytics', defaultChecked: true },
    ],
  },
  {
    title: 'Appearance',
    icon: Moon,
    settings: [
      { label: 'Dark Mode', description: 'Always use dark theme (enabled by default)', defaultChecked: true },
      { label: 'Compact View', description: 'Show more products per row', defaultChecked: false },
    ],
  },
];

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-3xl font-bold text-white mb-8">Settings</h1>
      <div className="flex flex-col lg:flex-row gap-6">
        <AccountSidebar />
        <div className="flex-1 flex flex-col gap-4">
          {settingSections.map(({ title, icon: Icon, settings }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass rounded-2xl border border-white/8 p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon size={16} className="text-indigo-400" />
                <h3 className="font-semibold text-white">{title}</h3>
              </div>
              {settings.map((s) => (
                <ToggleSetting key={s.label} {...s} />
              ))}
            </motion.div>
          ))}
          <div className="flex justify-end">
            <Button leftIcon={<Save size={16} />} onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }} variant={saved ? 'secondary' : 'primary'}>
              {saved ? '✓ Saved!' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
