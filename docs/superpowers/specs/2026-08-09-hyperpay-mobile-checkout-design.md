# HyperPay Cart Checkout — Mobile App Design

**Date:** 2026-08-09
**Status:** Approved, ready for implementation planning
**Backend reference:** `HyperPay_API_Guide_Vena_Backend.pdf` (Vena Laravel backend, already shipped)

## Goal

Replace the app's in-app card capture on the cart checkout screen with HyperPay
COPYandPAY, hosted in an in-app WebView, and confirm the result by polling the
backend's payment status endpoint.

## Scope

In scope:

- Patient cart checkout only (`purpose=cart`).
- Card brands MADA, Visa, Mastercard — whatever the HyperPay widget renders.

Out of scope, deliberately:

- `purpose=subscription`. This app is patient-only; every endpoint is
  `/patient-*` and there is no client (`role=0`) surface.
- Instant consultation payment (`ConsultationPayment` →
  `/patient-consultations/bookConsultations`). The backend guide documents no
  consultation purpose. That screen keeps its current card form unchanged.
- Apple Pay, saved cards, recurring auto-deduct.
- The `/webhook`, `/form/{id}` and `/result/{id}` endpoints. These are
  server-to-server or loaded inside the WebView; the app never calls them
  directly.

## Current state

`src/screens/ManageClinic/Checkout/index.tsx` collects cardholder name, PAN,
expiry and CVV in plain `TextInput`s and POSTs them to `/checkout/checkout`
with `paymentMethod: 'stripe'`. This is removed. It is a PCI liability and
HyperPay's widget owns card entry.

`src/components/molecules/PaymentMethod.tsx` is shared with
`ConsultationPayment`, so it is extended with an optional prop rather than
rewritten.

`react-native-webview` is **not** currently a dependency, and the app has no
deep-linking configuration.

## Decisions

| Decision | Choice | Why |
|---|---|---|
| Widget host | In-app WebView | User stays in the app; the redirect to the terminal page is observable, so the result is known immediately rather than guessed after the user returns from a browser. |
| Billing data | Editable form, prefilled from profile, address cached in AsyncStorage | `/prepare` requires street/state/postcode, which the profile store does not have. Sending placeholders would ship fake data to HyperPay. Caching makes it one-time friction. |
| Result handling | Dedicated `PaymentStatus` screen that owns polling | Isolates polling from an already-large Checkout screen, survives backgrounding, and gives "paid but not fulfilled" a real screen. |
| Old stripe path | Deleted | One code path; stops raw card capture on this screen. |
| Other methods on Checkout | Hidden; one card row shown | They cannot be honoured in this phase, and the existing "only card payment is available" toast is a dead end users hit repeatedly. |

## Architecture

### New units

| Unit | Purpose | Depends on |
|---|---|---|
| `src/types/payment.types.ts` | `PreparePayload`, `PrepareResponse`, `PaymentStatusResponse`, and the `PaymentStatus` / `FulfillmentStatus` string unions | — |
| `src/services/payments/hyperpayService.ts` | `prepareCartCheckout(payload)`, `getPaymentStatus(paymentId)`. No React, no navigation. | `apiClient`, payment types |
| `src/utils/billingDetails.ts` | Prefill from profile, load/save cached address, validate required fields | `AsyncStorage`, profile store |
| `src/components/molecules/BillingDetailsForm.tsx` | Controlled billing inputs. Presentational only. | — |
| `src/screens/Comman/PaymentWebView/` (`index.tsx`, `style.ts`) | Hosts `payment_url`, detects the terminal redirect, hands off | `react-native-webview` |
| `src/screens/Comman/PaymentStatus/` (`index.tsx`, `style.ts`) | Owns polling and the four result states | `hyperpayService` |

Two pure helpers live in their own files beside the screens that consume them,
so both can be unit-tested without rendering anything:

- `src/screens/Comman/PaymentWebView/classifyHyperPayUrl.ts` —
  `classifyHyperPayUrl(url, baseUrl)` → `'success' | 'pending' | 'failed' |
  'result' | 'other'`
- `src/screens/Comman/PaymentStatus/resolvePaymentOutcome.ts` —
  `resolvePaymentOutcome(status, fulfillmentStatus)` → the four-state union

### Modified files

