import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type Auth = {
  token: string;
  user: { id: string; refreshToken: string };
};

type AuthStore = {
  isAuthenticated: boolean;
  auth: Auth | null;
  setAuth: (auth: Auth) => void;
  logout: () => void;
};

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      auth: null,
      setAuth: (auth: Auth) => {
        set({ isAuthenticated: true, auth });
      },
      logout: () => {
        set({ isAuthenticated: false, auth: null });
      },
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useAuthStore;
