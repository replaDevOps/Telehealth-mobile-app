const store: Record<string, string> = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (k: string) => (k in store ? store[k] : null)),
    setItem: jest.fn(async (k: string, v: string) => {
      store[k] = v;
    }),
  },
}));

import {
  EMPTY_BILLING,
  splitName,
  buildBillingPrefill,
  validateBilling,
  loadCachedBilling,
  saveCachedBilling,
} from '../billingDetails';

beforeEach(() => {
  Object.keys(store).forEach(k => delete store[k]);
});

describe('splitName', () => {
  it('splits a two-part name on the first space', () => {
    expect(splitName('Ahmed Ali')).toEqual({
      first_name: 'Ahmed',
      last_name: 'Ali',
    });
  });

  it('keeps everything after the first space as the last name', () => {
    expect(splitName('Ahmed bin Ali')).toEqual({
      first_name: 'Ahmed',
      last_name: 'bin Ali',
    });
  });

  it('puts a single-word name in first_name and leaves last_name empty', () => {
    expect(splitName('Ahmed')).toEqual({ first_name: 'Ahmed', last_name: '' });
  });

  it('returns empty strings for empty, whitespace, or missing input', () => {
    expect(splitName('')).toEqual({ first_name: '', last_name: '' });
    expect(splitName('   ')).toEqual({ first_name: '', last_name: '' });
    expect(splitName(null)).toEqual({ first_name: '', last_name: '' });
    expect(splitName(undefined)).toEqual({ first_name: '', last_name: '' });
  });

  it('collapses repeated whitespace', () => {
    expect(splitName('  Ahmed   Ali  ')).toEqual({
      first_name: 'Ahmed',
      last_name: 'Ali',
    });
  });
});

describe('buildBillingPrefill', () => {
  const profile = {
    name: 'Ahmed Ali',
    email: 'ahmed@example.com',
    phoneNo: '0500000000',
    city: 'Jeddah',
  };

  it('defaults country to SA with no sources at all', () => {
    expect(buildBillingPrefill(null, null)).toEqual(EMPTY_BILLING);
    expect(buildBillingPrefill(null, null).billing_country).toBe('SA');
  });

  it('fills identity fields from the profile', () => {
    const result = buildBillingPrefill(profile, null);

    expect(result.first_name).toBe('Ahmed');
    expect(result.last_name).toBe('Ali');
    expect(result.email).toBe('ahmed@example.com');
    expect(result.phone).toBe('0500000000');
  });

  it('lets the profile beat the cache for identity fields', () => {
    const result = buildBillingPrefill(profile, {
      email: 'stale@example.com',
      phone: '0511111111',
      first_name: 'Stale',
    });

    expect(result.email).toBe('ahmed@example.com');
    expect(result.phone).toBe('0500000000');
    expect(result.first_name).toBe('Ahmed');
  });

  it('lets the cache beat the profile for address fields', () => {
    const result = buildBillingPrefill(profile, {
      billing_street1: 'King Fahd Rd',
      billing_city: 'Riyadh',
      billing_state: 'Riyadh',
      billing_postcode: '12211',
    });

    expect(result.billing_street1).toBe('King Fahd Rd');
    expect(result.billing_city).toBe('Riyadh');
    expect(result.billing_postcode).toBe('12211');
  });

  it('falls back to the profile city when the cache has no city', () => {
    expect(buildBillingPrefill(profile, {}).billing_city).toBe('Jeddah');
  });

  it('ignores empty and whitespace-only cached values', () => {
    const result = buildBillingPrefill(profile, {
      billing_city: '   ',
      billing_street1: '',
    });

    expect(result.billing_city).toBe('Jeddah');
    expect(result.billing_street1).toBe('');
  });

  it('tolerates a null city on the profile', () => {
    expect(
      buildBillingPrefill({ ...profile, city: null }, null).billing_city,
    ).toBe('');
  });
});

describe('validateBilling', () => {
  const valid = {
    first_name: 'Ahmed',
    last_name: 'Ali',
    email: 'ahmed@example.com',
    phone: '0500000000',
    billing_street1: 'King Fahd Rd',
    billing_city: 'Riyadh',
    billing_state: 'Riyadh',
    billing_country: 'SA',
    billing_postcode: '12211',
  };

  it('returns no invalid keys for a complete billing block', () => {
    expect(validateBilling(valid)).toEqual([]);
  });

  it('flags every empty required field', () => {
    const invalid = validateBilling({
      ...valid,
      first_name: '',
      billing_city: '   ',
    });

    expect(invalid).toContain('first_name');
    expect(invalid).toContain('billing_city');
    expect(invalid).toHaveLength(2);
  });

  it('flags a malformed email', () => {
    expect(validateBilling({ ...valid, email: 'not-an-email' })).toEqual([
      'email',
    ]);
  });

  it('flags a country code that is not two letters', () => {
    expect(validateBilling({ ...valid, billing_country: 'SAU' })).toEqual([
      'billing_country',
    ]);
  });
});

describe('billing cache', () => {
  const billing = {
    first_name: 'Ahmed',
    last_name: 'Ali',
    email: 'ahmed@example.com',
    phone: '0500000000',
    billing_street1: 'King Fahd Rd',
    billing_city: 'Riyadh',
    billing_state: 'Riyadh',
    billing_country: 'SA',
    billing_postcode: '12211',
  };

  it('returns null when nothing has been cached', async () => {
    await expect(loadCachedBilling()).resolves.toBeNull();
  });

  it('round-trips only the address fields', async () => {
    await saveCachedBilling(billing);

    const cached = await loadCachedBilling();

    expect(cached).toEqual({
      billing_street1: 'King Fahd Rd',
      billing_city: 'Riyadh',
      billing_state: 'Riyadh',
      billing_country: 'SA',
      billing_postcode: '12211',
    });
    expect(cached).not.toHaveProperty('email');
  });

  it('returns null rather than throwing on corrupt cached JSON', async () => {
    store['hyperpay.billing.v1'] = '{not json';

    await expect(loadCachedBilling()).resolves.toBeNull();
  });
});
