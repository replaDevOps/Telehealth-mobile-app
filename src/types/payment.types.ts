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
  /** Ask HyperPay to tokenise the card so it can be reused next time. */
  save_card: boolean;
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
