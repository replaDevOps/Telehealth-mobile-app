import Geocoder from '@modern-logic/react-native-geocoder';
import { reverseGeocodeCity as googleReverseGeocodeCity } from '../api/googlePlacesService';

/**
 * Resolves coordinates to a short "City, Country" label.
 *
 * Prefers the device's built-in geocoder (CLGeocoder on iOS,
 * android.location.Geocoder on Android): free, no API key, no quota. Falls back
 * to the billable Google Geocoding API only when the native path cannot answer
 * - most commonly on Android devices without Google Play services, where
 * `Geocoder.isPresent()` is false and the native module rejects with
 * NOT_AVAILABLE.
 *
 * We deliberately do not use the library's own `fallbackToGoogle()`: it only
 * triggers on the NOT_AVAILABLE code and returns Google's raw shape. Owning the
 * fallback here means every failure mode routes through one path that emits the
 * same "City, Country" format.
 *
 * Callers should still cache the result - see `useLocationStore`, which gates
 * this on a TTL and a movement threshold so the Google fallback stays rare.
 */

/**
 * The native geocoders return place names in the device locale, which would put
 * Arabic city names in the header for ar-locale devices. The header is English,
 * so pin the language once at module load. Both platforms export setLanguage.
 */
try {
  Geocoder.setLanguage('en');
} catch (error) {
  console.warn('Could not set geocoder language:', error);
}

/** iOS returns NSNull for absent fields, so values arrive as null, not undefined. */
type NativeAddress = {
  locality?: string | null;
  subAdminArea?: string | null;
  adminArea?: string | null;
  country?: string | null;
};

const firstNonEmpty = (...values: Array<string | null | undefined>): string => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
};

const formatCityCountry = (address: NativeAddress | undefined): string => {
  if (!address) return '';
  // subAdminArea/adminArea cover rural coordinates where locality is absent.
  const city = firstNonEmpty(address.locality, address.subAdminArea, address.adminArea);
  const country = firstNonEmpty(address.country);

  if (city && country) return `${city}, ${country}`;
  return country || city || '';
};

export const reverseGeocodeCity = async (lat: number, lng: number): Promise<string> => {
  try {
    const results: NativeAddress[] = await Geocoder.geocodePosition({ lat, lng });
    const label = formatCityCountry(results?.[0]);
    if (label) return label;
    // Native answered but had no usable place name - try Google rather than
    // showing a blank header.
    console.warn('Native geocoder returned no city; falling back to Google');
  } catch (error) {
    console.warn('Native geocoder unavailable; falling back to Google:', error);
  }

  return googleReverseGeocodeCity(lat, lng);
};
