'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import type { CartItem, Product } from '@/types';

// ─── State & Actions ──────────────────────────────────────────────────────────

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'ADD_ITEM'; product: Product; quantity?: number; selectedVariants?: Record<string, string> }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'UPDATE_QUANTITY'; productId: string; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'HYDRATE'; items: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((i) => i.productId === action.product.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.productId === action.product.id
              ? { ...i, quantity: i.quantity + (action.quantity ?? 1) }
              : i,
          ),
        };
      }
      return {
        ...state,
        items: [
          ...state.items,
          {
            productId: action.product.id,
            product: action.product,
            quantity: action.quantity ?? 1,
            selectedVariants: action.selectedVariants,
          },
        ],
      };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.productId !== action.productId) };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items:
          action.quantity <= 0
            ? state.items.filter((i) => i.productId !== action.productId)
            : state.items.map((i) =>
                i.productId === action.productId ? { ...i, quantity: action.quantity } : i,
              ),
      };
    case 'CLEAR_CART':
      return { items: [] };
    case 'HYDRATE':
      return { items: action.items };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  addItem: (product: Product, quantity?: number, selectedVariants?: Record<string, string>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'ecom_cart';

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const items: CartItem[] = JSON.parse(saved);
        dispatch({ type: 'HYDRATE', items });
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const itemCount = useMemo(
    () => state.items.reduce((acc, i) => acc + i.quantity, 0),
    [state.items],
  );

  const subtotal = useMemo(
    () => state.items.reduce((acc, i) => acc + i.product.price * i.quantity, 0),
    [state.items],
  );

  const discount = useMemo(
    () =>
      state.items.reduce(
        (acc, i) =>
          acc + ((i.product.originalPrice ?? i.product.price) - i.product.price) * i.quantity,
        0,
      ),
    [state.items],
  );

  const shipping = subtotal > 999 || subtotal === 0 ? 0 : 99;
  const total = subtotal + shipping;

  const addItem = useCallback(
    (product: Product, quantity = 1, selectedVariants?: Record<string, string>) =>
      dispatch({ type: 'ADD_ITEM', product, quantity, selectedVariants }),
    [],
  );

  const removeItem = useCallback(
    (productId: string) => dispatch({ type: 'REMOVE_ITEM', productId }),
    [],
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) =>
      dispatch({ type: 'UPDATE_QUANTITY', productId, quantity }),
    [],
  );

  const clearCart = useCallback(() => dispatch({ type: 'CLEAR_CART' }), []);

  const isInCart = useCallback(
    (productId: string) => state.items.some((i) => i.productId === productId),
    [state.items],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items: state.items,
      itemCount,
      subtotal,
      discount,
      shipping,
      total,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      isInCart,
    }),
    [state.items, itemCount, subtotal, discount, shipping, total, addItem, removeItem, updateQuantity, clearCart, isInCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
