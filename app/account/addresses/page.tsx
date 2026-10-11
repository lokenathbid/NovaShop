'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  MapPin,
  Edit,
  Trash2,
  Star,
  Home,
  Briefcase,
  Phone,
  Navigation,
  Loader2,
  AlertCircle,
  MapPinOff,
} from 'lucide-react';
import AccountSidebar from '@/components/account/AccountSidebar';
import Button from '@/components/ui/Button';
import AddressModal from '@/components/account/AddressModal';
import DeleteAddressModal from '@/components/account/DeleteAddressModal';
import ToastContainer, { ToastMessage } from '@/components/ui/Toast';
import type { Address } from '@/types';

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Address | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Setting default action loading state
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchAddresses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/account/addresses');
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/login?callbackUrl=/account/addresses';
          return;
        }
        throw new Error('Failed to load saved addresses.');
      }
      const data = await res.json();
      setAddresses(data.addresses || []);
    } catch (err) {
      console.error('Error fetching addresses:', err);
      setError('Could not load your saved addresses. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addr: Address) => {
    setEditingAddress(addr);
    setIsModalOpen(true);
  };

  const handleSaved = (saved: Address, isEdit: boolean) => {
    if (isEdit) {
      showToast('success', 'Address updated successfully.');
    } else {
      showToast('success', 'Address added successfully.');
    }
    fetchAddresses();
  };

  const handleSetDefault = async (addr: Address) => {
    if (addr.isDefault) return;
    try {
      setSettingDefaultId(addr.id);
      const res = await fetch(`/api/account/addresses/${addr.id}/default`, {
        method: 'POST',
      });
      if (!res.ok) {
        throw new Error('Failed to set default address.');
      }
      showToast('success', `Default address changed to ${addr.fullName} (${addr.type || addr.label}).`);
      await fetchAddresses();
    } catch (err) {
      console.error('Error setting default:', err);
      showToast('error', 'Failed to change default address.');
    } finally {
      setSettingDefaultId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/account/addresses/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Failed to delete address.');
      }
      showToast('success', 'Address deleted successfully.');
      setDeleteTarget(null);
      await fetchAddresses();
    } catch (err) {
      console.error('Error deleting address:', err);
      showToast('error', 'Failed to delete address.');
    } finally {
      setDeleting(false);
    }
  };

  const getTypeIcon = (type?: string) => {
    const normalized = (type || 'Home').toLowerCase();
    if (normalized === 'work' || normalized === 'office') {
      return <Briefcase size={14} className="text-violet-400" />;
    }
    if (normalized === 'other') {
      return <Navigation size={14} className="text-cyan-400" />;
    }
    return <Home size={14} className="text-indigo-400" />;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Saved Addresses</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage your shipping destinations for fast and seamless checkout.
          </p>
        </div>
        {addresses.length > 0 && !loading && (
          <Button
            onClick={handleOpenAdd}
            leftIcon={<Plus size={16} />}
            variant="primary"
          >
            Add New Address
          </Button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <AccountSidebar />

        <div className="flex-1">
          {/* Loading state */}
          {loading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {[1, 2].map((n) => (
                <div
                  key={n}
                  className="glass rounded-2xl p-6 border border-white/8 min-h-[220px] flex flex-col justify-between animate-pulse"
                >
                  <div className="flex justify-between items-center">
                    <div className="h-6 w-24 bg-white/10 rounded-full" />
                    <div className="h-6 w-14 bg-white/10 rounded-lg" />
                  </div>
                  <div className="space-y-2.5 my-4">
                    <div className="h-5 w-40 bg-white/10 rounded" />
                    <div className="h-4 w-56 bg-white/10 rounded" />
                    <div className="h-4 w-48 bg-white/10 rounded" />
                    <div className="h-4 w-32 bg-white/10 rounded" />
                  </div>
                  <div className="h-8 w-28 bg-white/10 rounded-xl" />
                </div>
              ))}
            </div>
          ) : error ? (
            /* Error state */
            <div className="glass rounded-2xl border border-red-500/20 p-8 flex items-center gap-4 text-red-400">
              <AlertCircle size={28} className="flex-shrink-0" />
              <div>
                <p className="font-medium text-white">{error}</p>
                <button
                  onClick={fetchAddresses}
                  className="mt-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline"
                >
                  Retry Loading
                </button>
              </div>
            </div>
          ) : addresses.length === 0 ? (
            /* Empty state */
            <div className="glass rounded-2xl border border-white/8 p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                <MapPinOff size={28} />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-2">No Addresses Saved Yet</h3>
              <p className="text-slate-400 text-sm max-w-md mb-6 leading-relaxed">
                You haven&apos;t added any delivery addresses to your account. Add your primary shipping address for instant checkout.
              </p>
              <Button
                onClick={handleOpenAdd}
                leftIcon={<Plus size={16} />}
                variant="primary"
              >
                Add Your First Address
              </Button>
            </div>
          ) : (
            /* Addresses grid */
            <div className="grid sm:grid-cols-2 gap-4">
              <AnimatePresence>
                {addresses.map((addr, i) => {
                  const isCurrentSettingDefault = settingDefaultId === addr.id;

                  return (
                    <motion.div
                      key={addr.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.05 }}
                      className={`glass rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                        addr.isDefault
                          ? 'border-indigo-500/40 bg-gradient-to-b from-indigo-500/10 to-transparent shadow-lg shadow-indigo-500/5'
                          : 'border-white/8 hover:border-white/15'
                      }`}
                    >
                      <div>
                        {/* Top header: Type & Default badge & Edit/Delete actions */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Address Type pill */}
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/8 text-white border border-white/10">
                              {getTypeIcon(addr.type || addr.label)}
                              <span>{addr.type || addr.label || 'Home'}</span>
                            </span>

                            {/* Default badge */}
                            {addr.isDefault && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-400/10 text-amber-300 border border-amber-400/20 shadow-sm shadow-amber-400/5">
                                <Star size={11} className="fill-amber-400 text-amber-400" />
                                <span>Default</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(addr)}
                              aria-label="Edit address"
                              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                              title="Edit address"
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(addr)}
                              aria-label="Delete address"
                              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                              title="Delete address"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>

                        {/* Recipient Details */}
                        <h3 className="font-semibold text-white text-base mb-1">
                          {addr.fullName}
                        </h3>

                        {/* Address Lines */}
                        <div className="text-sm text-slate-300 space-y-1 my-3 leading-relaxed">
                          <p>{addr.addressLine1}</p>
                          {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                          {addr.landmark && (
                            <p className="text-xs text-indigo-300 flex items-center gap-1 pt-0.5">
                              <MapPin size={12} className="text-indigo-400 flex-shrink-0" />
                              Near {addr.landmark}
                            </p>
                          )}
                          <p className="font-medium text-white/90">
                            {addr.city}, {addr.state} - {addr.zipCode}
                          </p>
                          <p className="text-xs text-slate-400">{addr.country}</p>
                        </div>

                        {/* Phone Number */}
                        <div className="flex items-center gap-2 text-xs text-slate-300 py-1 border-t border-white/5 mt-3">
                          <Phone size={13} className="text-slate-400" />
                          <span>{addr.phone}</span>
                        </div>
                      </div>

                      {/* Bottom Footer Action */}
                      <div className="pt-4 mt-3 border-t border-white/8 flex items-center justify-between">
                        {!addr.isDefault ? (
                          <button
                            type="button"
                            onClick={() => handleSetDefault(addr)}
                            disabled={isCurrentSettingDefault}
                            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            {isCurrentSettingDefault ? (
                              <>
                                <Loader2 size={12} className="animate-spin text-indigo-400" />
                                <span>Setting default...</span>
                              </>
                            ) : (
                              <>
                                <Star size={13} className="text-indigo-400" />
                                <span>Set as default</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                            Primary delivery destination
                          </span>
                        )}

                        <button
                          onClick={() => handleOpenEdit(addr)}
                          className="text-xs text-slate-400 hover:text-white transition-colors ml-auto"
                        >
                          Edit details
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      <AddressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={handleSaved}
        initialAddress={editingAddress}
        isFirstAddress={addresses.length === 0}
      />

      {/* Delete Confirmation Modal */}
      <DeleteAddressModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        address={deleteTarget}
        deleting={deleting}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
