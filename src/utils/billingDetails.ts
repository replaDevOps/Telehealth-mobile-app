import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BillingDetails } from '../types/payment.types';

const CACHE_KEY = 'hyperpay.billing.v1';

/** The subset of the profile store this module reads. */
export type ProfileLike = {
  name?: string;
  email?: string;
  phoneNo?: string;
  city?: string | null;
};

const ADDRESS_FIELDS = [
  'billing_street1',
  'billing_city',
  'billing_state',
  'billing_country',
  'billing_postcode',
] as const;

const REQUIRED_FIELDS: (keyof BillingDetails)[] = [
  'first_name',
  'last_name',
  'email',
  'phone',
  'billing_street1',
  'billing_city',
  'billing_state',
  'billing_country',
  'billing_postcode',
];

export const EMPTY_BILLING: BillingDetails = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  billing_street1: '',
  billing_city: '',
  billing_state: '',
  billing_country: 'SA',
  billing_postcode: '',
};

const clean = (value?: string | null): string => (value ?? '').trim();

/** First token is the first name; everything after it is the last name. */
export function splitName(fullName?: string | null): {
  first_name: string;
  last_name: string;
} {
  const trimmed = clean(fullName).replace(/\s+/g, ' ');
  if (!trimmed) return { first_name: '', last_name: '' };

  const boundary = trimmed.indexOf(' ');
  if (boundary === -1) return { first_name: trimmed, last_name: '' };

  return {
    first_name: trimmed.slice(0, boundary),
    last_name: trimmed.slice(boundary + 1),
  };
}

/**
 * Profile wins for identity fields (it is the account of record); the cache
 * wins for address fields (the profile has no address at all).
 */
export function buildBillingPrefill(
  profile: ProfileLike | null,
  cached: Partial<BillingDetails> | null,
): BillingDetails {
  const { first_name, last_name } = splitName(profile?.name);

  const fromCache = (key: (typeof ADDRESS_FIELDS)[number]): string =>
    clean(cached?.[key]);

  return {
    first_name: first_name || clean(cached?.first_name),
    last_name: last_name || clean(cached?.last_name),
    email: clean(profile?.email) || clean(cached?.email),
    phone: clean(profile?.phoneNo) || clean(cached?.phone),
    billing_street1: fromCache('billing_street1'),
    billing_city: fromCache('billing_city') || clean(profile?.city),
    billing_state: fromCache('billing_state'),
    billing_country: fromCache('billing_country') || 'SA',
    billing_postcode: fromCache('billing_postcode'),
  };
}

/** Returns the keys that are invalid. Empty array means the block is usable. */
export function validateBilling(
  billing: BillingDetails,
): (keyof BillingDetails)[] {
  const invalid = REQUIRED_FIELDS.filter(key => !clean(billing[key]));

  const email = clean(billing.email);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    invalid.push('email');
  }

  const country = clean(billing.billing_country);
  if (country && !/^[A-Za-z]{2}$/.test(country)) {
    invalid.push('billing_country');
  }

  return invalid;
}

export async function loadCachedBilling(): Promise<Partial<BillingDetails> | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    // A corrupt or unreadable cache is not worth failing checkout over.
    return null;
  }
}

/** Persists address fields only — identity always comes from the profile. */
export async function saveCachedBilling(
  billing: BillingDetails,
): Promise<void> {
  try {
    const address = ADDRESS_FIELDS.reduce<Partial<BillingDetails>>(
      (acc, key) => {
        acc[key] = clean(billing[key]);
        return acc;
      },
      {},
    );
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(address));
  } catch {
    // Caching is a convenience; never block the payment on it.
  }
}
