import { shouldReuseCoords, COORDS_TTL_MS } from '../locationCache';

const NOW = 1_700_000_000_000;

describe('shouldReuseCoords', () => {
  it('reuses a fix taken moments ago', () => {
    expect(
      shouldReuseCoords({ hasCoords: true, coordsAt: NOW - 1000, now: NOW }),
    ).toBe(true);
  });

  it('re-reads once the fix ages past the TTL', () => {
    expect(
      shouldReuseCoords({
        hasCoords: true,
        coordsAt: NOW - COORDS_TTL_MS - 1,
        now: NOW,
      }),
    ).toBe(false);
  });

  it('treats the TTL boundary as stale', () => {
    expect(
      shouldReuseCoords({
        hasCoords: true,
        coordsAt: NOW - COORDS_TTL_MS,
        now: NOW,
      }),
    ).toBe(false);
  });

  it('never reuses when there is no stored fix', () => {
    expect(shouldReuseCoords({ hasCoords: false, coordsAt: NOW, now: NOW })).toBe(false);
    expect(shouldReuseCoords({ hasCoords: true, coordsAt: null, now: NOW })).toBe(false);
  });

  it('always re-reads when the caller forces it', () => {
    expect(
      shouldReuseCoords({
        hasCoords: true,
        coordsAt: NOW - 1000,
        now: NOW,
        force: true,
      }),
    ).toBe(false);
  });

  // A device whose clock moved backwards (manual change, timezone sync) leaves a
  // timestamp in the future. Trusting it would pin a stale fix indefinitely.
  it('re-reads when the stored timestamp is in the future', () => {
    expect(
      shouldReuseCoords({ hasCoords: true, coordsAt: NOW + 60_000, now: NOW }),
    ).toBe(false);
  });

  it('honours a caller-supplied TTL', () => {
    expect(
      shouldReuseCoords({
        hasCoords: true,
        coordsAt: NOW - 5000,
        now: NOW,
        ttlMs: 10_000,
      }),
    ).toBe(true);
    expect(
      shouldReuseCoords({
        hasCoords: true,
        coordsAt: NOW - 5000,
        now: NOW,
        ttlMs: 1000,
      }),
    ).toBe(false);
  });
});
