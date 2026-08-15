import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useGuestStore } from './useGuestStore';

type Auth = {
  id: string;
  token: string;
  refreshToken: string;
  name: string;
  email: string;
  type: string;
};

type AuthStore = {
  isAuthenticated: boolean;
  auth: Auth | null;
  setAuth: (auth: Auth) => void;
  logout: () => void;
};

const useAuthStore = create<AuthStore>()(
  persist(
    set => ({
      isAuthenticated: false,
      auth: null,
      setAuth: (auth: Auth) => {
        set({ isAuthenticated: true, auth });
        // Every sign-in path (email, phone, Google, Apple, sign-up) lands here,
        // so this is the one place guest mode needs to be cleared.
        useGuestStore.getState().endGuestSession();
      },
      logout: () => {
        set({ isAuthenticated: false, auth: null });
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export default useAuthStore;
