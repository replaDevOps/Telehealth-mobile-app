import React, { ReactNode } from 'react';
import { useCartStore, type CartItem } from '@store/useCartStore';

export type { CartItem };

/**
 * The cart moved to a persisted zustand store (see store/useCartStore).
 *
 * It used to be plain in-memory context state, so every relaunch started with
 * an empty cart and "Add to Cart" re-enabled for services already in it - the
 * button only settled once the server cart happened to load. The store keeps
 * the service IDs across restarts and lets the first /cart/viewCartDetails
 * response replace them.
 *
 * This module stays as the public entry point so the existing call sites and
 * the provider in App.tsx keep working unchanged.
 */
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // A zustand store needs no provider. Kept so App.tsx's tree is untouched.
  return <>{children}</>;
};

export const useCart = () => {
  const cartItems = useCartStore(state => state.cartItems);
  const cartServiceIds = useCartStore(state => state.cartServiceIds);
  const isInCart = useCartStore(state => state.isInCart);
  const addToCart = useCartStore(state => state.addToCart);
  const removeFromCart = useCartStore(state => state.removeFromCart);
  const clearCart = useCartStore(state => state.clearCart);
  const getCartTotal = useCartStore(state => state.getCartTotal);

  return {
    cartItems,
    cartServiceIds,
    isInCart,
    addToCart,
    removeFromCart,
    clearCart,
    getCartTotal,
  };
};
