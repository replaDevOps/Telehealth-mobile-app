import {
  classifyHyperPayUrl,
  isTerminalUrlKind,
  isPaymentAttemptNavigation,
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

describe('isPaymentAttemptNavigation', () => {
  const WIDGET = 'https://backend.vena-app.com/payments/hyperpay/pay/abc123';

  it('does not count sitting on the page the widget opened on', () => {
    expect(isPaymentAttemptNavigation(WIDGET, WIDGET)).toBe(false);
  });

  // The widget rewrites its own query string as the user fills the form; that
  // is typing, not submitting, and must not strand them on the status screen.
  it('does not count query-string churn on the same page', () => {
    expect(
      isPaymentAttemptNavigation(`${WIDGET}?brand=VISA&step=2`, WIDGET),
    ).toBe(false);
    expect(isPaymentAttemptNavigation(`${WIDGET}#card`, WIDGET)).toBe(false);
    expect(isPaymentAttemptNavigation(`${WIDGET}/`, WIDGET)).toBe(false);
  });

  it('ignores the WebView\'s own setup navigations', () => {
    expect(isPaymentAttemptNavigation('about:blank', WIDGET)).toBe(false);
    expect(isPaymentAttemptNavigation('', WIDGET)).toBe(false);
    expect(isPaymentAttemptNavigation('data:text/html,<p>x', WIDGET)).toBe(false);
  });

  it('counts submission to our result endpoint', () => {
    expect(
      isPaymentAttemptNavigation(
        'https://backend.vena-app.com/payments/hyperpay/result/abc123',
        WIDGET,
      ),
    ).toBe(true);
  });

  it('counts a 3DS hand-off to an issuing bank', () => {
    expect(
      isPaymentAttemptNavigation('https://acs.some-bank.com/3ds/challenge', WIDGET),
    ).toBe(true);
  });

  it('counts the terminal outcome pages', () => {
    for (const path of ['success', 'pending', 'failed']) {
      expect(
        isPaymentAttemptNavigation(
          `https://backend.vena-app.com/payments/hyperpay/${path}`,
          WIDGET,
        ),
      ).toBe(true);
    }
  });

  // Better to show a confirmation the user did not need than to walk away from
  // a payment that may have been taken.
  it('assumes an attempt when a url cannot be parsed', () => {
    expect(isPaymentAttemptNavigation('not-a-url', WIDGET)).toBe(true);
    expect(isPaymentAttemptNavigation(WIDGET, 'not-a-url')).toBe(true);
  });
});
