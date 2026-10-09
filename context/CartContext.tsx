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
import { useRouter, usePathname } from 'next/navigation';
import type { Cart, CartItem, Product } from '@/types';
import ToastContainer, { ToastMessage } from '@/components/ui/Toast';

// ─── Context Interface ─────────────────────────────────────────────────────────

interface CartContextValue {
  cart: Cart;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  loading: boolean;
  isItemPending: (id: string) => boolean;
  addItem: (
    product: Product,
    quantity?: number,
    selectedVariants?: Record<string, string>
  ) => Promise<boolean>;
  removeItem: (itemIdOrProductId: string) => Promise<boolean>;
  updateQuantity: (itemIdOrProductId: string, quantity: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  isInCart: (productId: string) => boolean;
  refreshCart: () => Promise<void>;
  showNotification: (type: 'success' | 'error' | 'info', message: string) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'ecom_cart';

const emptyCart: Cart = {
  items: [],
  itemCount: 0,
  subtotal: 0,
  discount: 0,
  shipping: 0,
  total: 0,
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [cart, setCart] = useState<Cart>(emptyCart);
  const [loading, setLoading] = useState(true);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const isMigratingGuestCart = useRef(false);

  // ─── Toast Management ───────────────────────────────────────────────────────

  const showNotification = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

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

  // ─── Fetch Cart from Server ─────────────────────────────────────────────────

  const refreshCart = useCallback(async () => {
    if (status !== 'authenticated') {
      return;
    }

    try {
      const res = await fetch('/api/cart', {
        headers: { 'Cache-Control': 'no-cache' },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.cart) {
          setCart(data.cart);
        }
      }
    } catch (err) {
      console.error('Failed to fetch user cart:', err);
    }
  }, [status]);

  // ─── Authentication & Guest Sync Effect ─────────────────────────────────────

  useEffect(() => {
    let isMounted = true;

    async function syncAndLoad() {
      if (status === 'loading') {
        return;
      }

      if (status === 'unauthenticated') {
        // Hydrate from localStorage for guest view
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            const guestItems: CartItem[] = JSON.parse(saved);
            const count = guestItems.reduce((acc, i) => acc + i.quantity, 0);
            const subtotal = guestItems.reduce(
              (acc, i) => acc + (i.product?.price || 0) * i.quantity,
              0
            );
            const discount = guestItems.reduce(
              (acc, i) =>
                acc +
                ((i.product?.originalPrice ?? i.product?.price ?? 0) - (i.product?.price || 0)) *
                  i.quantity,
              0
            );
            const shipping = subtotal > 999 || subtotal === 0 ? 0 : 99;
            const total = subtotal + shipping;

            if (isMounted) {
              setCart({
                items: guestItems,
                itemCount: count,
                subtotal: Math.round(subtotal * 100) / 100,
                discount: Math.round(discount * 100) / 100,
                shipping,
                total: Math.round(total * 100) / 100,
              });
            }
          } else {
            if (isMounted) setCart(emptyCart);
          }
        } catch {
          if (isMounted) setCart(emptyCart);
        } finally {
          if (isMounted) setLoading(false);
        }
        return;
      }

      if (status === 'authenticated') {
        setLoading(true);

        // Check if there are guest items in localStorage to migrate
        if (!isMigratingGuestCart.current) {
          isMigratingGuestCart.current = true;
          try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
              const guestItems: CartItem[] = JSON.parse(saved);
              if (Array.isArray(guestItems) && guestItems.length > 0) {
                // Migrate items to server
                for (const item of guestItems) {
                  try {
                    await fetch('/api/cart', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        productId: item.productId,
                        quantity: item.quantity,
                        selectedVariants: item.selectedVariants,
                      }),
                    });
                  } catch (e) {
                    console.error('Failed to migrate guest item:', e);
                  }
                }
                localStorage.removeItem(STORAGE_KEY);
              }
            }
          } catch (e) {
            console.error('Error migrating guest cart:', e);
          }
        }

        // Fetch fresh cart from server
        try {
          const res = await fetch('/api/cart');
          if (res.ok) {
            const data = await res.json();
            if (isMounted && data.cart) {
              setCart(data.cart);
            }
          }
        } catch (err) {
          console.error('Failed to load server cart:', err);
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

  // ─── Add Item ───────────────────────────────────────────────────────────────

  const addItem = useCallback(
    async (
      product: Product,
      quantity = 1,
      selectedVariants?: Record<string, string>
    ): Promise<boolean> => {
      if (pendingIds.has(product.id)) {
        return false;
      }

      // Check client-side stock availability
      if (!product.inStock) {
        showNotification('error', `"${product.name}" is currently out of stock.`);
        return false;
      }

      if (product.stockCount !== null && product.stockCount !== undefined && quantity > product.stockCount) {
        showNotification(
          'error',
          `Cannot add ${quantity} items. Only ${product.stockCount} available in stock.`
        );
        return false;
      }

      // If user is not authenticated, follow the NovaShop login flow and preserve destination
      if (status === 'unauthenticated') {
        // Save guest item to localStorage so intent is preserved
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          const currentItems: CartItem[] = saved ? JSON.parse(saved) : [];
          const existing = currentItems.find((i) => i.productId === product.id);
          let newItems: CartItem[];
          if (existing) {
            newItems = currentItems.map((i) =>
              i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i
            );
          } else {
            newItems = [
              ...currentItems,
              {
                productId: product.id,
                product,
                quantity,
                selectedVariants,
              },
            ];
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
        } catch {
          // ignore localStorage issues
        }

        showNotification('info', 'Please sign in to add items to your cart.');
        const returnUrl = typeof window !== 'undefined' ? window.location.pathname : '/shop';
        router.push(`/login?callbackUrl=${encodeURIComponent(returnUrl)}`);
        return false;
      }

      // User is authenticated — call backend API
      lockId(product.id);
      try {
        const res = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: product.id,
            quantity,
            selectedVariants,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          showNotification('error', data.error || 'Failed to add item to cart.');
          return false;
        }

        if (data.cart) {
          setCart(data.cart);
        }
        showNotification('success', `Added "${product.name}" to cart.`);
        return true;
      } catch (err) {
        console.error('Error adding item to cart:', err);
        showNotification('error', 'Network error. Please try again.');
        return false;
      } finally {
        unlockId(product.id);
      }
    },
    [pendingIds, status, router, lockId, unlockId, showNotification]
  );

  // ─── Update Quantity ────────────────────────────────────────────────────────

  const updateQuantity = useCallback(
    async (itemIdOrProductId: string, newQuantity: number): Promise<boolean> => {
      // Find the item in current cart
      const targetItem = cart.items.find(
        (i) => i.id === itemIdOrProductId || i.productId === itemIdOrProductId
      );

      if (!targetItem) {
        return false;
      }

      // If quantity is 0 or less, remove item
      if (newQuantity <= 0) {
        return removeItem(targetItem.id || targetItem.productId);
      }

      const lockKey = targetItem.id || targetItem.productId;
      if (pendingIds.has(lockKey)) {
        return false;
      }

      // If unauthenticated guest
      if (status === 'unauthenticated') {
        const updatedItems = cart.items.map((i) =>
          i.productId === targetItem.productId ? { ...i, quantity: newQuantity } : i
        );
        const count = updatedItems.reduce((acc, i) => acc + i.quantity, 0);
        const subtotal = updatedItems.reduce(
          (acc, i) => acc + (i.product?.price || 0) * i.quantity,
          0
        );
        const discount = updatedItems.reduce(
          (acc, i) =>
            acc +
            ((i.product?.originalPrice ?? i.product?.price ?? 0) - (i.product?.price || 0)) *
              i.quantity,
          0
        );
        const shipping = subtotal > 999 || subtotal === 0 ? 0 : 99;
        const total = subtotal + shipping;

        setCart({
          items: updatedItems,
          itemCount: count,
          subtotal: Math.round(subtotal * 100) / 100,
          discount: Math.round(discount * 100) / 100,
          shipping,
          total: Math.round(total * 100) / 100,
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
        return true;
      }

      // Authenticated — use server API
      if (!targetItem.id) {
        await refreshCart();
        return false;
      }

      lockId(lockKey);
      try {
        const res = await fetch(`/api/cart/${targetItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: newQuantity }),
        });

        const data = await res.json();

        if (!res.ok) {
          showNotification('error', data.error || 'Failed to update item quantity.');
          return false;
        }

        if (data.cart) {
          setCart(data.cart);
        }
        return true;
      } catch (err) {
        console.error('Error updating cart item quantity:', err);
        showNotification('error', 'Network error. Please try again.');
        return false;
      } finally {
        unlockId(lockKey);
      }
    },
    [cart.items, pendingIds, status, lockId, unlockId, showNotification, refreshCart]
  );

  // ─── Remove Item ────────────────────────────────────────────────────────────

  const removeItem = useCallback(
    async (itemIdOrProductId: string): Promise<boolean> => {
      const targetItem = cart.items.find(
        (i) => i.id === itemIdOrProductId || i.productId === itemIdOrProductId
      );

      if (!targetItem) {
        return false;
      }

      const lockKey = targetItem.id || targetItem.productId;
      if (pendingIds.has(lockKey)) {
        return false;
      }

      // If unauthenticated guest
      if (status === 'unauthenticated') {
        const updatedItems = cart.items.filter((i) => i.productId !== targetItem.productId);
        const count = updatedItems.reduce((acc, i) => acc + i.quantity, 0);
        const subtotal = updatedItems.reduce(
          (acc, i) => acc + (i.product?.price || 0) * i.quantity,
          0
        );
        const discount = updatedItems.reduce(
          (acc, i) =>
            acc +
            ((i.product?.originalPrice ?? i.product?.price ?? 0) - (i.product?.price || 0)) *
              i.quantity,
          0
        );
        const shipping = subtotal > 999 || subtotal === 0 ? 0 : 99;
        const total = subtotal + shipping;

        setCart({
          items: updatedItems,
          itemCount: count,
          subtotal: Math.round(subtotal * 100) / 100,
          discount: Math.round(discount * 100) / 100,
          shipping,
          total: Math.round(total * 100) / 100,
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
        showNotification('info', `Removed "${targetItem.product.name}" from cart.`);
        return true;
      }

      // Authenticated — call server API
      if (!targetItem.id) {
        await refreshCart();
        return false;
      }

      lockId(lockKey);
      try {
        const res = await fetch(`/api/cart/${targetItem.id}`, {
          method: 'DELETE',
        });

        const data = await res.json();

        if (!res.ok) {
          showNotification('error', data.error || 'Failed to remove item from cart.');
          return false;
        }

        if (data.cart) {
          setCart(data.cart);
        }
        showNotification('info', `Removed "${targetItem.product.name}" from cart.`);
        return true;
      } catch (err) {
        console.error('Error removing cart item:', err);
        showNotification('error', 'Network error. Please try again.');
        return false;
      } finally {
        unlockId(lockKey);
      }
    },
    [cart.items, pendingIds, status, lockId, unlockId, showNotification, refreshCart]
  );

  // ─── Clear Cart ─────────────────────────────────────────────────────────────

  const clearCart = useCallback(async (): Promise<boolean> => {
    if (status === 'unauthenticated') {
      setCart(emptyCart);
      localStorage.removeItem(STORAGE_KEY);
      showNotification('info', 'Cart cleared.');
      return true;
    }

    try {
      const res = await fetch('/api/cart', {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        showNotification('error', data.error || 'Failed to clear cart.');
        return false;
      }

      if (data.cart) {
        setCart(data.cart);
      } else {
        setCart(emptyCart);
      }
      showNotification('info', 'Cart cleared.');
      return true;
    } catch (err) {
      console.error('Error clearing cart:', err);
      showNotification('error', 'Network error. Please try again.');
      return false;
    }
  }, [status, showNotification]);

  // ─── isInCart Check ─────────────────────────────────────────────────────────

  const isInCart = useCallback(
    (productId: string) => cart.items.some((i) => i.productId === productId),
    [cart.items]
  );

  // ─── Context Value ──────────────────────────────────────────────────────────

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      items: cart.items,
      itemCount: cart.itemCount,
      subtotal: cart.subtotal,
      discount: cart.discount,
      shipping: cart.shipping,
      total: cart.total,
      loading,
      isItemPending,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      isInCart,
      refreshCart,
      showNotification,
    }),
    [
      cart,
      loading,
      isItemPending,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      isInCart,
      refreshCart,
      showNotification,
    ]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </CartContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
