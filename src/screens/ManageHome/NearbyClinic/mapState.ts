import type { LocationPermissionStatus } from '@store/useLocationStore';

/** Riyadh. Shown when no better coordinates are available. */
export const DEFAULT_COORDS = { lat: 24.7136, long: 46.6753 };

export const DEFAULT_DELTAS = {
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export type NearbyView = 'permission-notice' | 'locating' | 'map';

/**
 * What the Nearby Clinics screen should render.
 *
 * This screen used to hold its own copy of the permission and position logic,
 * and gated the map on two booleans that a missing callback could leave true
 * forever - on iOS, Geolocation.requestAuthorization invokes neither callback
 * when the authorization status is already determined, so the screen sat on
 * "Getting your location..." and the map never mounted at all.
 *
 * The rule that prevents a repeat: the map is the default. Only a settled
 * denial or an in-flight first lookup can displace it, and neither the clinic
 * request nor anything else downstream gets a vote - a map centred on the
 * default region is always better than a spinner.
 */
export function nearbyView({
  permissionStatus,
  locationLoading,
  hasLocation,
}: {
  permissionStatus: LocationPermissionStatus;
  locationLoading: boolean;
  hasLocation: boolean;
}): NearbyView {
  // Settled and refused: no amount of waiting produces a position, so point
  // the user at Settings instead of a map they never chose.
  if (permissionStatus === 'denied') return 'permission-notice';
  // Only spin when waiting can still change the answer AND there is nothing
  // to show yet. Once any coordinates exist, a refresh happens under the map.
  if (locationLoading && !hasLocation) return 'locating';
  return 'map';
}

/**
 * Coordinates to centre the map on and query clinics for. Falls back to the
 * default region so a failed position read still yields a usable map rather
 * than an empty screen.
 */
export function coordsForNearby(
  location: { lat: number; long: number } | null | undefined,
): { lat: number; long: number } {
  if (
    !location ||
    !Number.isFinite(location.lat) ||
    !Number.isFinite(location.long)
  ) {
    return DEFAULT_COORDS;
  }
  return { lat: location.lat, long: location.long };
}
