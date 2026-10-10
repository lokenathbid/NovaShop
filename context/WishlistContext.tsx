'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';
import { useSession } from 'next-auth/react';
import type { Product } from '@/types';
import ToastContainer, { ToastMessage } from '@/components/ui/Toast';
import { CartContext } from '@/context/CartContext';

// ─── Context ──────────────────────────────────────────────────────────────────

export interface WishlistContextValue {
  items: Product[];
  itemCount: number;
  loading: boolean;
  isItemPending: (id: string) => boolean;
  addItem: (product: Product) => Promise<boolean>;
  removeItem: (productId: string) => Promise<boolean>;
  toggleItem: (product: Product) => Promise<boolean>;
  isWishlisted: (productId: string) => boolean;
  clearWishlist: () => Promise<boolean>;
  refreshWishlist: () => Promise<void>;
  showNotification: (type: 'success' | 'error' | 'info', message: string) => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

const STORAGE_KEY = 'ecom_wishlist';

// ─── Provider ─────────────────────────────────────────────────────────────────

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { data: _session, status } = useSession();
  const cartContext = useContext(CartContext);

  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const isMigratingGuestWishlist = useRef(false);

  // ─── Toast Management ───────────────────────────────────────────────────────

  const showNotification = useCallback(
    (type: 'success' | 'error' | 'info', message: string) => {
      if (cartContext?.showNotification) {
        cartContext.showNotification(type, message);
        return;
      }

      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    [cartContext]
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ─── In-Flight Lock Helper ──────────────────────────────────────────────────

  const lockId = useCallback((id: string) => {
    setPendingIds((prev) => new Set(prev).add(id));
  }, []);

  const unlockId = useCallback((id: string) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const isItemPending = useCallback((id: string) => pendingIds.has(id), [pendingIds]);

  // ─── Server Refresh ─────────────────────────────────────────────────────────

  const refreshWishlist = useCallback(async () => {
    if (status !== 'authenticated') return;

    try {
      const res = await fetch('/api/wishlist', {
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.items)) {
          setItems(data.items);
        }
      }
    } catch (err) {
      console.error('Failed to refresh wishlist:', err);
    }
  }, [status]);

  // ─── Authentication & Guest Sync ────────────────────────────────────────────

  useEffect(() => {
    let isMounted = true;

    async function syncAndLoad() {
      if (status === 'loading') return;

      if (status === 'unauthenticated') {
        isMigratingGuestWishlist.current = false;
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            const guestItems = JSON.parse(saved);
            if (Array.isArray(guestItems) && isMounted) {
              setItems(guestItems);
            }
          } else {
            if (isMounted) setItems([]);
          }
        } catch {
          if (isMounted) setItems([]);
        } finally {
          if (isMounted) setLoading(false);
        }
        return;
      }

      if (status === 'authenticated') {
        setLoading(true);

        // Check if guest items exist in localStorage to migrate
        if (!isMigratingGuestWishlist.current) {
          isMigratingGuestWishlist.current = true;
          try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
              const guestItems: Product[] = JSON.parse(saved);
              if (Array.isArray(guestItems) && guestItems.length > 0) {
                const productIds = guestItems.map((p) => p.id).filter(Boolean);
                if (productIds.length > 0) {
                  await fetch('/api/wishlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productIds }),
                  });
                }
                localStorage.removeItem(STORAGE_KEY);
              }
            }
          } catch (e) {
            console.error('Error migrating guest wishlist:', e);
          }
        }

        // Fetch fresh server wishlist
        try {
          const res = await fetch('/api/wishlist', {
            headers: { 'Cache-Control': 'no-cache' },
          });
          if (res.ok) {
            const data = await res.json();
            if (isMounted && Array.isArray(data.items)) {
              setItems(data.items);
            }
          }
        } catch (err) {
          console.error('Failed to load server wishlist:', err);
        } finally {
          if (isMounted) setLoading(false);
        }
      }
    }

    syncAndLoad();

    return () => {
      isMounted = false;
    };
  }, [status]);

  // ─── Sync Guest Changes to LocalStorage ─────────────────────────────────────

  useEffect(() => {
    if (status === 'unauthenticated') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch {
        // ignore storage errors
      }
    }
  }, [items, status]);

  // ─── Operations ─────────────────────────────────────────────────────────────

  const isWishlisted = useCallback(
    (productId: string) => items.some((p) => p.id === productId),
    [items]
  );

  const addItem = useCallback(
    async (product: Product): Promise<boolean> => {
      if (!product || !product.id) return false;

      // Duplicate prevention in state
      if (items.some((p) => p.id === product.id)) {
        showNotification('info', `"${product.name}" is already in your wishlist.`);
        return true;
      }

      lockId(product.id);
      // Optimistic update
      setItems((prev) => [product, ...prev]);

      if (status === 'authenticated') {
        try {
          const res = await fetch('/api/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: product.id }),
          });

          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || 'Failed to add item to wishlist.');
          }

          showNotification('success', `Added "${product.name}" to wishlist.`);
          unlockId(product.id);
          return true;
        } catch (err: any) {
          // Revert optimistic update
          setItems((prev) => prev.filter((p) => p.id !== product.id));
          showNotification('error', err.message || 'Could not save to wishlist.');
          unlockId(product.id);
          return false;
        }
      } else {
        // Guest mode
        showNotification('success', `Added "${product.name}" to wishlist.`);
        unlockId(product.id);
        return true;
      }
    },
    [items, status, lockId, unlockId, showNotification]
  );

  const removeItem = useCallback(
    async (productId: string): Promise<boolean> => {
      if (!productId) return false;

      const itemToRemove = items.find((p) => p.id === productId);
      if (!itemToRemove) return true;

      lockId(productId);
      // Optimistic update
      setItems((prev) => prev.filter((p) => p.id !== productId));

      if (status === 'authenticated') {
        try {
          const res = await fetch(`/api/wishlist/${encodeURIComponent(productId)}`, {
            method: 'DELETE',
          });

          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || 'Failed to remove item.');
          }

          showNotification('info', `Removed "${itemToRemove.name}" from wishlist.`);
          unlockId(productId);
          return true;
        } catch (err: any) {
          // Revert
          setItems((prev) => [itemToRemove, ...prev]);
          showNotification('error', err.message || 'Could not remove item.');
          unlockId(productId);
          return false;
        }
      } else {
        showNotification('info', `Removed "${itemToRemove.name}" from wishlist.`);
        unlockId(productId);
        return true;
      }
    },
    [items, status, lockId, unlockId, showNotification]
  );

  const toggleItem = useCallback(
    async (product: Product): Promise<boolean> => {
      if (!product || !product.id) return false;
      if (items.some((p) => p.id === product.id)) {
        return removeItem(product.id);
      } else {
        return addItem(product);
      }
    },
    [items, addItem, removeItem]
  );

  const clearWishlist = useCallback(async (): Promise<boolean> => {
    const prevItems = [...items];
    setItems([]);

    if (status === 'authenticated') {
      try {
        const res = await fetch('/api/wishlist', {
          method: 'DELETE',
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to clear wishlist.');
        }

        showNotification('info', 'Wishlist cleared.');
        return true;
      } catch (err: any) {
        setItems(prevItems);
        showNotification('error', err.message || 'Could not clear wishlist.');
        return false;
      }
    } else {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
      showNotification('info', 'Wishlist cleared.');
      return true;
    }
  }, [items, status, showNotification]);

  const value = useMemo<WishlistContextValue>(
    () => ({
      items,
      itemCount: items.length,
      loading,
      isItemPending,
      addItem,
      removeItem,
      toggleItem,
      isWishlisted,
      clearWishlist,
      refreshWishlist,
      showNotification,
    }),
    [
      items,
      loading,
      isItemPending,
      addItem,
      removeItem,
      toggleItem,
      isWishlisted,
      clearWishlist,
      refreshWishlist,
      showNotification,
    ]
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
      {!cartContext && toasts.length > 0 && (
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      )}
    </WishlistContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
