'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  isOpen: boolean;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hasLoadedCart, setHasLoadedCart] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Load cart from local storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsed: unknown = JSON.parse(savedCart);
        if (!Array.isArray(parsed)) throw new Error('Invalid saved cart');
        const safeItems = parsed.filter((item: unknown): item is CartItem => {
          if (!item || typeof item !== 'object') return false;
          const candidate = item as Record<string, unknown>;
          return typeof candidate.id === 'string' && typeof candidate.name === 'string' &&
            typeof candidate.image === 'string' && typeof candidate.price === 'number' && Number.isFinite(candidate.price) &&
            typeof candidate.quantity === 'number' && Number.isInteger(candidate.quantity) && candidate.quantity > 0;
        }
        ).map((item) => ({
          ...item,
          image: typeof item.image === 'string' && item.image.startsWith('data:image/')
            ? `/api/products/${encodeURIComponent(item.id)}/image?index=0`
            : item.image,
        }));
        setItems(safeItems);
      } catch {
        localStorage.removeItem('cart');
      }
    }
    setHasLoadedCart(true);
  }, []);

  // Save cart to local storage whenever it changes
  useEffect(() => {
    if (hasLoadedCart) localStorage.setItem('cart', JSON.stringify(items));
  }, [items, hasLoadedCart]);

  const addItem = (newItem: CartItem) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === newItem.id);
      if (existingItem) {
        return currentItems.map((item) =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }
      return [...currentItems, newItem];
    });
    // Don't open cart automatically
  };

  const removeItem = (id: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(id);
      return;
    }
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const toggleCart = () => {
    setIsOpen(!isOpen);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        isOpen,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
