import { classifyHyperPayUrl, isTerminalUrlKind } from '../classifyHyperPayUrl';

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
