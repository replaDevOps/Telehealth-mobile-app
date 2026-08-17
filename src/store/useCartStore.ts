import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface CartItem {
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

/** IDs arrive as numbers from the API and strings from screen params. */
const key = (id: string | number) => String(id);

interface CartStore {
  /**
   * Full items for the current session. Deliberately NOT persisted: nothing
   * reads them except getCartTotal, and `image` is often a require() handle
   * whose numeric value is not stable across builds - persisting it would
   * restore a broken image reference.
   */
  cartItems: CartItem[];
  /**
   * The service IDs known to be in the cart. This IS persisted, so a relaunch
   * keeps "Add to Cart" disabled for services already added instead of
   * offering to add them a second time.
   */
  cartServiceIds: string[];

  isInCart: (serviceId: string | number) => boolean;
  addToCart: (item: CartItem) => void;
  removeFromCart: (serviceId: string | number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  /** Replaces the ID set with the server's answer. */
  syncFromServer: (serviceIds: Array<string | number>) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cartItems: [],
      cartServiceIds: [],

      isInCart: (serviceId) => get().cartServiceIds.includes(key(serviceId)),

      addToCart: (item) => {
        const id = key(item.service.id);
        set(state => ({
          cartItems: state.cartItems.some(i => key(i.service.id) === id)
            ? state.cartItems
            : [...state.cartItems, item],
          cartServiceIds: state.cartServiceIds.includes(id)
            ? state.cartServiceIds
            : [...state.cartServiceIds, id],
        }));
      },

      removeFromCart: (serviceId) => {
        const id = key(serviceId);
        set(state => ({
          cartItems: state.cartItems.filter(i => key(i.service.id) !== id),
          cartServiceIds: state.cartServiceIds.filter(i => i !== id),
        }));
      },

      clearCart: () => set({ cartItems: [], cartServiceIds: [] }),

      getCartTotal: () =>
        get().cartItems.reduce((total, item) => {
          const price = parseFloat(String(item.service.price).replace(/[^0-9.]/g, ''));
          return total + (Number.isFinite(price) ? price : 0);
        }, 0),

      // Wholesale replace, not a merge. The server is the only authority on
      // what is in the cart, so anything it omits - checked out on another
      // device, removed, expired - must stop disabling the button here.
      syncFromServer: (serviceIds) => {
        const ids = serviceIds.map(key);
        set(state => ({
          cartServiceIds: ids,
          cartItems: state.cartItems.filter(i => ids.includes(key(i.service.id))),
        }));
      },
    }),
    {
      name: 'cart-store',
      storage: createJSONStorage(() => AsyncStorage),
      // Only the IDs survive a restart; see cartItems above.
      partialize: state => ({ cartServiceIds: state.cartServiceIds }),
    },
  ),
);

export default useCartStore;
