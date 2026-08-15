/**
 * Freshness rules for cached coordinates.
 *
 * Splash, HomeScreen, SelectLocation, ClinicDetail and the cart all ask for the
 * user's position as they mount. `inFlightFetch` already collapses calls that
 * overlap, but sequential navigations used to trigger a fresh satellite fix
 * every time. A fix stays usable for a couple of minutes: nobody travels far
 * enough in that window to change which clinics are nearby, and reusing it
 * turns a multi-second GPS wait into no wait at all.
 */
export const COORDS_TTL_MS = 2 * 60 * 1000;

interface ReuseArgs {
  /** Whether a previous fix is available at all. */
  hasCoords: boolean;
  /** When that fix was taken (epoch ms), or null if never. */
  coordsAt: number | null;
  /** Current time (epoch ms). */
  now: number;
  /** Caller explicitly asked for a fresh read. */
  force?: boolean;
  ttlMs?: number;
}

/**
 * Whether the stored fix is good enough to skip the GPS read entirely.
 */
export function shouldReuseCoords({
  hasCoords,
  coordsAt,
  now,
  force = false,
  ttlMs = COORDS_TTL_MS,
}: ReuseArgs): boolean {
  if (force) {
    return false;
  }
  if (!hasCoords || coordsAt === null) {
    return false;
  }
  const age = now - coordsAt;
  // A clock that jumped backwards leaves a future timestamp; treat it as stale
  // rather than trusting it forever.
  if (age < 0) {
    return false;
  }
  return age < ttlMs;
}
