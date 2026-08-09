import type {
  PaymentStatus,
  FulfillmentStatus,
} from '../../../types/payment.types';

export type PaymentOutcome =
  | 'confirming'
  /** paid + fulfilled — the only state that means "booked". */
  | 'success'
  /** paid, fulfilment still running. Implies the card WAS charged. */
  | 'processing'
  /** HyperPay declined, was cancelled, or the user never paid. Retryable. */
  | 'failed'
  /** Card WAS charged but the booking could not be created. Never retryable. */
  | 'fulfillment_failed'
  /**
   * We stopped waiting without a definite answer — HyperPay was still
   * processing, or we never reached the server. We cannot say whether the
   * card was charged, so we must not claim either way.
   */
  | 'unconfirmed';

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

/**
 * Decides what to show when polling gives up while still 'confirming'.
 *
 * `lastStatus` is the most recent status actually returned by the server, or
 * null if no poll ever succeeded.
 *
 * A payment still sitting at 'pending' means the user never completed the
 * widget — abandoning before entering card details is the common case — so no
 * charge exists and offering a retry is correct. Anything else is genuinely
 * unknown, and claiming "payment received" there would invent a charge we
 * cannot prove.
 */
export function resolveTimeoutOutcome(
  lastStatus: PaymentStatus | null,
): PaymentOutcome {
  if (lastStatus === 'pending') return 'failed';
  return 'unconfirmed';
}
