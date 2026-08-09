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
