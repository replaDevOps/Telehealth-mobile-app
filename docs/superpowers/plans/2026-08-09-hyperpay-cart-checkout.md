# HyperPay Cart Checkout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace in-app card capture on the patient cart checkout screen with HyperPay COPYandPAY hosted in an in-app WebView, confirming the result by polling the backend.

**Architecture:** Checkout calls `POST /payments/hyperpay/prepare`, receives a `payment_url`, and pushes a WebView screen. When the backend redirects the WebView to its terminal `/success|/pending|/failed` page, the app replaces the WebView with a `PaymentStatus` screen that polls `GET /payments/hyperpay/status/{id}` until the payment resolves. All decision logic lives in two pure, unit-tested functions; the screens are thin.

**Tech Stack:** React Native 0.82 (bare), TypeScript, zustand, axios, react-i18next, `@react-navigation/native-stack`, jest (`preset: react-native`), plus one new dependency: `react-native-webview`.

**Spec:** `docs/superpowers/specs/2026-08-09-hyperpay-mobile-checkout-design.md`

**Endpoint paths verified** against the backend's `HyperPay.postman_collection.json`, whose `base_url` is `https://backend.vena-app.com/api` — identical to the app's `BASE_URL`, so `/payments/hyperpay/prepare` and `/payments/hyperpay/status/{id}` are correct as relative paths. That collection also confirms the backend returns **422 when billing fields are missing** (request `F1`) and **401/403 when a non-owner reads a payment status** (request `D4`).

## Global Constraints

- **Branch:** work on `feature/hyperpay-checkout` (already created, spec committed).
- **`npx tsc --noEmit` is NOT a usable gate.** It fails at config level with `TS5098: Option 'customConditions' can only be used when 'moduleResolution' is set to 'node16', 'nodenext', or 'bundler'` before typechecking anything. Do not add it to any verification step, and do not "fix" `tsconfig.json` as part of this work.
- **Bare `npx jest` is red at baseline.** The pre-existing `__tests__/App.test.tsx` fails on a RN 0.82 / `@react-navigation` ESM transform error. This is not your regression. Always run jest scoped to a path: `npx jest src/path/to/file.test.ts`. Never run bare `npx jest` and never claim the suite is green.
- **Verification gates for every task:** the task's own scoped `npx jest <path>` run, plus `npx eslint <changed files>` (exits 0 at baseline).
- **Path aliases** (`@services`, `@components`, `@store`, `@constants`, `@utils`, `@config`, `@assets`) are resolved by `babel-plugin-module-resolver` and work in both app code and jest. Use them; do not add deep relative imports across top-level folders.
- **`BASE_URL`** is `https://backend.vena-app.com/api` (from `@constants`). It already includes `/api`, so endpoint constants must be relative to it.
- **Currency formatting:** English `SAR 12.34`, Arabic `12.34 ر.س`. Copy the `formatCurrency` shape already in `src/screens/ManageClinic/Checkout/index.tsx:33-37`.
- **Every user-facing string** must be a `t('key')` lookup with the key added to BOTH `src/services/locales/en.json` and `src/services/locales/ar.json`. Both files are flat single-level JSON objects (574 keys today). Never hardcode display text.
- **Colors** come from `src/styles/colors.ts` — `colors.primary` `#7625D7`, `colors.red` `#FB3748`, `colors.green` `#00B22D`, `colors.text`, `colors.secondaryText`, `colors.border`, `colors.gray`, `colors.white`. Never hardcode a hex in a new file.
- **Scope guard:** do not touch `src/screens/ManageClinic/ConsulationPayment/`. Its card form stays exactly as-is. Changes to the shared `PaymentMethod` component must be additive and default to current behaviour.
- **Commit after every task** with a `feat:`/`test:`/`chore:` prefixed message.

---

## File Structure

**Create**

| Path | Responsibility |
|---|---|
| `src/types/payment.types.ts` | Payment DTOs and status unions. No logic. |
| `src/services/payments/hyperpayService.ts` | The two HTTP calls. No React, no navigation. |
| `src/services/payments/__tests__/hyperpayService.test.ts` | Tests for the above. |
| `src/utils/billingDetails.ts` | Name splitting, prefill, validation, AsyncStorage cache. |
| `src/utils/__tests__/billingDetails.test.ts` | Tests for the above. |
| `src/screens/Comman/PaymentWebView/classifyHyperPayUrl.ts` | Pure URL classifier. |
| `src/screens/Comman/PaymentWebView/__tests__/classifyHyperPayUrl.test.ts` | Tests for the above. |
| `src/screens/Comman/PaymentWebView/index.tsx` | WebView host. |
| `src/screens/Comman/PaymentWebView/style.ts` | Its styles. |
| `src/screens/Comman/PaymentStatus/resolvePaymentOutcome.ts` | Pure status → outcome mapping. |
| `src/screens/Comman/PaymentStatus/__tests__/resolvePaymentOutcome.test.ts` | Tests for the above. |
| `src/screens/Comman/PaymentStatus/index.tsx` | Polling + result UI. |
| `src/screens/Comman/PaymentStatus/style.ts` | Its styles. |
| `src/components/molecules/BillingDetailsForm.tsx` | Controlled billing inputs, presentational. |

**Modify**

| Path | Change |
|---|---|
| `package.json` / `ios/Podfile.lock` | Add `react-native-webview`. |
| `src/services/api/api-endpoint.ts` | Add `PAYMENTS.HYPERPAY`. |
| `src/navigation/MainNavigator.tsx` | Register 2 screens, extend `MainStackParamList`. |
| `src/components/molecules/PaymentMethod.tsx` | Add optional `variant` prop. |
| `src/components/molecules/index.ts` | Export `BillingDetailsForm`. |
| `src/screens/ManageClinic/Checkout/index.tsx` | Card form → billing form; stripe call → prepare. |
| `src/services/locales/en.json`, `ar.json` | New keys. |

---

## Task 1: Foundation — dependency, endpoints, types

**Files:**
- Modify: `package.json` (add dependency)
- Modify: `src/services/api/api-endpoint.ts:76-78`
- Create: `src/types/payment.types.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `API.PAYMENTS.HYPERPAY.PREPARE`, `API.PAYMENTS.HYPERPAY.STATUS`; types `PaymentStatus`, `FulfillmentStatus`, `BillingDetails`, `PrepareCartPayload`, `PrepareResponseData`, `PaymentStatusData`.

- [ ] **Step 1: Install react-native-webview**

```bash
npm install react-native-webview
```

- [ ] **Step 2: Install iOS pods**

```bash
cd ios && pod install && cd ..
```

Expected: output includes `Installing react-native-webview`. If CocoaPods is unavailable on this machine, stop and report it — a native rebuild is required for this feature and cannot be skipped.

- [ ] **Step 3: Add the endpoint constants**

In `src/services/api/api-endpoint.ts`, immediately after the `CHECKOUT` block (currently lines 76-78), add:

```ts
  PAYMENTS: {
    HYPERPAY: {
      PREPARE: '/payments/hyperpay/prepare',
      STATUS: '/payments/hyperpay/status', // GET /status/{paymentId}
    },
  },
```

Leave the existing `CHECKOUT.CHECKOUT` constant in place — `ConsultationPayment` and other callers are unaffected by this work.

- [ ] **Step 4: Create the payment types**

Create `src/types/payment.types.ts`:

```ts
export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'cancelled';

export type FulfillmentStatus =
  | 'pending'
  | 'processing'
  | 'fulfilled'
  | 'failed';

/** Billing block required by POST /payments/hyperpay/prepare. */
export interface BillingDetails {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  billing_street1: string;
  billing_city: string;
  billing_state: string;
  /** ISO alpha-2, e.g. 'SA'. */
  billing_country: string;
  billing_postcode: string;
}

export interface PrepareCartPayload extends BillingDetails {
  purpose: 'cart';
  redeem_points: number;
}

export interface PrepareResponseData {
  payment_id: number;
  payment_reference: string;
  checkout_id: string;
  payment_url: string;
  purpose: string;
  expires_at: string;
}

export interface PaymentStatusData {
  payment_id: number;
  payment_reference: string;
  purpose: string;
  provider: string;
  /** Server-authoritative charged amount, e.g. '57.50'. */
  amount: string;
  currency: string;
  status: PaymentStatus;
  fulfillment_status: FulfillmentStatus;
  expires_at: string | null;
  paid_at: string | null;
  fulfilled_at: string | null;
}
```

- [ ] **Step 5: Verify lint passes**

Run: `npx eslint src/services/api/api-endpoint.ts src/types/payment.types.ts`
Expected: exit 0, no output.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json ios/Podfile.lock src/services/api/api-endpoint.ts src/types/payment.types.ts
git commit -m "chore: add react-native-webview, HyperPay endpoints and payment types"
```

