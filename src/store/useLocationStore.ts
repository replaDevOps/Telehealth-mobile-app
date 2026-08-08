import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { showLocationSettingsAlert, handleLocationError } from '../utils/locationUtils';
import { reverseGeocodeCity } from '../services/geocoding/reverseGeocodeCity';

export interface LocationData {
  lat: number;
  long: number;
  locationText?: string; // City, Country format
}

interface Coords {
  lat: number;
  long: number;
}

interface LocationStore {
  location: LocationData | null;
  isLoading: boolean;
  hasPermission: boolean;
  /** When the cached `locationText` was resolved (epoch ms). */
  geocodedAt: number | null;
  /** The coordinates `locationText` was resolved for. */
  geocodedFor: Coords | null;
  fetchLocation: (options?: { force?: boolean }) => Promise<void>;
  setLocation: (location: LocationData | null) => void;
  clearLocation: () => void;
}

/**
 * Reverse geocoding resolves natively (free) on most devices but falls back to
 * the billable Google API, so the "City, Country" label is cached and only
 * refreshed when it goes stale or the user moves far enough for the city to
 * plausibly have changed. Coordinates themselves are always refreshed - only
 * the label lookup is gated, so clinic search accuracy is unaffected.
 */
const GEOCODE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const GEOCODE_MOVE_THRESHOLD_M = 5000; // 5 km

const EARTH_RADIUS_M = 6371000;

const toRadians = (deg: number): number => (deg * Math.PI) / 180;

/** Great-circle distance in metres between two coordinates. */
const distanceBetween = (a: Coords, b: Coords): number => {
  const dLat = toRadians(b.lat - a.lat);
  const dLong = toRadians(b.long - a.long);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLong / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
};

/**
 * Shared in-flight request. Splash, HomeScreen and SelectLocation all call
 * fetchLocation() on mount; without this they would each trigger their own GPS
 * read and geocode. Late callers await the same promise rather than bailing
 * out empty-handed.
 */
let inFlightFetch: Promise<void> | null = null;

const requestPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    const alreadyGranted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    if (alreadyGranted) return true;

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }

  // iOS reports the outcome through the callbacks, so we can detect a denial
  // instead of assuming success.
  return new Promise<boolean>(resolve => {
    Geolocation.requestAuthorization(
      () => resolve(true),
      () => resolve(false)
    );
  });
};

const useLocationStore = create<LocationStore>()(
  persist(
    (set, get) => ({
      location: null,
      isLoading: false,
      hasPermission: false,
      geocodedAt: null,
      geocodedFor: null,

      fetchLocation: async (options = {}) => {
        if (inFlightFetch) return inFlightFetch;

        const run = async (): Promise<void> => {
          set({ isLoading: true });

          try {
            const hasPermission = await requestPermission();
            set({ hasPermission });

            if (!hasPermission) {
              set({ isLoading: false, location: null });
              showLocationSettingsAlert({
                title: 'Location Permission',
                message:
                  'Location access is needed for this app. Would you like to open settings to enable it?',
              });
              return;
            }

            const position = await new Promise<any>((resolve, reject) => {
              Geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 10000,
              });
            });

            const { latitude, longitude } = position.coords;
            const coords: Coords = { lat: latitude, long: longitude };

            const { location: cached, geocodedAt, geocodedFor } = get();
            const cachedText = cached?.locationText;
            const isFresh = geocodedAt !== null && Date.now() - geocodedAt < GEOCODE_TTL_MS;
            const isNearby =
              geocodedFor !== null &&
              distanceBetween(coords, geocodedFor) < GEOCODE_MOVE_THRESHOLD_M;

            let locationText = cachedText;
            let nextGeocodedAt = geocodedAt;
            let nextGeocodedFor = geocodedFor;

            if (options.force || !cachedText || !isFresh || !isNearby) {
              const resolved = await reverseGeocodeCity(latitude, longitude);
              if (resolved) {
                locationText = resolved;
                nextGeocodedAt = Date.now();
                nextGeocodedFor = coords;
              }
              // On failure we keep the previous label - a slightly stale city
              // reads better than a header that empties out.
            }

            set({
              location: { ...coords, locationText: locationText || undefined },
              geocodedAt: nextGeocodedAt,
              geocodedFor: nextGeocodedFor,
              isLoading: false,
            });
          } catch (error: any) {
            console.warn('Error fetching location:', error);
            set({ isLoading: false, location: null });
            handleLocationError(error ?? {}, {
              title: 'Location Not Available',
              message: 'Please enable location services. Would you like to open settings?',
              openLocationSettings: true,
            });
          }
        };

        // Clear the slot on both paths so a failed attempt cannot wedge every
        // later caller. (Avoids Promise.finally, which this tsconfig's lib
        // target does not expose.)
        const clear = () => {
          inFlightFetch = null;
        };
        const pending = run().then(clear, error => {
          clear();
          throw error;
        });
        inFlightFetch = pending;

        return pending;
      },

      setLocation: (location: LocationData | null) => {
        set({ location });
      },

      clearLocation: () => {
        set({ location: null, hasPermission: false, geocodedAt: null, geocodedFor: null });
      },
    }),
    {
      name: 'location-store',
      storage: createJSONStorage(() => AsyncStorage),
      // isLoading and hasPermission are runtime state - persisting them would
      // resurrect a stale permission grant or a stuck spinner on next launch.
      partialize: state => ({
        location: state.location,
        geocodedAt: state.geocodedAt,
        geocodedFor: state.geocodedFor,
      }),
    }
  )
);

export { useLocationStore };
