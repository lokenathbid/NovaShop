'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import type { Address } from '@/types';

interface DeleteAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  address: Address | null;
  deleting: boolean;
}

export default function DeleteAddressModal({
  isOpen,
  onClose,
  onConfirm,
  address,
  deleting,
}: DeleteAddressModalProps) {
  if (!address) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Address"
      size="sm"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300">
          <AlertTriangle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <p className="font-semibold text-red-200">Are you sure you want to delete this address?</p>
            <p className="text-slate-400 mt-1">
              This action cannot be undone.
              {address.isDefault && (
                <span className="block mt-1 text-amber-300 font-medium">
                  Note: This is currently your default address. Another saved address will automatically be selected as your new default.
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Address snippet */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
          <p className="font-semibold text-white">{address.fullName} ({address.type || address.label})</p>
          <p className="text-slate-400">{address.addressLine1}</p>
          <p className="text-slate-400">{address.city}, {address.state} {address.zipCode}</p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/8">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            loading={deleting}
            onClick={onConfirm}
          >
            Delete Address
          </Button>
        </div>
      </div>
    </Modal>
  );
}