- `src/services/api/api-endpoint.ts` — add
  `PAYMENTS: { HYPERPAY: { PREPARE: '/payments/hyperpay/prepare', STATUS: '/payments/hyperpay/status' } }`.
  Note `BASE_URL` already ends in `/api`, so paths are relative to that.
- `src/navigation/MainNavigator.tsx` — register `PaymentWebView` and
  `PaymentStatus`, and add their entries to `MainStackParamList`.
- `src/screens/ManageClinic/Checkout/index.tsx` — card form → billing form,
  stripe call → prepare + navigate.
- `src/components/molecules/PaymentMethod.tsx` — new optional
  `variant?: 'full' | 'card-only'`, defaulting to `'full'` so
  `ConsultationPayment` behaviour is unchanged.
- `src/services/locales/en.json`, `ar.json` — new keys.

### New dependency

`react-native-webview`. Requires `pod install` and a native rebuild on both
platforms; it cannot be picked up by a Metro reload.

## Data flow

```
Checkout: tap "Continue to Payment"
  ├─ validate billing fields locally → cache them
  ├─ POST /payments/hyperpay/prepare { purpose:"cart", ...billing, redeem_points }
  └─ navigate PaymentWebView { payment_url, payment_id }

PaymentWebView
  ├─ loads the COPYandPAY widget; user pays, completes 3DS
  ├─ HyperPay redirects → GET /result/{id}?resourcePath=...
  │     This load is ALLOWED to proceed. It is the request that makes the
  │     backend verify with HyperPay and fulfil. Cancelling here would
  │     abort verification.
  └─ backend redirects → /success | /pending | /failed
        └─ intercept THAT url → navigation.replace(PaymentStatus, { payment_id })

PaymentStatus
  ├─ poll GET /payments/hyperpay/status/{payment_id}
  │    every 2s, cap 30s, paused on AppState background, re-polled on active
  └─ resolve to one of four states
```

If the user dismisses the WebView with the header close button, the app still
routes to `PaymentStatus` rather than back to Checkout. The card may already
have been charged, and only the poll can tell.

### Amount authority

The backend computes the charge from the server-side cart. Checkout computes
its own preview total (subtotal, campaign discount, 15% tax for non-Saudi
users, loyalty redemption). These are two independent calculations and could
diverge; a divergence would surface to the user as an unexpected charge.

The app cannot fix this — it is a backend contract question. What the app does:

- Treat the on-screen total as a preview.
- Display the server's `amount` from `/status` on the success state, so the
  two are reconcilable.
- `console.warn` on mismatch to make it visible during testing.

`redeem_points` is passed through to `/prepare` and applied server-side. The
local redemption math remains only to drive the preview.

## Screen behaviour

### Checkout

Clinic cards, service list, appointment summary and the totals block are
unchanged. Only the payment block changes.

- Deleted: `cardDetails` state, `parseExpiryDate`, card-number length and
  expiry-format validation, the stripe payload and the `/checkout/checkout`
  call.
- `<PaymentMethod variant="card-only">` renders the loyalty-points section
  unchanged plus a single non-interactive row, *Card — MADA / Visa /
  Mastercard*, with brand logos. Apple Pay, STC, Tabby and Tamara rows and
  the "only card payment is available" toast are gone from this screen.
- `<BillingDetailsForm>` below it: first name, last name, email, phone,
  street, city, state, postcode, country (default `SA`, ISO alpha-2).
  Prefilled from profile and the last-used cache.
- Button label becomes `continue_to_payment`. It opens HyperPay; it does not
  charge.
- Button is disabled while `preparing` so a double-tap cannot create two
  checkout ids.

Profile gives `name`, `email`, `phoneNo`, `city`. `name` is split on the first
space into first/last; a single-word name puts everything in first name and
leaves last name for the user to fill.

Prefill precedence is split by field kind, because a single global rule gets
one half wrong:

- **Identity fields** (`first_name`, `last_name`, `email`, `phone`) — profile
  wins over cache. Profile is the account of record; if the user updates their
  email, checkout must reflect it rather than replay a stale cached value.
- **Address fields** (`billing_street1`, `billing_city`, `billing_state`,
  `billing_postcode`, `billing_country`) — cache wins, falling back to profile
  `city` for `billing_city` and `SA` for `billing_country`. These do not exist
  on the profile at all, so the cache is the only memory of them.

Every field stays editable regardless of where its value came from.

### PaymentWebView

