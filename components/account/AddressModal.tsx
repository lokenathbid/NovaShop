'use client';

import React, { useState, useEffect } from 'react';
import { Home, Briefcase, MapPin, Check } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import type { Address } from '@/types';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (savedAddress: Address, isEdit: boolean) => void;
  initialAddress?: Address | null;
  isFirstAddress?: boolean;
}

interface FormState {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  type: string;
  isDefault: boolean;
}

const defaultFormState: FormState = {
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  landmark: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'India',
  type: 'Home',
  isDefault: false,
};

export default function AddressModal({
  isOpen,
  onClose,
  onSaved,
  initialAddress,
  isFirstAddress = false,
}: AddressModalProps) {
  const isEditing = Boolean(initialAddress);
  const [formData, setFormData] = useState<FormState>(defaultFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialAddress) {
        setFormData({
          fullName: initialAddress.fullName || '',
          phone: initialAddress.phone || '',
          addressLine1: initialAddress.addressLine1 || '',
          addressLine2: initialAddress.addressLine2 || '',
          landmark: initialAddress.landmark || '',
          city: initialAddress.city || '',
          state: initialAddress.state || '',
          zipCode: initialAddress.zipCode || '',
          country: initialAddress.country || 'India',
          type: initialAddress.type || initialAddress.label || 'Home',
          isDefault: Boolean(initialAddress.isDefault),
        });
      } else {
        setFormData({
          ...defaultFormState,
          isDefault: isFirstAddress, // If first address, default to true
        });
      }
      setErrors({});
      setGlobalError(null);
    }
  }, [isOpen, initialAddress, isFirstAddress]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    // Clear field-specific error when user changes input
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleTypeSelect = (selectedType: string) => {
    setFormData((prev) => ({ ...prev, type: selectedType }));
  };

  const validateClient = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else {
      const digits = formData.phone.replace(/[\s\-\(\)\+]/g, '');
      if (digits.length < 7 || digits.length > 15) {
        newErrors.phone = 'Enter a valid phone number (7-15 digits).';
      }
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address line 1 is required.';
    } else if (formData.addressLine1.trim().length < 3) {
      newErrors.addressLine1 = 'Address line 1 must be at least 3 characters.';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required.';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required.';
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'Postal / ZIP code is required.';
    } else if (formData.zipCode.trim().length < 3) {
      newErrors.zipCode = 'Enter a valid postal code.';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateClient()) return;

    try {
      setSubmitting(true);
      setGlobalError(null);

      const endpoint = isEditing && initialAddress
        ? `/api/account/addresses/${initialAddress.id}`
        : '/api/account/addresses';

      const method = isEditing ? 'PUT' : 'POST';

      const payload = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        addressLine1: formData.addressLine1.trim(),
        addressLine2: formData.addressLine2.trim() || undefined,
        landmark: formData.landmark.trim() || undefined,
        city: formData.city.trim(),
        state: formData.state.trim(),
        zipCode: formData.zipCode.trim(),
        country: formData.country.trim() || 'India',
        type: formData.type,
        label: formData.type,
        isDefault: isFirstAddress ? true : formData.isDefault,
      };

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          setErrors(data.details);
        }
        setGlobalError(data.error || 'Failed to save address.');
        return;
      }

      onSaved(data.address, isEditing);
      onClose();
    } catch (err) {
      console.error('Error submitting address form:', err);
      setGlobalError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const addressTypes = [
    { id: 'Home', label: 'Home', icon: Home },
    { id: 'Work', label: 'Work', icon: Briefcase },
    { id: 'Other', label: 'Other', icon: MapPin },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Address' : 'Add New Address'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {globalError && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
            {globalError}
          </div>
        )}

        {/* Address Type Selector */}
        <div>
          <label className="text-sm font-medium text-slate-300 block mb-2">
            Address Type
          </label>
          <div className="grid grid-cols-3 gap-3">
            {addressTypes.map(({ id, label, icon: Icon }) => {
              const selected = formData.type.toLowerCase() === id.toLowerCase();
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleTypeSelect(id)}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                    selected
                      ? 'border-indigo-500/80 bg-indigo-500/20 text-indigo-200 shadow-md shadow-indigo-500/10'
                      : 'border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/8 hover:border-white/20'
                  }`}
                >
                  <Icon size={16} className={selected ? 'text-indigo-400' : 'text-slate-400'} />
                  <span>{label}</span>
                  {selected && <Check size={14} className="ml-1 text-indigo-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Contact info row */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            id="fullName"
            name="fullName"
            label="Full Name *"
            placeholder="e.g. Arjun Mehta"
            value={formData.fullName}
            onChange={handleChange}
            error={errors.fullName}
            disabled={submitting}
            autoFocus={!isEditing}
          />
          <Input
            id="phone"
            name="phone"
            label="Phone Number *"
            placeholder="e.g. +91 98765 43210"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            disabled={submitting}
          />
        </div>

        {/* Street address */}
        <Input
          id="addressLine1"
          name="addressLine1"
          label="Address Line 1 (Flat, House no., Building, Street) *"
          placeholder="e.g. Flat 4B, Skyline Residency, MG Road"
          value={formData.addressLine1}
          onChange={handleChange}
          error={errors.addressLine1}
          disabled={submitting}
        />

        {/* Line 2 and Landmark */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            id="addressLine2"
            name="addressLine2"
            label="Address Line 2 (Area, Colony - Optional)"
            placeholder="e.g. Andheri West"
            value={formData.addressLine2}
            onChange={handleChange}
            error={errors.addressLine2}
            disabled={submitting}
          />
          <Input
            id="landmark"
            name="landmark"
            label="Landmark (Optional)"
            placeholder="e.g. Near City Mall"
            value={formData.landmark}
            onChange={handleChange}
            error={errors.landmark}
            disabled={submitting}
          />
        </div>

        {/* City, State, ZIP */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            id="city"
            name="city"
            label="City *"
            placeholder="e.g. Mumbai"
            value={formData.city}
            onChange={handleChange}
            error={errors.city}
            disabled={submitting}
          />
          <Input
            id="state"
            name="state"
            label="State *"
            placeholder="e.g. Maharashtra"
            value={formData.state}
            onChange={handleChange}
            error={errors.state}
            disabled={submitting}
          />
          <Input
            id="zipCode"
            name="zipCode"
            label="Postal / PIN Code *"
            placeholder="e.g. 400058"
            value={formData.zipCode}
            onChange={handleChange}
            error={errors.zipCode}
            disabled={submitting}
          />
        </div>

        {/* Country */}
        <Input
          id="country"
          name="country"
          label="Country *"
          placeholder="India"
          value={formData.country}
          onChange={handleChange}
          error={errors.country}
          disabled={submitting}
        />

        {/* Default address checkbox */}
        <div className="pt-2">
          <label className="flex items-center gap-3 cursor-pointer group select-none">
            <input
              type="checkbox"
              id="isDefault"
              name="isDefault"
              checked={isFirstAddress ? true : formData.isDefault}
              onChange={handleChange}
              disabled={isFirstAddress || submitting}
              className="w-4 h-4 rounded border-white/20 text-indigo-600 focus:ring-indigo-500/50 bg-white/5 accent-indigo-500 cursor-pointer"
            />
            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
              Make this my default delivery address
              {isFirstAddress && (
                <span className="text-xs text-indigo-400 block">
                  (First saved address is automatically set as default)
                </span>
              )}
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/8 mt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={submitting}
          >
            {isEditing ? 'Save Changes' : 'Save Address'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
