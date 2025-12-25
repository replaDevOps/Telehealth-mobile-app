import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface CartCountContextType {
  cartCount: number;
  setCartCount: (count: number) => void;
  incrementCartCount: () => void;
  decrementCartCount: () => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const CartCountContext = createContext<CartCountContextType | undefined>(undefined);

export const CartCountProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [cartCount, setCartCount] = useState<number>(0);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const incrementCartCount = useCallback(() => {
    setCartCount(prev => prev + 1);
  }, []);

  const decrementCartCount = useCallback(() => {
    setCartCount(prev => Math.max(0, prev - 1));
  }, []);

  return (
    <CartCountContext.Provider
      value={{
        cartCount,
        setCartCount,
        incrementCartCount,
        decrementCartCount,
        refreshTrigger,
        triggerRefresh,
      }}
    >
      {children}
    </CartCountContext.Provider>
  );
};

export const useCartCountContext = () => {
  const context = useContext(CartCountContext);
  if (context === undefined) {
    throw new Error('useCartCountContext must be used within a CartCountProvider');
  }
  return context;
};

