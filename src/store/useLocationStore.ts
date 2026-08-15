import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {
  showLocationSettingsAlert,
  handleLocationError,
  isPermissionDeniedError,
} from '../utils/locationUtils';
import { reverseGeocodeCity } from '../services/geocoding/reverseGeocodeCity';
import { shouldReuseCoords } from './locationCache';

export interface LocationData {
  lat: number;
  long: number;
  locationText?: string; // City, Country format
}

interface Coords {
  lat: number;
  long: number;
}

/**
 * `hasPermission` is a boolean, so it cannot tell "denied" apart from "not
 * asked yet" - both read as false. The UI needs that distinction: a screen must
 * not show "turn on location in Settings" during the first second of a cold
 * start, before anything has been asked. Hence a tri-state alongside it.
 */
export type LocationPermissionStatus = 'unknown' | 'granted' | 'denied';

interface LocationStore {
  location: LocationData | null;
  isLoading: boolean;
  hasPermission: boolean;
  permissionStatus: LocationPermissionStatus;
  /** When the cached `locationText` was resolved (epoch ms). */
  geocodedAt: number | null;
  /** The coordinates `locationText` was resolved for. */
  geocodedFor: Coords | null;
  /** When the current coordinates were read (epoch ms). */
  coordsAt: number | null;
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
 * Neither the geolocation module's own `timeout` option nor the native geocoder
 * can be trusted to always call back on iOS. A single callback that never fires
 * leaves `isLoading` true and, worse, wedges `inFlightFetch` so every later
 * caller awaits the same dead promise. These backstops guarantee settlement.
 */
const withTimeout = <T,>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).then(
    value => {
      clearTimeout(timer);
      return value as T;
    },
    error => {
      clearTimeout(timer);
      throw error;
    },
  );
};

const PERMISSION_TIMEOUT_MS = 10000;
const POSITION_TIMEOUT_MS = 20000;
const GEOCODE_TIMEOUT_MS = 15000;

/**
 * Position reads happen in two stages.
 *
 * A coarse read is answered from wifi/cell triangulation or the OS's last known
 * fix, usually in well under a second. A high-accuracy read waits on the GPS
 * radio, which indoors or on a cold start regularly takes ten seconds or more
 * and often times out entirely. Clinic distances are shown in kilometres, so
 * the coarse fix is already more precise than anything the UI renders - paying
 * for satellites up front bought nothing but a spinner.
 */
const COARSE_POSITION_OPTIONS = {
  enableHighAccuracy: false,
  timeout: 4000,
  maximumAge: 300000, // a five-minute-old fix is fine for "clinics near me"
};

/** Only used when the cheap read fails outright. */
const PRECISE_POSITION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 60000,
};

const readPosition = (options: object): Promise<any> =>
  new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(resolve, reject, options);
  });

/**
 * Coarse first, precise only as a fallback.
 */
const readPositionFast = async (): Promise<any> => {
  try {
    return await readPosition(COARSE_POSITION_OPTIONS);
  } catch (coarseError) {
    console.warn('Coarse location read failed; falling back to GPS:', coarseError);
    return readPosition(PRECISE_POSITION_OPTIONS);
  }
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
      permissionStatus: 'unknown',
      geocodedAt: null,
      geocodedFor: null,
      coordsAt: null,

      fetchLocation: async (options = {}) => {
        if (inFlightFetch) return inFlightFetch;

        // A fix from the last couple of minutes is served without touching the
        // GPS at all - this is what removes the wait on every screen after the
        // first one.
        const { location: current, coordsAt } = get();
        if (
          shouldReuseCoords({
            hasCoords: current !== null,
            coordsAt,
            now: Date.now(),
            force: options.force,
          })
        ) {
          return;
        }

        const run = async (): Promise<void> => {
          set({ isLoading: true });

          try {
            // iOS does not always invoke either authorization callback when the
            // status is already determined. If we cannot get an answer, assume
            // permitted and let getCurrentPosition surface a real denial rather
            // than stalling here forever.
            const hasPermission = await withTimeout(
              requestPermission(),
              PERMISSION_TIMEOUT_MS,
              'requestPermission',
            ).catch(() => true);
            set({ hasPermission });

            if (!hasPermission) {
              set({
                isLoading: false,
                location: null,
                coordsAt: null,
                permissionStatus: 'denied',
              });
              showLocationSettingsAlert({
                title: 'Location Permission',
                message:
                  'Location access is needed for this app. Would you like to open settings to enable it?',
              });
              return;
            }

            const position = await withTimeout(
              readPositionFast(),
              POSITION_TIMEOUT_MS,
              'getCurrentPosition',
            );

            const { latitude, longitude } = position.coords;
            const coords: Coords = { lat: latitude, long: longitude };

            const { location: cached, geocodedAt, geocodedFor } = get();
            const cachedText = cached?.locationText;
            const isFresh = geocodedAt !== null && Date.now() - geocodedAt < GEOCODE_TTL_MS;
            const isNearby =
              geocodedFor !== null &&
              distanceBetween(coords, geocodedFor) < GEOCODE_MOVE_THRESHOLD_M;

            // Publish the coordinates the moment we have them. Everything that
            // matters - clinic search, distances, the cart - only needs these,
            // and they used to sit unused for as long as the city lookup took.
            set({
              location: { ...coords, locationText: cachedText || undefined },
              coordsAt: Date.now(),
              isLoading: false,
              permissionStatus: 'granted',
            });

            if (options.force || !cachedText || !isFresh || !isNearby) {
              // Resolved in the background: the label is cosmetic, so nothing
              // waits on it and a failure just keeps the previous city, which
              // reads better than a header that empties out.
              withTimeout(
                reverseGeocodeCity(latitude, longitude),
                GEOCODE_TIMEOUT_MS,
                'reverseGeocodeCity',
              )
                .then(resolved => {
                  if (!resolved) return;
                  const { location: latest } = get();
                  // Only label the coordinates this lookup was for; a newer fix
                  // may have landed while we were waiting.
                  if (!latest || latest.lat !== coords.lat || latest.long !== coords.long) {
                    return;
                  }
                  set({
                    location: { ...latest, locationText: resolved },
                    geocodedAt: Date.now(),
                    geocodedFor: coords,
                  });
                })
                .catch(error => {
                  console.warn('Reverse geocode failed; keeping previous label:', error);
                });
            }
          } catch (error: any) {
            console.warn('Error fetching location:', error);
            // The permission probe above falls back to "assume granted" when
            // iOS answers neither callback, so a denial can surface here
            // instead - as PERMISSION_DENIED from the position read. Without
            // this the status would stay 'unknown' and the UI would keep
            // waiting on a fix that is never coming.
            set({
              isLoading: false,
              location: null,
              coordsAt: null,
              ...(isPermissionDeniedError(error)
                ? { hasPermission: false, permissionStatus: 'denied' as const }
                : {}),
            });
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
        set({
          location: null,
          hasPermission: false,
          permissionStatus: 'unknown',
          geocodedAt: null,
          geocodedFor: null,
          coordsAt: null,
        });
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
        coordsAt: state.coordsAt,
      }),
    }
  )
);

export { useLocationStore };
