import { create } from 'zustand';
import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export interface LocationData {
  lat: number;
  long: number;
  locationText?: string; // City, Country format
}

interface LocationStore {
  location: LocationData | null;
  isLoading: boolean;
  hasPermission: boolean;
  fetchLocation: () => Promise<void>;
  setLocation: (location: LocationData | null) => void;
  clearLocation: () => void;
}

const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    // Using OpenStreetMap Nominatim API (free, no API key required)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'TelehealthApp/1.0', // Required by Nominatim
        },
      }
    );
    const data = await response.json();
    
    if (data.address) {
      const city = data.address.city || data.address.town || data.address.village || data.address.county || '';
      const country = data.address.country || '';
      if (city && country) {
        return `${city}, ${country}`;
      } else if (country) {
        return country;
      }
    }
    return ''; // Return empty string if no location found
  } catch (error) {
    console.warn('Reverse geocoding error:', error);
    return ''; // Return empty string on error
  }
};

const useLocationStore = create<LocationStore>((set, get) => ({
  location: null,
  isLoading: false,
  hasPermission: false,

  fetchLocation: async () => {
    // Don't fetch if already loading
    if (get().isLoading) {
      return;
    }

    set({ isLoading: true });

    try {
      let hasPermission = false;

      if (Platform.OS === 'android') {
        // Check if permission is already granted
        const checkResult = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );

        if (checkResult) {
          hasPermission = true;
        } else {
          // Request permission
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );
          hasPermission = granted === PermissionsAndroid.RESULTS.GRANTED;
        }
      } else {
        // iOS - request authorization
        Geolocation.requestAuthorization();
        hasPermission = true; // iOS handles permission in Info.plist
      }

      set({ hasPermission });

      if (!hasPermission) {
        set({ isLoading: false, location: null });
        return;
      }

      // Get current position
      const position = await new Promise<any>((resolve, reject) => {
        Geolocation.getCurrentPosition(
          resolve,
          reject,
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      });

      const { latitude, longitude } = position.coords;
      
      // Reverse geocode to get location text
      const locationText = await reverseGeocode(latitude, longitude);

      set({
        location: {
          lat: latitude,
          long: longitude,
          locationText: locationText || undefined, // Only set if we have text
        },
        isLoading: false,
      });
    } catch (error) {
      console.warn('Error fetching location:', error);
      set({ isLoading: false, location: null });
    }
  },

  setLocation: (location: LocationData | null) => {
    set({ location });
  },

  clearLocation: () => {
    set({ location: null, hasPermission: false });
  },
}));

export { useLocationStore };

