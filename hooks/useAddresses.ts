'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Address } from '@/types';

export interface UseAddressesReturn {
  addresses: Address[];
  defaultAddress: Address | null;
  loading: boolean;
  error: string | null;
  refreshAddresses: () => Promise<void>;
  setDefaultAddress: (id: string) => Promise<boolean>;
  deleteAddress: (id: string) => Promise<boolean>;
}

/**
 * Hook to retrieve and manage authenticated user's addresses.
 * Provides a clean interface for checkout and account screens to access
 * saved addresses and the active default address.
 */
export function useAddresses(): UseAddressesReturn {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAddresses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/account/addresses');
      if (!res.ok) {
        if (res.status === 401) {
          setAddresses([]);
          return;
        }
        throw new Error('Failed to load addresses');
      }
      const data = await res.json();
      setAddresses(data.addresses || []);
    } catch (err: unknown) {
      console.error('Error fetching addresses:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch addresses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const defaultAddress = useMemo(() => {
    return addresses.find((addr) => addr.isDefault) || addresses[0] || null;
  }, [addresses]);

  const setDefault = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const res = await fetch(`/api/account/addresses/${id}/default`, {
          method: 'POST',
        });
        if (!res.ok) return false;
        await fetchAddresses();
        return true;
      } catch (err) {
        console.error('Error setting default address:', err);
        return false;
      }
    },
    [fetchAddresses]
  );

  const removeAddress = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const res = await fetch(`/api/account/addresses/${id}`, {
          method: 'DELETE',
        });
        if (!res.ok) return false;
        await fetchAddresses();
        return true;
      } catch (err) {
        console.error('Error deleting address:', err);
        return false;
      }
    },
    [fetchAddresses]
  );

  return {
    addresses,
    defaultAddress,
    loading,
    error,
    refreshAddresses: fetchAddresses,
    setDefaultAddress: setDefault,
    deleteAddress: removeAddress,
  };
}
