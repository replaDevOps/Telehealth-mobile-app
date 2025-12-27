import { create } from 'zustand';
import { apiClient } from '../services/api/api-client';
import { API } from '../services/api/api-endpoint';
import { tryCatch } from '../utils';

export interface ProfileData {
  id?: number;
  code?: string;
  name?: string;
  email?: string;
  image?: string;
  phoneNo?: string;
  age?: string;
  gender?: string;
  city?: string | null;
  nationalID?: string;
  loyaltyPoints?: string | number;
  notificationStatus?: string | null;
  language?: string;
  [key: string]: any;
}

interface ProfileStore {
  profileData: ProfileData | null;
  isLoading: boolean;
  lastFetched: number | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<ProfileData>) => void;
  clearProfile: () => void;
  refreshProfile: () => Promise<void>;
}

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

const useProfileStore = create<ProfileStore>((set, get) => ({
  profileData: null,
  isLoading: false,
  lastFetched: null,

  fetchProfile: async () => {
    const state = get();
    
    // Check if we have cached data that's still valid
    if (state.profileData && state.lastFetched) {
      const now = Date.now();
      if (now - state.lastFetched < CACHE_DURATION) {
        // Use cached data
        return;
      }
    }

    // Fetch new data
    set({ isLoading: true });
    
    const [res, err] = await tryCatch(
      apiClient.get(API.SETTINGS.VIEW_PROFILE),
    );

    if (err) {
      console.log('Failed to fetch profile data:', err);
      set({ isLoading: false });
      return;
    }

    // Extract profile data from response
    // API response structure: { data: { success: true, data: { ... } } }
    const data = res.data?.data?.data || res.data?.data || res.data || res;
    
    set({
      profileData: data,
      isLoading: false,
      lastFetched: Date.now(),
    });
  },

  updateProfile: (data: Partial<ProfileData>) => {
    const currentData = get().profileData;
    set({
      profileData: currentData ? { ...currentData, ...data } : data as ProfileData,
    });
  },

  clearProfile: () => {
    set({
      profileData: null,
      lastFetched: null,
    });
  },

  refreshProfile: async () => {
    // Force refresh by clearing cache
    set({ lastFetched: null });
    await get().fetchProfile();
  },
}));

export { useProfileStore };

