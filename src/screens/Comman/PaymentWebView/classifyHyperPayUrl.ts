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
