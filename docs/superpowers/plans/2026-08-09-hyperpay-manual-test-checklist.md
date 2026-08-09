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
- [ ] Amount charged on the success screen matches the total shown on Checkout — report any mismatch, it indicates a backend/client calculation divergence (the app logs `[PaymentStatus] amount mismatch` to the console when this happens)
- [ ] Close the WebView mid-payment → confirm dialog → Leave → status screen polls, does not silently return to Checkout
- [ ] Android hardware back inside the WebView triggers the same confirm dialog
- [ ] Airplane mode during polling → keeps retrying, then lands on "still processing", never on "declined"
- [ ] Background the app during 3DS, return → payment completes and status resolves
- [ ] Token expiry during payment: the status screen settles to "still processing" rather than spinning for 30s (the global 401 interceptor logs the session out — confirm the payment still lands in history afterwards)
- [ ] Swipe-back / hardware-back is blocked on the status screen while confirming
- [ ] Arabic: billing labels, status copy and the `12.34 ر.س` amount format all render RTL correctly
- [ ] Confirm each test payment appears in the gate2play dashboard

## Regression checks (things this change touched)

- [ ] Instant consultation payment still shows its own card form and books normally — `ConsultationPayment` was deliberately left on the old flow
- [ ] Checkout totals (subtotal, campaign discount, 15% tax for non-Saudi users, loyalty redemption) are unchanged from before