---

## Task 2: hyperpayService

**Files:**
- Create: `src/services/payments/hyperpayService.ts`
- Test: `src/services/payments/__tests__/hyperpayService.test.ts`

**Interfaces:**
- Consumes: `API.PAYMENTS.HYPERPAY.*` and all types from Task 1.
- Produces:
  - `prepareCartCheckout(payload: PrepareCartPayload): Promise<PrepareResponseData>`
  - `getPaymentStatus(paymentId: number | string): Promise<PaymentStatusData>`
  - Both reject with `{ status?: number; message: string; data?: unknown }`, matching the shape `apiClient`'s response interceptor already produces.

- [ ] **Step 1: Write the failing tests**

Create `src/services/payments/__tests__/hyperpayService.test.ts`:

```ts
jest.mock('@services/api/api-client', () => ({
  apiClient: { post: jest.fn(), get: jest.fn() },
}));

import { apiClient } from '@services/api/api-client';
import {
  prepareCartCheckout,
  getPaymentStatus,
} from '../hyperpayService';
import type { PrepareCartPayload } from '../../../types/payment.types';

const mockPost = apiClient.post as jest.Mock;
const mockGet = apiClient.get as jest.Mock;

const payload: PrepareCartPayload = {
  purpose: 'cart',
  redeem_points: 0,
  first_name: 'Ahmed',
  last_name: 'Ali',
  email: 'a@example.com',
  phone: '0500000000',
  billing_street1: 'King Fahd Rd',
  billing_city: 'Riyadh',
  billing_state: 'Riyadh',
  billing_country: 'SA',
  billing_postcode: '12211',
};

const prepareData = {
  payment_id: 11,
  payment_reference: 'PAY-1',
  checkout_id: 'chk_1',
  payment_url: 'https://backend.vena-app.com/api/payments/hyperpay/form/11',
  purpose: 'cart',
  expires_at: '2026-08-09T11:09:43+00:00',
};

beforeEach(() => {
  mockPost.mockReset();
  mockGet.mockReset();
});

describe('prepareCartCheckout', () => {
  it('posts the payload to the prepare endpoint', async () => {
    mockPost.mockResolvedValue({ data: { success: true, data: prepareData } });

    await prepareCartCheckout(payload);

    expect(mockPost).toHaveBeenCalledWith(
      '/payments/hyperpay/prepare',
      payload,
    );
  });

  it('returns the data block on success', async () => {
    mockPost.mockResolvedValue({ data: { success: true, data: prepareData } });

    await expect(prepareCartCheckout(payload)).resolves.toEqual(prepareData);
  });

  it('rejects with the server message when success is false', async () => {
    mockPost.mockResolvedValue({
      data: { success: false, message: 'Your cart is empty.' },
    });

    await expect(prepareCartCheckout(payload)).rejects.toMatchObject({
      message: 'Your cart is empty.',
    });
  });

  it('rejects when payment_url is missing even if success is true', async () => {
    mockPost.mockResolvedValue({
      data: { success: true, data: { payment_id: 11 } },
    });

    await expect(prepareCartCheckout(payload)).rejects.toMatchObject({
      message: expect.any(String),
    });
  });
});

describe('getPaymentStatus', () => {
  const statusData = {
    payment_id: 11,
    payment_reference: 'PAY-1',
    purpose: 'cart',
    provider: 'hyperpay',
    amount: '57.50',
    currency: 'SAR',
    status: 'paid',
    fulfillment_status: 'fulfilled',
    expires_at: null,
    paid_at: '2026-08-09T11:00:00+00:00',
    fulfilled_at: '2026-08-09T11:00:02+00:00',
  };

  it('appends the payment id to the status path', async () => {
    mockGet.mockResolvedValue({ data: { success: true, data: statusData } });

    await getPaymentStatus(11);

    expect(mockGet).toHaveBeenCalledWith('/payments/hyperpay/status/11');
  });

  it('returns the data block on success', async () => {
    mockGet.mockResolvedValue({ data: { success: true, data: statusData } });

    await expect(getPaymentStatus(11)).resolves.toEqual(statusData);
  });

  it('rejects when the body has no data block', async () => {
    mockGet.mockResolvedValue({ data: { success: true } });

    await expect(getPaymentStatus(11)).rejects.toMatchObject({
      message: expect.any(String),
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest src/services/payments/__tests__/hyperpayService.test.ts`
Expected: FAIL — `Cannot find module '../hyperpayService'`.

- [ ] **Step 3: Write the implementation**

Create `src/services/payments/hyperpayService.ts`:

```ts
import { apiClient } from '@services/api/api-client';
import { API } from '@services/api/api-endpoint';
import type {
  PrepareCartPayload,
  PrepareResponseData,
  PaymentStatusData,
} from '../../types/payment.types';

export interface PaymentServiceError {
  status?: number;
  message: string;
  data?: unknown;
}

function fail(message: string, body: any, status?: number): PaymentServiceError {
  return { status, message: body?.message || message, data: body };
}

/**
 * Creates a pending payment and a HyperPay checkout for the caller's cart.
 * The amount is computed server-side from the cart; nothing here influences it.
 */
export async function prepareCartCheckout(
  payload: PrepareCartPayload,
): Promise<PrepareResponseData> {
  const response = await apiClient.post(API.PAYMENTS.HYPERPAY.PREPARE, payload);
  const body = response?.data;

  if (!body?.success || !body?.data?.payment_url) {
    throw fail('Failed to create checkout', body, response?.status);
  }

  return body.data as PrepareResponseData;
}

/** Reads the verified payment + fulfilment state. Owner-token only. */
export async function getPaymentStatus(
  paymentId: number | string,
): Promise<PaymentStatusData> {
  const response = await apiClient.get(
    `${API.PAYMENTS.HYPERPAY.STATUS}/${paymentId}`,
  );
  const body = response?.data;

  if (!body?.success || !body?.data) {
    throw fail('Failed to fetch payment status', body, response?.status);
  }

  return body.data as PaymentStatusData;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest src/services/payments/__tests__/hyperpayService.test.ts`
Expected: PASS, 7 tests.

- [ ] **Step 5: Lint**

Run: `npx eslint src/services/payments`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/services/payments
git commit -m "feat: add HyperPay prepare and status service"
```

---

## Task 3: billingDetails utility

**Files:**
- Create: `src/utils/billingDetails.ts`
- Test: `src/utils/__tests__/billingDetails.test.ts`

**Interfaces:**
- Consumes: `BillingDetails` from Task 1.
- Produces:
  - `EMPTY_BILLING: BillingDetails`
  - `splitName(fullName?: string | null): { first_name: string; last_name: string }`
  - `buildBillingPrefill(profile: ProfileLike | null, cached: Partial<BillingDetails> | null): BillingDetails`
  - `validateBilling(billing: BillingDetails): (keyof BillingDetails)[]` — returns the keys that are invalid, empty array when valid
  - `loadCachedBilling(): Promise<Partial<BillingDetails> | null>`
  - `saveCachedBilling(billing: BillingDetails): Promise<void>`
  - `type ProfileLike = { name?: string; email?: string; phoneNo?: string; city?: string | null }`

Precedence per the spec: **profile wins for identity fields** (`first_name`, `last_name`, `email`, `phone`), **cache wins for address fields** (`billing_street1`, `billing_city`, `billing_state`, `billing_postcode`, `billing_country`), with profile `city` and `'SA'` as address fallbacks. Empty/whitespace values never beat a non-empty one from the lower-priority source.

- [ ] **Step 1: Write the failing tests**

Create `src/utils/__tests__/billingDetails.test.ts`:

```ts
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
```

Note the cache deliberately stores address fields only. Identity fields always come from the profile, so persisting them would be dead data and an avoidable place to leak an email address into app storage.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest src/utils/__tests__/billingDetails.test.ts`
Expected: FAIL — `Cannot find module '../billingDetails'`.

- [ ] **Step 3: Write the implementation**

Create `src/utils/billingDetails.ts`:

```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest src/utils/__tests__/billingDetails.test.ts`
Expected: PASS, 19 tests.

- [ ] **Step 5: Lint**