Full screen. Header with title and a close button that confirms via
`abandon_payment_confirm` before leaving.

- `javaScriptEnabled`, `domStorageEnabled`.
- Third-party cookies enabled on Android — 3DS breaks without them.
- `originWhitelist={['https://*']}`. It cannot be narrower: 3DS hands off to
  arbitrary issuing-bank domains that are unknowable in advance, and
  whitelisting only known hosts would break authentication for real cards.
  The restriction that matters is applied elsewhere — `classifyHyperPayUrl`
  only treats a URL as terminal when its origin matches `BASE_URL`, so a page
  on some other host can never drive the app to a success state.
- Loading spinner overlaid until first paint.
- A hard failure on the initial URL (`onError` / `onHttpError`) routes to
  `PaymentStatus` rather than leaving a blank screen.

### PaymentStatus

Four states, derived from `(status, fulfillment_status)`:

| State | Condition | UI |
|---|---|---|
| Confirming | polling, nothing terminal yet | Spinner, "Confirming your payment…", not dismissable |
| Success | `paid` + `fulfilled` | Success copy; clears cart, `triggerRefresh()`, `refreshProfile()`; CTA → Clinic tab |
| Processing | `paid` + `pending`/`processing`, or `status: processing`, or poll cap reached | "Payment received — we're finalising your booking." CTA → History. No pay-again button. |
| Failed | `failed` / `cancelled`, or `paid` + `fulfillment_status: failed` | Distinct copy per case. The fulfilment-failed case states the money was captured and support will resolve it, and offers no retry. Only genuine `failed` / `cancelled` offers *Try again*, returning to Checkout. |

Cart clearing happens only in the Success state and is idempotent — the screen
can be re-entered.

## Error handling

| Situation | Behaviour |
|---|---|
| `/prepare` returns 401 | Reuse Checkout's existing logout-and-redirect branch |
| `/prepare` returns 422 | Surface the server `message` (empty cart, validation failure) |
| `/prepare` returns 500 | Generic retry toast; stay on Checkout, clear nothing |
| No network at prepare | Toast; stay on Checkout |
| No network while polling | Keep retrying to the cap. A failed poll is not a failed payment. |
| App backgrounded mid-payment | OS preserves WebView state; polling pauses on `background`, re-polls immediately on `active` |
| App killed mid-payment | Payment still resolves server-side via webhook; the user sees it in History. No client-side recovery — the webhook already covers it. |
| Checkout expired (`expires_at`, 30 min) | HyperPay errors, flow lands on `failed`, which offers *Try again* |
| Double-tap Proceed | Button disabled while preparing |

## Testing

The project has no component-testing library (`jest.config.js` is just
`preset: 'react-native'`, and `__tests__/` holds only the default
`App.test.tsx`). Testing therefore targets the pure seams; the rest is
verified manually.

### Unit tests (jest)

- `classifyHyperPayUrl(url)` — success / pending / failed / result /
  unrelated, with and without query strings and trailing slashes. This is the
  highest-risk logic in the feature: a miss means the user is stranded in the
  WebView after paying.
- `resolvePaymentOutcome(status, fulfillmentStatus)` — the full four-state
  table, explicitly including `paid` + `failed`.
- `billingDetails` — name splitting (single word, multi-word, empty), prefill
  precedence (profile wins for identity fields, cache wins for address
  fields), required-field validation, cache round-trip against a mocked
  AsyncStorage.
- `hyperpayService` — request payload shape and error normalisation against a
  mocked `apiClient`.

### Manual verification

Against the HyperPay test server, using the guide's cards:

- Visa `4012000033330026` exp `01/39` cvv `100` — success
- Mastercard `5204730000002514` exp `01/39` cvv `251` — failure
- MADA `4464040000000007` exp `11/26` cvv `850` — success

Plus: dismiss mid-payment, airplane mode during polling, background/foreground
during 3DS. On both iOS and Android (Android carries the cookie/3DS quirk) and
in both EN and AR for the new strings.

This set requires a device with HyperPay test credentials configured, so it is
handed over as a checklist rather than run during implementation.

## Prerequisites owned by the backend

- `HYPERPAY_*` env vars set and `APP_URL` reachable from the test device.
  A localhost `APP_URL` will not work from a physical phone.
- The `/payments/hyperpay/prepare` and `/status/{id}` routes live and
  accepting the patient bearer token.
