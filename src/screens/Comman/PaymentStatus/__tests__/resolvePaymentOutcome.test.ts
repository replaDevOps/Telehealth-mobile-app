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
    expect(resolvePaymentOutcome('paid', 'failed')).toBe('fulfillment_failed');
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