Run: `npx eslint src/utils/billingDetails.ts src/utils/__tests__/billingDetails.test.ts`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/utils/billingDetails.ts src/utils/__tests__/billingDetails.test.ts
git commit -m "feat: add billing details prefill, validation and cache"
```

---

## Task 4: classifyHyperPayUrl

This is the highest-risk logic in the feature. A missed match strands a user who has already paid; a false match on a foreign origin would let an arbitrary page drive the app into a success state.

**Files:**
- Create: `src/screens/Comman/PaymentWebView/classifyHyperPayUrl.ts`
- Test: `src/screens/Comman/PaymentWebView/__tests__/classifyHyperPayUrl.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `type HyperPayUrlKind = 'success' | 'pending' | 'failed' | 'result' | 'other'`
  - `classifyHyperPayUrl(url: string, baseUrl: string): HyperPayUrlKind`
  - `isTerminalUrlKind(kind: HyperPayUrlKind): boolean` — true for `success`/`pending`/`failed` only

- [ ] **Step 1: Write the failing tests**

Create `src/screens/Comman/PaymentWebView/__tests__/classifyHyperPayUrl.test.ts`:

```ts
import {
  classifyHyperPayUrl,
  isTerminalUrlKind,
} from '../classifyHyperPayUrl';

const BASE = 'https://backend.vena-app.com/api';
const ORIGIN = 'https://backend.vena-app.com';

describe('classifyHyperPayUrl', () => {
  it('recognises the three terminal pages', () => {
    expect(
      classifyHyperPayUrl(`${ORIGIN}/api/payments/hyperpay/success`, BASE),
    ).toBe('success');
    expect(
      classifyHyperPayUrl(`${ORIGIN}/api/payments/hyperpay/pending`, BASE),
    ).toBe('pending');
    expect(
      classifyHyperPayUrl(`${ORIGIN}/api/payments/hyperpay/failed`, BASE),
    ).toBe('failed');
  });

  it('ignores query strings and fragments', () => {
    expect(
      classifyHyperPayUrl(
        `${ORIGIN}/api/payments/hyperpay/success?id=11&x=y#done`,
        BASE,
      ),
    ).toBe('success');
  });

  it('ignores a trailing slash', () => {
    expect(
      classifyHyperPayUrl(`${ORIGIN}/api/payments/hyperpay/success/`, BASE),
    ).toBe('success');
  });

  it('is case-insensitive on the path', () => {
    expect(
      classifyHyperPayUrl(`${ORIGIN}/api/payments/hyperpay/SUCCESS`, BASE),
    ).toBe('success');
  });

  it('classifies the result URL separately so it is never intercepted', () => {
    expect(
      classifyHyperPayUrl(
        `${ORIGIN}/api/payments/hyperpay/result/11?resourcePath=%2Fv1%2Fcheckouts%2Fabc%2Fpayment`,
        BASE,
      ),
    ).toBe('result');
  });

  it('treats the widget form page as unremarkable', () => {
    expect(
      classifyHyperPayUrl(`${ORIGIN}/api/payments/hyperpay/form/11`, BASE),
    ).toBe('other');
  });

  it('treats a matching path on a foreign origin as other', () => {
    expect(
      classifyHyperPayUrl(
        'https://evil.example.com/api/payments/hyperpay/success',
        BASE,
      ),
    ).toBe('other');
  });

  it('does not match a look-alike host', () => {
    expect(
      classifyHyperPayUrl(
        'https://backend.vena-app.com.evil.example/api/payments/hyperpay/success',
        BASE,
      ),
    ).toBe('other');
  });

  it('treats an origin scheme mismatch as other', () => {
    expect(
      classifyHyperPayUrl(
        'http://backend.vena-app.com/api/payments/hyperpay/success',
        BASE,
      ),
    ).toBe('other');
  });

  it('handles issuer 3DS pages and junk input without throwing', () => {
    expect(classifyHyperPayUrl('https://acs.somebank.sa/3ds/step', BASE)).toBe(
      'other',
    );
    expect(classifyHyperPayUrl('', BASE)).toBe('other');
    expect(classifyHyperPayUrl('about:blank', BASE)).toBe('other');
    expect(classifyHyperPayUrl(`${ORIGIN}/api/x`, '')).toBe('other');
  });
});

