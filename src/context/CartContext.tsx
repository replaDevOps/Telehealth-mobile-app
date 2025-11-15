import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CartItem {
  service: {
    id: string;
    image: any;
    type: string;
    serviceGroup: string;
    serviceName: string;
    price: string;
    duration: string;
    description?: string;
    procedure?: string;
  };
  clinic: {
    id: string;
    name: string;
    location: string;
    image: any;
    specialty: string;
    rating: number;
  };
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (serviceId: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    setCartItems(prev => {
      // Check if item already exists (same service ID)
      const exists = prev.find(i => i.service.id === item.service.id);
      if (exists) {
        console.log('Service already in cart');
        return prev; // Don't add duplicates
      }
      // Add the new item (allows services from different clinics)
      return [...prev, item];
    });
  };

  const removeFromCart = (serviceId: string) => {
    setCartItems(prev => prev.filter(item => item.service.id !== serviceId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.service.price.replace(/[^0-9.]/g, ''));
      return total + price;
    }, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
