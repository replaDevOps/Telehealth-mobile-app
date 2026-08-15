import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * Whether the user chose to browse without an account.
 *
 * Deliberately kept out of useAuthStore: the API client logs the user out on
 * any 401 (see services/api/api-client.ts), and a guest inevitably trips one
 * eventually. Storing this alongside the auth state would let a stray 401 drop
 * the user back to the sign-in wall mid-browse.
 */
interface GuestStore {
  isGuest: boolean;
  /** Enter guest mode - browsing is allowed, account actions are not. */
  continueAsGuest: () => void;
  /** Leave guest mode. Called once a real session is established. */
  endGuestSession: () => void;
}

const useGuestStore = create<GuestStore>()(
  persist(
    set => ({
      isGuest: false,
      continueAsGuest: () => set({ isGuest: true }),
      endGuestSession: () => set({ isGuest: false }),
    }),
    {
      name: 'guest-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export { useGuestStore };