describe('isTerminalUrlKind', () => {
  it('is true only for the three terminal pages', () => {
    expect(isTerminalUrlKind('success')).toBe(true);
    expect(isTerminalUrlKind('pending')).toBe(true);
    expect(isTerminalUrlKind('failed')).toBe(true);
  });

  it('is false for result, so the backend can verify undisturbed', () => {
    expect(isTerminalUrlKind('result')).toBe(false);
  });

  it('is false for everything else', () => {
    expect(isTerminalUrlKind('other')).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest src/screens/Comman/PaymentWebView/__tests__/classifyHyperPayUrl.test.ts`
Expected: FAIL — `Cannot find module '../classifyHyperPayUrl'`.

- [ ] **Step 3: Write the implementation**

Create `src/screens/Comman/PaymentWebView/classifyHyperPayUrl.ts`:

```ts
export type HyperPayUrlKind =
  | 'success'
  | 'pending'
  | 'failed'
  | 'result'
  | 'other';

const ORIGIN_PATTERN = /^(https?:\/\/[^/?#]+)/i;

function originOf(url: string): string {
  const match = ORIGIN_PATTERN.exec(url ?? '');
  return match ? match[1].toLowerCase() : '';
}

function pathOf(url: string, origin: string): string {
  return url
    .slice(origin.length)
    .split('#')[0]
    .split('?')[0]
    .replace(/\/+$/, '')
    .toLowerCase();
}

/**
 * Classifies a URL the WebView is navigating to.
 *
 * Only URLs served by our own backend origin can produce anything other than
 * 'other'. 3DS sends the WebView to arbitrary issuing-bank domains, so
 * navigation itself cannot be restricted — this origin check is what stops a
 * foreign page from driving the app into a success state.
 */
export function classifyHyperPayUrl(
  url: string,
  baseUrl: string,
): HyperPayUrlKind {
  if (!url || !baseUrl) return 'other';

  const expectedOrigin = originOf(baseUrl);
  const actualOrigin = originOf(url);
  if (!expectedOrigin || actualOrigin !== expectedOrigin) return 'other';

  const path = pathOf(url, actualOrigin);

  if (path.endsWith('/payments/hyperpay/success')) return 'success';
  if (path.endsWith('/payments/hyperpay/pending')) return 'pending';
  if (path.endsWith('/payments/hyperpay/failed')) return 'failed';
  if (/\/payments\/hyperpay\/result\/[^/]+$/.test(path)) return 'result';

  return 'other';
}

/**
 * 'result' is deliberately NOT terminal. Loading it is what makes the backend
 * verify with HyperPay and fulfil the order; intercepting it would abort that.
 */
export function isTerminalUrlKind(kind: HyperPayUrlKind): boolean {
  return kind === 'success' || kind === 'pending' || kind === 'failed';
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest src/screens/Comman/PaymentWebView/__tests__/classifyHyperPayUrl.test.ts`
Expected: PASS, 13 tests.

- [ ] **Step 5: Lint**

Run: `npx eslint src/screens/Comman/PaymentWebView`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/screens/Comman/PaymentWebView
git commit -m "feat: add HyperPay redirect URL classifier"
```

---

## Task 5: resolvePaymentOutcome

**Files:**
- Create: `src/screens/Comman/PaymentStatus/resolvePaymentOutcome.ts`
- Test: `src/screens/Comman/PaymentStatus/__tests__/resolvePaymentOutcome.test.ts`

**Interfaces:**
- Consumes: `PaymentStatus`, `FulfillmentStatus` from Task 1.
- Produces:
  - `type PaymentOutcome = 'confirming' | 'success' | 'processing' | 'failed' | 'fulfillment_failed'`
  - `resolvePaymentOutcome(status, fulfillmentStatus): PaymentOutcome`
  - `shouldKeepPolling(outcome: PaymentOutcome): boolean`

The five outcomes render as the spec's four visual states: `failed` and `fulfillment_failed` share the Failed state but differ in copy, and only `failed` offers a retry — `fulfillment_failed` means the card was charged, so inviting a second attempt would double-charge.

- [ ] **Step 1: Write the failing tests**

Create `src/screens/Comman/PaymentStatus/__tests__/resolvePaymentOutcome.test.ts`:

```ts
import {
  resolvePaymentOutcome,
  shouldKeepPolling,
} from '../resolvePaymentOutcome';

describe('resolvePaymentOutcome', () => {
  it('is a success only when paid AND fulfilled', () => {
    expect(resolvePaymentOutcome('paid', 'fulfilled')).toBe('success');
  });

  it('is processing when paid but fulfilment has not finished', () => {
    expect(resolvePaymentOutcome('paid', 'pending')).toBe('processing');
    expect(resolvePaymentOutcome('paid', 'processing')).toBe('processing');
  });

  it('distinguishes a captured payment whose fulfilment failed', () => {
    expect(resolvePaymentOutcome('paid', 'failed')).toBe(
      'fulfillment_failed',
    );
  });

  it('is failed for a confirmed HyperPay failure or cancellation', () => {
    expect(resolvePaymentOutcome('failed', 'pending')).toBe('failed');
    expect(resolvePaymentOutcome('cancelled', 'pending')).toBe('failed');
  });

  it('keeps confirming while HyperPay has not resolved', () => {
    expect(resolvePaymentOutcome('pending', 'pending')).toBe('confirming');
    expect(resolvePaymentOutcome('processing', 'pending')).toBe('confirming');
  });

  it('never reports success on an unpaid payment, whatever fulfilment says', () => {
    expect(resolvePaymentOutcome('pending', 'fulfilled')).toBe('confirming');
    expect(resolvePaymentOutcome('failed', 'fulfilled')).toBe('failed');
  });
});

describe('shouldKeepPolling', () => {
  it('keeps polling while unresolved or mid-fulfilment', () => {
    expect(shouldKeepPolling('confirming')).toBe(true);
    expect(shouldKeepPolling('processing')).toBe(true);
  });

  it('stops on any settled outcome', () => {
    expect(shouldKeepPolling('success')).toBe(false);
    expect(shouldKeepPolling('failed')).toBe(false);
    expect(shouldKeepPolling('fulfillment_failed')).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest src/screens/Comman/PaymentStatus/__tests__/resolvePaymentOutcome.test.ts`
Expected: FAIL — `Cannot find module '../resolvePaymentOutcome'`.

- [ ] **Step 3: Write the implementation**

Create `src/screens/Comman/PaymentStatus/resolvePaymentOutcome.ts`:

```ts
import type {
  PaymentStatus,
  FulfillmentStatus,
} from '../../../types/payment.types';

export type PaymentOutcome =
  | 'confirming'
  /** paid + fulfilled — the only state that means "booked". */
  | 'success'
  /** paid, fulfilment still running. */
  | 'processing'
  /** HyperPay declined or the checkout was cancelled. Retryable. */
  | 'failed'
  /** Card WAS charged but the booking could not be created. Never retryable. */
  | 'fulfillment_failed';

export function resolvePaymentOutcome(
  status: PaymentStatus,
  fulfillmentStatus: FulfillmentStatus,
): PaymentOutcome {
  if (status === 'paid') {
    if (fulfillmentStatus === 'fulfilled') return 'success';
    if (fulfillmentStatus === 'failed') return 'fulfillment_failed';
    return 'processing';
  }

  if (status === 'failed' || status === 'cancelled') return 'failed';

  // 'pending' and 'processing' — HyperPay has not resolved yet.
  return 'confirming';
}

export function shouldKeepPolling(outcome: PaymentOutcome): boolean {
  return outcome === 'confirming' || outcome === 'processing';
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest src/screens/Comman/PaymentStatus/__tests__/resolvePaymentOutcome.test.ts`
Expected: PASS, 8 tests.

- [ ] **Step 5: Lint**

Run: `npx eslint src/screens/Comman/PaymentStatus`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/screens/Comman/PaymentStatus
git commit -m "feat: add payment outcome resolution"
```

---

## Task 6: PaymentStatus screen

**Files:**
- Create: `src/screens/Comman/PaymentStatus/index.tsx`
- Create: `src/screens/Comman/PaymentStatus/style.ts`
- Modify: `src/navigation/MainNavigator.tsx` (param list + registration)
- Modify: `src/services/locales/en.json`, `src/services/locales/ar.json`

**Interfaces:**
- Consumes: `getPaymentStatus` (Task 2), `resolvePaymentOutcome` / `shouldKeepPolling` (Task 5), `PaymentStatusData` (Task 1).
- Produces: route `PaymentStatus` with params `{ paymentId: number | string; expectedAmount?: number }`.

`expectedAmount` is the preview total Checkout showed the user. The backend is
authoritative for the charge, so this value is never sent anywhere — it exists
only so a divergence between the two calculations is visible in the logs
during testing instead of silently reaching a user's card statement.

- [ ] **Step 1: Add the translation keys**

Add to `src/services/locales/en.json`:

```json
"payment_confirming_title": "Confirming your payment",
"payment_confirming_body": "Please wait while we confirm your payment. Don't close the app.",
"payment_success_title": "Payment successful",
"payment_success_body": "Your appointment has been booked. You'll find the details in your history.",
"payment_processing_title": "Payment received",
"payment_processing_body": "We're still finalising your booking. This usually takes a moment — you'll see it in your history shortly.",
"payment_declined_title": "Payment declined",
"payment_declined_body": "Your payment was not completed and you have not been charged. You can try again.",
"payment_unfulfilled_title": "Payment received — booking pending",
"payment_unfulfilled_body": "Your payment went through but we couldn't finalise the booking. Our team has been notified and will sort this out. Please don't pay again.",
"payment_amount_charged": "Amount charged",
"payment_reference": "Reference",
"try_again": "Try Again",
"view_history": "View History"
```

`done` and `cancel` already exist in both files — do not add them again.

Add the same keys to `src/services/locales/ar.json` with these values:

```json
"payment_confirming_title": "جارٍ تأكيد الدفع",
"payment_confirming_body": "يرجى الانتظار بينما نؤكد عملية الدفع. لا تغلق التطبيق.",
"payment_success_title": "تم الدفع بنجاح",
"payment_success_body": "تم حجز موعدك. ستجد التفاصيل في السجل.",
"payment_processing_title": "تم استلام الدفعة",
"payment_processing_body": "ما زلنا ننهي الحجز. عادةً ما يستغرق ذلك لحظات، وستجده في السجل قريبًا.",
"payment_declined_title": "تم رفض الدفع",
"payment_declined_body": "لم تكتمل عملية الدفع ولم يتم خصم أي مبلغ. يمكنك المحاولة مرة أخرى.",
"payment_unfulfilled_title": "تم استلام الدفعة — الحجز قيد المعالجة",
"payment_unfulfilled_body": "تمت عملية الدفع لكن تعذّر إتمام الحجز. تم إبلاغ فريقنا وسيتم حل المشكلة. يرجى عدم الدفع مرة أخرى.",
"payment_amount_charged": "المبلغ المدفوع",
"payment_reference": "الرقم المرجعي",
"try_again": "حاول مرة أخرى",
"view_history": "عرض السجل"
```

Both files are flat objects — insert the keys at the end, before the closing brace, and keep the file valid JSON.

- [ ] **Step 2: Verify both locale files are still valid JSON**

Run:

```bash
node -e "JSON.parse(require('fs').readFileSync('src/services/locales/en.json','utf8'));JSON.parse(require('fs').readFileSync('src/services/locales/ar.json','utf8'));console.log('valid')"
```

Expected: `valid`

- [ ] **Step 3: Create the styles**

Create `src/screens/Comman/PaymentStatus/style.ts`:

```ts
import { StyleSheet } from 'react-native';
import { colors } from '../../../styles/colors';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  detailBox: {
    marginTop: 24,
    width: '100%',
    backgroundColor: colors.gray,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { fontSize: 13, color: colors.secondaryText },
  detailValue: { fontSize: 13, fontWeight: '600', color: colors.text },
  actions: { paddingHorizontal: 24, gap: 12 },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
```

- [ ] **Step 4: Create the screen**

Create `src/screens/Comman/PaymentStatus/index.tsx`:

```tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  AppStateStatus,
  BackHandler,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { colors } from '../../../styles/colors';
import { getPaymentStatus } from '@services/payments/hyperpayService';
import type { PaymentStatusData } from '../../../types/payment.types';
import { useCart } from '@context/CartContext';
import { useCartCountContext } from '@context/CartCountContext';
import { useProfileStore } from '@store';
import { styles } from './style';
import {
  PaymentOutcome,
  resolvePaymentOutcome,
  shouldKeepPolling,
} from './resolvePaymentOutcome';

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 30000;

export function PaymentStatusScreen({ route, navigation }: any) {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const isArabic = i18n.language?.startsWith('ar');

  const paymentId = route?.params?.paymentId;
  const expectedAmount: number | undefined = route?.params?.expectedAmount;

  const { clearCart } = useCart();
  const { triggerRefresh } = useCartCountContext();
  const refreshProfile = useProfileStore(state => state.refreshProfile);

  const [outcome, setOutcome] = useState<PaymentOutcome>('confirming');
  const [payment, setPayment] = useState<PaymentStatusData | null>(null);

  const settledRef = useRef(false);
  const fulfilledOnceRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deadlineRef = useRef<number>(Date.now() + POLL_TIMEOUT_MS);
  const mountedRef = useRef(true);

  const formatAmount = useCallback(
    (amount: string, currency: string) =>
      isArabic ? `${amount} ر.س` : `${currency} ${amount}`,
    [isArabic],
  );

  /** Runs exactly once, the first time we see paid + fulfilled. */
  const onFulfilled = useCallback(() => {
    if (fulfilledOnceRef.current) return;
    fulfilledOnceRef.current = true;

    clearCart();
    triggerRefresh();
    refreshProfile().catch(() => {});
  }, [clearCart, triggerRefresh, refreshProfile]);

  const poll = useCallback(async () => {
    if (settledRef.current || !mountedRef.current) return;

    try {
      const data = await getPaymentStatus(paymentId);
      if (!mountedRef.current) return;

      setPayment(data);
      const next = resolvePaymentOutcome(data.status, data.fulfillment_status);
      setOutcome(next);

      // The server owns the amount; this only surfaces a divergence between
      // its calculation and the preview Checkout showed the user.
      if (expectedAmount !== undefined && data.status === 'paid') {
        const charged = Number(data.amount);
        if (
          Number.isFinite(charged) &&
          Math.abs(charged - expectedAmount) >= 0.01
        ) {
          console.warn(
            `[PaymentStatus] amount mismatch: previewed ${expectedAmount.toFixed(
              2,
            )}, charged ${data.amount} ${data.currency}`,
          );
        }
      }

      if (next === 'success') onFulfilled();

      if (!shouldKeepPolling(next)) {
        settledRef.current = true;
        return;
      }
    } catch (error: any) {
      // apiClient's global response interceptor calls logout() on ANY 401.
      // A token expiring during a slow 3DS flow would otherwise have us
      // hammer the endpoint 15 more times while the app tears down the
      // session. Stop immediately; the payment still settles server-side
      // via the webhook and will appear in history.
      if (error?.status === 401) {
        settledRef.current = true;
        setOutcome(prev => (prev === 'confirming' ? 'processing' : prev));
        return;
      }

      // Any other failure is a network problem, not a failed payment.
      console.warn('[PaymentStatus] poll failed', error);
    }

    if (Date.now() >= deadlineRef.current) {
      settledRef.current = true;
      // Whatever we last saw is what the user gets; 'confirming' at the
      // deadline reads as "still processing" rather than an error.
      setOutcome(prev => (prev === 'confirming' ? 'processing' : prev));
      return;
    }

    timerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
  }, [paymentId, expectedAmount, onFulfilled]);

  useEffect(() => {
    mountedRef.current = true;
    poll();

    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [poll]);

  // Pause while backgrounded, re-poll immediately on return.
  useEffect(() => {
    const onChange = (state: AppStateStatus) => {
      if (state === 'active' && !settledRef.current) {
        if (timerRef.current) clearTimeout(timerRef.current);
        poll();
      } else if (state !== 'active' && timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [poll]);

  // Block hardware back while we are still confirming.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      return outcome === 'confirming';
    });
    return () => sub.remove();
  }, [outcome]);

  const goToClinic = () =>
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'EntryPoint',
          params: { screen: 'Clinic', params: { screen: 'ClinicScreen' } },
        },
      ],
    });

  const goToHistory = () =>
    navigation.reset({
      index: 0,
      routes: [{ name: 'EntryPoint', params: { screen: 'History' } }],
    });

  const view = VIEWS[outcome];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {outcome === 'confirming' ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <View
            style={[styles.iconWrap, { backgroundColor: view.tint + '1A' }]}
          >
            <Ionicons name={view.icon} size={44} color={view.tint} />
          </View>
        )}

        <Text style={[styles.title, { marginTop: 24 }]}>{t(view.title)}</Text>
        <Text style={styles.body}>{t(view.body)}</Text>

        {payment && outcome !== 'confirming' && outcome !== 'failed' && (
          <View style={styles.detailBox}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                {t('payment_amount_charged')}
              </Text>
              <Text style={styles.detailValue}>
                {formatAmount(payment.amount, payment.currency)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('payment_reference')}</Text>
              <Text style={styles.detailValue}>
                {payment.payment_reference}
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={[styles.actions, { paddingBottom: 16 + insets.bottom }]}>
        {outcome === 'success' && (
          <TouchableOpacity style={styles.primaryButton} onPress={goToClinic}>
            <Text style={styles.primaryButtonText}>{t('done')}</Text>
          </TouchableOpacity>
        )}

        {(outcome === 'processing' || outcome === 'fulfillment_failed') && (
          <TouchableOpacity style={styles.primaryButton} onPress={goToHistory}>
            <Text style={styles.primaryButtonText}>{t('view_history')}</Text>
          </TouchableOpacity>
        )}

        {outcome === 'failed' && (
          <>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.primaryButtonText}>{t('try_again')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={goToClinic}
            >
              <Text style={styles.secondaryButtonText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const VIEWS: Record<
  PaymentOutcome,
  { title: string; body: string; icon: string; tint: string }
> = {
  confirming: {
    title: 'payment_confirming_title',
    body: 'payment_confirming_body',
    icon: 'time-outline',
    tint: colors.primary,
  },
  success: {
    title: 'payment_success_title',
    body: 'payment_success_body',
    icon: 'checkmark-circle',
    tint: colors.green,
  },
  processing: {
    title: 'payment_processing_title',
    body: 'payment_processing_body',
    icon: 'hourglass-outline',
    tint: colors.yellow,
  },
  failed: {
    title: 'payment_declined_title',
    body: 'payment_declined_body',
    icon: 'close-circle',
    tint: colors.red,
  },
  fulfillment_failed: {
    title: 'payment_unfulfilled_title',
    body: 'payment_unfulfilled_body',
    icon: 'alert-circle',
    tint: colors.yellow,
  },
};
```

`t('cancel')` reuses the existing `cancel` key (`"Cancel"`) — already present in both locale files, do not re-add it.

The `Clinic` and `History` tab names used in `goToClinic` / `goToHistory` are the real registered tab routes (`src/navigation/bottomTab` registers `Home`, `Clinic`, `History`, `Setting`). No lookup needed.

- [ ] **Step 5: Register the screen**

In `src/navigation/MainNavigator.tsx`:

Add to `MainStackParamList` (after `CheckoutScreen: undefined;` on line 46):

```ts
  PaymentStatus: { paymentId: number | string; expectedAmount?: number };
```

Add the import alongside the other screen imports:

```ts
import { PaymentStatusScreen } from '../screens/Comman/PaymentStatus';
```

Register inside `MainNavigator`'s `Stack.Navigator`, after the `CheckoutScreen` line:

```tsx
      <Stack.Screen
        name="PaymentStatus"
        component={PaymentStatusScreen}
        options={{ gestureEnabled: false, headerBackVisible: false }}
      />
```

`gestureEnabled: false` matters — swiping back out of a payment confirmation would leave the user with no idea whether they were charged.

- [ ] **Step 6: Verify the existing pure tests still pass and lint is clean**

Run:

```bash
npx jest src/screens/Comman/PaymentStatus
npx eslint src/screens/Comman/PaymentStatus src/navigation/MainNavigator.tsx
```

Expected: jest PASS (8 tests, unchanged); eslint exit 0.

- [ ] **Step 7: Commit**

```bash
git add src/screens/Comman/PaymentStatus src/navigation/MainNavigator.tsx src/services/locales
git commit -m "feat: add payment status screen with polling"
```

---

## Task 7: PaymentWebView screen

**Files:**
- Create: `src/screens/Comman/PaymentWebView/index.tsx`
- Create: `src/screens/Comman/PaymentWebView/style.ts`
- Modify: `src/navigation/MainNavigator.tsx`
- Modify: `src/services/locales/en.json`, `src/services/locales/ar.json`

**Interfaces:**
- Consumes: `classifyHyperPayUrl` / `isTerminalUrlKind` (Task 4), route `PaymentStatus` (Task 6), `BASE_URL` from `@constants`.
- Produces: route `PaymentWebView` with params `{ paymentUrl: string; paymentId: number | string; expectedAmount?: number }`. `expectedAmount` is passed straight through to `PaymentStatus` untouched.

- [ ] **Step 1: Add the translation keys**

Add to `src/services/locales/en.json`:

```json
"payment_title": "Payment",
"abandon_payment_title": "Leave payment?",
"abandon_payment_confirm": "If you've already entered your card details, leaving now may still result in a charge. We'll check your payment status.",
"leave": "Leave",
"stay": "Stay"
```

Add to `src/services/locales/ar.json`:

```json
"payment_title": "الدفع",
"abandon_payment_title": "مغادرة صفحة الدفع؟",
"abandon_payment_confirm": "إذا كنت قد أدخلت بيانات بطاقتك، فقد يتم الخصم رغم المغادرة. سنتحقق من حالة الدفع.",
"leave": "مغادرة",
"stay": "البقاء"
```

- [ ] **Step 2: Verify the locale files are valid JSON**

Run:

```bash
node -e "JSON.parse(require('fs').readFileSync('src/services/locales/en.json','utf8'));JSON.parse(require('fs').readFileSync('src/services/locales/ar.json','utf8'));console.log('valid')"
```

Expected: `valid`

- [ ] **Step 3: Create the styles**

Create `src/screens/Comman/PaymentWebView/style.ts`:

```ts
import { StyleSheet } from 'react-native';
import { colors } from '../../../styles/colors';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  headerButton: { width: 32, height: 32, justifyContent: 'center' },
  webview: { flex: 1 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
});
```

- [ ] **Step 4: Create the screen**

Create `src/screens/Comman/PaymentWebView/index.tsx`:

```tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, WebViewNavigation } from 'react-native-webview';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { BASE_URL } from '@constants';
import { colors } from '../../../styles/colors';
import { styles } from './style';
import { classifyHyperPayUrl, isTerminalUrlKind } from './classifyHyperPayUrl';

export function PaymentWebViewScreen({ route, navigation }: any) {
  const { t } = useTranslation();
  const { paymentUrl, paymentId, expectedAmount } = route?.params ?? {};

  const [loading, setLoading] = useState(true);
  const handedOffRef = useRef(false);

  /**
   * Replaces this screen with the status screen. Guarded because the WebView
   * can report the same navigation more than once.
   */
  const handOffToStatus = useCallback(() => {
    if (handedOffRef.current) return;
    handedOffRef.current = true;
    navigation.replace('PaymentStatus', { paymentId, expectedAmount });
  }, [navigation, paymentId, expectedAmount]);

  const confirmLeave = useCallback(() => {
    if (handedOffRef.current) return;

    Alert.alert(
      t('abandon_payment_title'),
      t('abandon_payment_confirm'),
      [
        { text: t('stay'), style: 'cancel' },
        {
          text: t('leave'),
          style: 'destructive',
          // Never drop the user back on Checkout — they may have been
          // charged, and only the status poll can tell us.
          onPress: handOffToStatus,
        },
      ],
      { cancelable: true },
    );
  }, [t, handOffToStatus]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      confirmLeave();
      return true;
    });
    return () => sub.remove();
  }, [confirmLeave]);

  const onNavigationStateChange = useCallback(
    (navState: WebViewNavigation) => {
      const kind = classifyHyperPayUrl(navState.url, BASE_URL);

      // 'result' is intentionally left alone: loading it is what triggers
      // backend verification and fulfilment.
      if (isTerminalUrlKind(kind)) handOffToStatus();
    },
    [handOffToStatus],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={confirmLeave}>
          <Ionicons name="close" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('payment_title')}</Text>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.webview}>
        <WebView
          source={{ uri: paymentUrl }}
          // 3DS hands off to arbitrary issuing-bank domains, so navigation
          // cannot be restricted to known hosts. The origin check inside
          // classifyHyperPayUrl is what keeps a foreign page from driving
          // the app into a success state.
          originWhitelist={['https://*']}
          javaScriptEnabled
          domStorageEnabled
          // Both are required for 3DS to complete.
          thirdPartyCookiesEnabled
          sharedCookiesEnabled
          setSupportMultipleWindows={false}
          onNavigationStateChange={onNavigationStateChange}
          onLoadEnd={() => setLoading(false)}
          onError={handOffToStatus}
          onHttpError={({ nativeEvent }) => {
            // Only bail on the initial document failing, not on a sub-resource.
            if (nativeEvent.url === paymentUrl) handOffToStatus();
          }}
          style={styles.webview}
        />

        {loading && (
          <View style={styles.loadingOverlay} pointerEvents="none">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
```

- [ ] **Step 5: Register the screen**

In `src/navigation/MainNavigator.tsx`, add to `MainStackParamList` next to the `PaymentStatus` entry:

```ts
  PaymentWebView: {
    paymentUrl: string;
    paymentId: number | string;
    expectedAmount?: number;
  };
```

Add the import:

```ts
import { PaymentWebViewScreen } from '../screens/Comman/PaymentWebView';
```

Register it just before the `PaymentStatus` screen:

```tsx
      <Stack.Screen
        name="PaymentWebView"
        component={PaymentWebViewScreen}
        options={{ gestureEnabled: false }}
      />
```

- [ ] **Step 6: Verify tests and lint**

Run:

```bash
npx jest src/screens/Comman/PaymentWebView
npx eslint src/screens/Comman/PaymentWebView src/navigation/MainNavigator.tsx
```

Expected: jest PASS (13 tests, unchanged); eslint exit 0.

- [ ] **Step 7: Commit**

```bash
git add src/screens/Comman/PaymentWebView src/navigation/MainNavigator.tsx src/services/locales
git commit -m "feat: add HyperPay payment WebView screen"
```

---

## Task 8: BillingDetailsForm and PaymentMethod card-only variant

**Files:**
- Create: `src/components/molecules/BillingDetailsForm.tsx`
- Modify: `src/components/molecules/index.ts`
- Modify: `src/components/molecules/PaymentMethod.tsx`
- Modify: `src/services/locales/en.json`, `src/services/locales/ar.json`

**Interfaces:**
- Consumes: `BillingDetails` (Task 1).
- Produces:
  - `<BillingDetailsForm value={BillingDetails} onChange={(next: BillingDetails) => void} invalidFields={(keyof BillingDetails)[]} />`
  - `PaymentMethod` gains `variant?: 'full' | 'card-only'`, defaulting to `'full'`.

**`variant` must default to `'full'`** so `ConsultationPayment`, which renders `PaymentMethod` with no such prop, behaves exactly as it does today.

- [ ] **Step 1: Add the translation keys**

Add to `src/services/locales/en.json`:

```json
"billing_details": "Billing Details",
"first_name": "First Name",
"last_name": "Last Name",
"email_address": "Email Address",
"phone_number": "Phone Number",
"street_address": "Street Address",
"city": "City",
"state_region": "State / Region",
"postcode": "Postcode",
"country_code": "Country (ISO code)",
"card_mada_visa_master": "Card — MADA / Visa / Mastercard",
"fill_billing_details": "Please complete your billing details",
"continue_to_payment": "Continue to Payment",
"please_login_to_checkout": "Please login to proceed with checkout"
```

Add to `src/services/locales/ar.json`:

```json
"billing_details": "بيانات الفوترة",
"first_name": "الاسم الأول",
"last_name": "اسم العائلة",
"email_address": "البريد الإلكتروني",
"phone_number": "رقم الجوال",
"street_address": "عنوان الشارع",
"city": "المدينة",
"state_region": "المنطقة",
"postcode": "الرمز البريدي",
"country_code": "الدولة (رمز ISO)",
"card_mada_visa_master": "بطاقة — مدى / فيزا / ماستركارد",
"fill_billing_details": "يرجى استكمال بيانات الفوترة",
"continue_to_payment": "متابعة الدفع",
"please_login_to_checkout": "يرجى تسجيل الدخول لإتمام الطلب"
```

Some of these keys may already exist (`city` is likely present). Check each before adding with:

```bash
node -e "const en=require('./src/services/locales/en.json');['billing_details','first_name','last_name','email_address','phone_number','street_address','city','state_region','postcode','country_code','card_mada_visa_master','fill_billing_details','continue_to_payment','please_login_to_checkout'].forEach(k=>console.log(k.padEnd(26), JSON.stringify(en[k])))"
```

Keep any existing value; only add the keys that print `undefined`. As of writing, `city` (`"City"`), `email_address` (`"Email Address"`) and `phone_number` (`"Phone Number"`) already exist — the rest do not.

- [ ] **Step 2: Create BillingDetailsForm**

Create `src/components/molecules/BillingDetailsForm.tsx`:

```tsx
import React, { useCallback } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../../styles/colors';
import type { BillingDetails } from '../../types/payment.types';

interface BillingDetailsFormProps {
  value: BillingDetails;
  onChange: (next: BillingDetails) => void;
  invalidFields?: (keyof BillingDetails)[];
}

type FieldConfig = {
  key: keyof BillingDetails;
  label: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'words' | 'characters';
  maxLength?: number;
  half?: boolean;
};

const FIELDS: FieldConfig[] = [
  { key: 'first_name', label: 'first_name', autoCapitalize: 'words', half: true },
  { key: 'last_name', label: 'last_name', autoCapitalize: 'words', half: true },
  {
    key: 'email',
    label: 'email_address',
    keyboardType: 'email-address',
    autoCapitalize: 'none',
  },
  { key: 'phone', label: 'phone_number', keyboardType: 'phone-pad' },
  { key: 'billing_street1', label: 'street_address' },
  { key: 'billing_city', label: 'city', half: true },
  { key: 'billing_state', label: 'state_region', half: true },
  { key: 'billing_postcode', label: 'postcode', half: true },
  {
    key: 'billing_country',
    label: 'country_code',
    autoCapitalize: 'characters',
    maxLength: 2,
    half: true,
  },
];

export function BillingDetailsForm({
  value,
  onChange,
  invalidFields = [],
}: BillingDetailsFormProps) {
  const { t } = useTranslation();

  const setField = useCallback(
    (key: keyof BillingDetails, text: string) =>
      onChange({ ...value, [key]: text }),
    [value, onChange],
  );

  const rows: FieldConfig[][] = [];
  FIELDS.forEach(field => {
    const last = rows[rows.length - 1];
    if (field.half && last && last.length === 1 && last[0].half) {
      last.push(field);
    } else {
      rows.push([field]);
    }
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('billing_details')}</Text>

      {rows.map((row, index) => (
        <View key={index} style={styles.row}>
          {row.map(field => (
            <View
              key={field.key}
              style={[styles.group, field.half && styles.half]}
            >
              <Text style={styles.label}>{t(field.label)}</Text>
              <TextInput
                style={[
                  styles.input,
                  invalidFields.includes(field.key) && styles.inputError,
                ]}
                value={value[field.key]}
                onChangeText={text => setField(field.key, text)}
                placeholder={t(field.label)}
                placeholderTextColor="#9ca3af"
                keyboardType={field.keyboardType ?? 'default'}
                autoCapitalize={field.autoCapitalize ?? 'sentences'}
                maxLength={field.maxLength}
                autoCorrect={false}
              />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  row: { flexDirection: 'row', gap: 8 },
  group: { marginBottom: 12, flex: 1 },
  half: { flex: 1 },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.gray,
  },
  inputError: { borderColor: colors.red },
});
```

- [ ] **Step 3: Export it**

Add to `src/components/molecules/index.ts`, after the `PaymentMethod` export:

```ts
export * from './BillingDetailsForm';
```

- [ ] **Step 4: Add the `variant` prop to PaymentMethod**

In `src/components/molecules/PaymentMethod.tsx`:

Add to `PaymentMethodProps` (inside the interface, near `compact`):

```ts
  /**
   * 'full' (default) renders every method and the inline card form.
   * 'card-only' renders a single non-interactive card row — used by HyperPay
   * checkout, where card entry happens inside the HyperPay widget.
   */
  variant?: 'full' | 'card-only';
```

Add `variant = 'full',` to the destructured parameter list, next to `compact = false,`.

Then replace the JSX from the `{/* One-time Payment Section */}` comment through the closing `)}` of the installment block with:

```tsx
      {/* One-time Payment Section */}
      <Text style={styles.sectionLabel}>{t('one_time_payment')}</Text>

      {variant === 'card-only' ? (
        <View style={[styles.paymentOption, styles.paymentOptionSelected]}>
          <View style={styles.paymentLeft}>
            <View style={styles.radioOuter}>
              <View style={styles.radioInner} />
            </View>
            <Text style={styles.paymentLabel}>
              {t('card_mada_visa_master')}
            </Text>
          </View>
          <MastercardSvg />
        </View>
      ) : (
        <>
          <PaymentOption
            id="credit"
            label={t('credit_debit_card')}
            logo={<MastercardSvg />}
            isSelected={selectedPayment === 'credit'}
            onSelect={handlePaymentSelect}
          />

          {selectedPayment === 'credit' && (
            <CardDetailsForm
              cardholderName={cardholderName}
              cardNumber={cardNumber}
              expiryDate={expiryDate}
              cvv={cvv}
              onCardholderNameChange={handleCardholderNameChange}
              onCardNumberChange={handleCardNumberChange}
              onExpiryDateChange={handleExpiryDateChange}
              onCvvChange={handleCvvChange}
              t={t}
            />
          )}

          <PaymentOption
            id="applepay"
            label={t('apple_pay')}
            logo={<ApplePaySvg />}
            isSelected={selectedPayment === 'applepay'}
            onSelect={handlePaymentSelect}
          />

          <PaymentOption
            id="stc"
            label={t('stc_pay')}
            logo={<StcPaySvg />}
            isSelected={selectedPayment === 'stc'}
            onSelect={handlePaymentSelect}
          />

          {installmentMethods.length > 0 && (
            <View style={styles.installmentSection}>
              <Text style={styles.installmentLabel}>
                {t('pay_in_installments')}
              </Text>
              {installmentMethods.map(method => (
                <PaymentOption
                  key={method.id}
                  id={method.id}
                  label={method.label}
                  logo={method.logo}
                  isSelected={selectedPayment === method.id}
                  onSelect={handlePaymentSelect}
                />
              ))}
            </View>
          )}
        </>
      )}
```

Everything above that comment (the royalty points section) and the coupon section below it stay exactly as they are.

- [ ] **Step 5: Confirm ConsultationPayment is untouched**

Run: `git diff --name-only`
Expected: `src/screens/ManageClinic/ConsulationPayment/index.tsx` must NOT appear. If it does, revert that file.

- [ ] **Step 6: Lint**

Run: `npx eslint src/components/molecules/BillingDetailsForm.tsx src/components/molecules/PaymentMethod.tsx src/components/molecules/index.ts`
Expected: exit 0.

- [ ] **Step 7: Commit**

```bash
git add src/components/molecules src/services/locales
git commit -m "feat: add billing details form and card-only payment variant"
```

---

## Task 9: Rewire the Checkout screen

**Files:**
- Modify: `src/screens/ManageClinic/Checkout/index.tsx`

**Interfaces:**
- Consumes: `prepareCartCheckout` (Task 2), `buildBillingPrefill` / `validateBilling` / `loadCachedBilling` / `saveCachedBilling` / `EMPTY_BILLING` (Task 3), `BillingDetailsForm` (Task 8), `PaymentMethod variant="card-only"` (Task 8), route `PaymentWebView` (Task 7).
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Remove the card-capture code**

In `src/screens/ManageClinic/Checkout/index.tsx`, delete:

- the `cardDetails` state declaration (currently lines 65-70)
- the `selectedPayment` state (line 64) and the `allPaymentMethods` array (lines 76-97) — both become dead
- the `installmentPaymentMethods` variable (lines 351-353) — already unused
- the entire `parseExpiryDate` function (lines 187-200)
- the now-unused SVG imports on line 16-17 (`ApplePaySvg`, `StcPaySvg`, `TabbySvg`, `TamaraSvg`, `MasterCardSvg`)

Keep everything to do with services, totals, tax, campaign discount and loyalty redemption — that logic is unchanged.

- [ ] **Step 2: Add the new imports and billing state**

Add these imports:

```tsx
import { PaymentMethod, SuccessMessageModal, BillingDetailsForm } from '@components/molecules';
import { prepareCartCheckout } from '@services/payments/hyperpayService';
import {
  EMPTY_BILLING,
  buildBillingPrefill,
  loadCachedBilling,
  saveCachedBilling,
  validateBilling,
} from '@utils/billingDetails';
import type { BillingDetails } from '../../../types/payment.types';
```

(The `PaymentMethod, SuccessMessageModal` import on line 20 is replaced by the line above.)

Add alongside the other `useState` calls:

```tsx
  const [billing, setBilling] = useState<BillingDetails>(EMPTY_BILLING);
  const [invalidFields, setInvalidFields] = useState<(keyof BillingDetails)[]>([]);
```

Add this effect after the existing `fetchProfile` effect:

```tsx
  // Prefill billing once the profile is available: profile owns identity
  // fields, the cache owns the address.
  useEffect(() => {
    let cancelled = false;

    loadCachedBilling().then(cached => {
      if (!cancelled) setBilling(buildBillingPrefill(profileData, cached));
    });

    return () => {
      cancelled = true;
    };
  }, [profileData]);
```

- [ ] **Step 3: Replace handleProceedToPayment**

Replace the whole `handleProceedToPayment` function (currently lines 202-328) with:

```tsx
  const handleProceedToPayment = async () => {
    const token = useAuthStore.getState().auth?.token;
    if (!token) {
      Toast.error(t('please_login_to_checkout') || 'Please login to proceed with checkout');
      return;
    }

    const invalid = validateBilling(billing);
    if (invalid.length > 0) {
      setInvalidFields(invalid);
      Toast.error(t('fill_billing_details'));
      return;
    }
    setInvalidFields([]);

    if (insufficientCoins) {
      Toast.error(t('insufficient_coins') || 'Insufficient coins');
      return;
    }

    if (redemptionCoinsInput > maxRedeemableCoins) {
      Toast.error(
        t('redeem_exceeds_total') || 'Redeem amount exceeds remaining payable total',
      );
      return;
    }

    setLoading(true);

    try {
      await saveCachedBilling(billing);

      // The amount is computed server-side from the cart. `total` on this
      // screen is a preview only and is deliberately not sent.
      const checkout = await prepareCartCheckout({
        purpose: 'cart',
        redeem_points: appliedCoins,
        ...billing,
        billing_country: billing.billing_country.toUpperCase(),
      });

      setLoading(false);
      navigation.navigate('PaymentWebView', {
        paymentUrl: checkout.payment_url,
        paymentId: checkout.payment_id,
      });
    } catch (error: any) {
      setLoading(false);
      console.error('[Checkout] prepare failed', error);

      if (error?.status === 401) {
        Toast.error('Session expired. Please login again.');
        try {
          await apiClient.post(API.AUTH.LOGOUT);
        } catch (logoutError) {
          console.log('Logout API error:', logoutError);
        } finally {
          useAuthStore.getState().logout();
          navigation.replace('Auth', { screen: 'SignIn' });
        }
        return;
      }

      if (error?.status === 422) {
        Toast.error(error?.message || t('payment_failed_Description'));
        return;
      }

      setShowErrorModal(true);
    }
  };
```

Note `redeem_points: appliedCoins` — `appliedCoins` is the already-clamped value computed on line 146, not the raw text input.

- [ ] **Step 4: Swap the payment UI**

Replace the `<PaymentMethod ... />` block (currently lines 460-493) with:

```tsx
        <PaymentMethod
          variant="card-only"
          showTitle={true}
          compact={true}
          showRoyaltyPoints={true}
          royaltyPoints={clinicLoyaltyPoints}
          pointsToRedeem={redeemPoints}
          onPointsToRedeemChange={handlePointsToRedeemChange}
          coinToSar={COIN_TO_SAR}
          maxRedemptionSAR={maxRedemptionSAR}
        />

        <BillingDetailsForm
          value={billing}
          onChange={setBilling}
          invalidFields={invalidFields}
        />
```

- [ ] **Step 5: Update the button label and disabled state**

Change the proceed button's text (line 580-582) to:

```tsx
          <Text style={styles.proceedButtonText}>
            {t('continue_to_payment')}
          </Text>
```

The button already has `disabled={loading}` — leave it; that is the double-tap guard.

- [ ] **Step 6: Remove the now-dead success modal**

The first `SuccessMessageModal` (lines 586-599) and `HandleRequest` (lines 329-335) fired on a completed charge. That now happens on `PaymentStatus`. Delete both. Keep the second `SuccessMessageModal` used for `showErrorModal` (lines 601-608) — it is still the generic prepare-failure dialog.

Also remove the now-unused `showSuccessModal` state, and the `clearCart` / `triggerRefresh` / `refreshProfile` calls that were tied to it — cart clearing now belongs to `PaymentStatus` alone. If `useCart` / `useCartCountContext` imports become unused, delete them too.

- [ ] **Step 7: Verify lint passes with no unused symbols**

Run: `npx eslint src/screens/ManageClinic/Checkout/index.tsx`
Expected: exit 0. Any `no-unused-vars` error means a leftover from steps 1 or 6 — remove it rather than suppressing it.

- [ ] **Step 8: Confirm no raw card capture remains on this screen**

Run:

```bash
grep -niE "cardNumber|cvv|cvc|expiryDate|cardholder|stripe" src/screens/ManageClinic/Checkout/index.tsx
```

Expected: no output. Any hit is leftover card-capture code.

- [ ] **Step 9: Re-run every unit test added by this plan**

Run:

```bash
npx jest src/services/payments src/utils/__tests__/billingDetails.test.ts src/screens/Comman
```

Expected: 4 suites passed, 47 tests passed (7 service + 19 billing + 13 URL + 8 outcome). (Do not run bare `npx jest` — see Global Constraints.)

- [ ] **Step 10: Commit**

```bash
git add src/screens/ManageClinic/Checkout/index.tsx
git commit -m "feat: route cart checkout through HyperPay"
```

---

## Task 10: Build verification and manual test handover

**Files:** none — verification only.

- [ ] **Step 1: Verify the bundle builds**

Run:

```bash
npx react-native bundle --platform ios --dev false --entry-file index.js --bundle-output /dev/null --reset-cache
```

Expected: `Writing bundle output to: /dev/null` and no module-resolution errors. This catches a broken import that per-file linting misses.

- [ ] **Step 2: Build and run the native app**

`react-native-webview` requires a native rebuild — Metro reload is not enough.

```bash
npm run ios
```

and

```bash
npm run android
```

Expected: both build and launch. If either fails, fix it before handing over; a JS-only verification is not sufficient for this feature.

> **iOS is blocked by a pre-existing repo condition.** `xcodebuild` exits 65 with
> `Signing for "Telehealth" requires a development team` before compiling a
> single file (`DEVELOPMENT_TEAM` is absent from
> `ios/Telehealth.xcodeproj/project.pbxproj`). This reproduces on `main`
> without any of this work, and fixing it requires an Apple developer team ID
> that only the project owner has. Set the team in Xcode →
> Signing & Capabilities, then re-run `npm run ios` to complete this step.
>
> Note `npm run ios | tail` reports exit code 0 because the pipeline's status
> is `tail`'s. Check the log text, not the exit code.

- [ ] **Step 3: Write the manual test checklist**

Create `docs/superpowers/plans/2026-08-09-hyperpay-manual-test-checklist.md` with the content below, then commit it.

```markdown
# HyperPay Manual Test Checklist

Requires: backend with `HYPERPAY_MODE=test`, valid `HYPERPAY_ACCESS_TOKEN` /
`HYPERPAY_ENTITY_ID`, and `APP_URL` set to a host the test device can reach
(a localhost APP_URL will NOT work from a physical phone).

Backend-side seed data, from `HyperPay.postman_collection.json`:
patient `hyperpay.fake.patient@vena.test` / `password`, and `service_id` 53 is
a known-good cart item. Running the collection's `A0 → A4` requests first
confirms the backend half works before you blame the app.

Note the collection's `A0` test tolerates a `multiple clinics` rejection — the
cart refuses services from more than one clinic, so clear the cart between
runs rather than stacking items.

Test cards (amounts ending `.00` on the test server):

| Result | Brand | Number | Expiry | CVV |
|---|---|---|---|---|
| Success | Visa | 4012000033330026 | 01/39 | 100 |
| Success | Mastercard | 5123450000000008 | 01/39 | 100 |
| Fail | Mastercard | 5204730000002514 | 01/39 | 251 |
| Success | MADA | 4464040000000007 | 11/26 | 850 |

Run each on **iOS and Android**, and the billing form once in **English and Arabic**.

- [ ] Empty cart → Proceed shows the server's 422 message, stays on Checkout
- [ ] Billing form prefills name/email/phone from profile on first visit
- [ ] Submitting with a blank required field highlights it and blocks
- [ ] Address fields are remembered on the next checkout; a changed profile email is NOT overridden by the cache
- [ ] Visa success → widget → success screen shows charged amount + reference
- [ ] Cart is empty and the cart badge is cleared after success
- [ ] Loyalty balance refreshed after a redemption purchase
- [ ] Mastercard failure → declined screen, Try Again returns to Checkout, cart intact
- [ ] MADA success (confirm MADA appears first in the widget)
- [ ] Amount charged on the success screen matches the total shown on Checkout — report any mismatch, it indicates a backend/client calculation divergence
- [ ] Close the WebView mid-payment → confirm dialog → Leave → status screen polls, does not silently return to Checkout
- [ ] Android hardware back inside the WebView triggers the same confirm dialog
- [ ] Airplane mode during polling → keeps retrying, then lands on "still processing", never on "declined"
- [ ] Background the app during 3DS, return → payment completes and status resolves
- [ ] Token expiry during payment: the status screen settles to "still processing" rather than spinning for 30s (the global 401 interceptor logs the session out — confirm the payment still lands in history afterwards)
- [ ] Swipe-back / hardware-back is blocked on the status screen while confirming
- [ ] Arabic: billing labels, status copy and the `12.34 ر.س` amount format all render RTL correctly
- [ ] Confirm each test payment appears in the gate2play dashboard
```

- [ ] **Step 4: Commit the checklist**

```bash
git add docs/superpowers/plans/2026-08-09-hyperpay-manual-test-checklist.md
git commit -m "docs: add HyperPay manual test checklist"
```

- [ ] **Step 5: Report honestly**

State plainly which steps were verified and which were not. In particular, if the manual checklist was not executed (it needs a device plus HyperPay test credentials), say so — do not describe the feature as tested end-to-end on the strength of unit tests alone.
