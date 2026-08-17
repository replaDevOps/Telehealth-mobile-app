import {
  nearbyView,
  coordsForNearby,
  DEFAULT_COORDS,
} from '../mapState';

describe('nearbyView', () => {
  it('shows the map once a position is known', () => {
    expect(
      nearbyView({
        permissionStatus: 'granted',
        locationLoading: false,
        hasLocation: true,
      }),
    ).toBe('map');
  });

  it('spins only while the first lookup is still in flight', () => {
    expect(
      nearbyView({
        permissionStatus: 'unknown',
        locationLoading: true,
        hasLocation: false,
      }),
    ).toBe('locating');
  });

  it('points a refused user at Settings rather than a map', () => {
    expect(
      nearbyView({
        permissionStatus: 'denied',
        locationLoading: false,
        hasLocation: false,
      }),
    ).toBe('permission-notice');
  });

  // This is the regression the whole file exists for. The screen previously
  // gated the map on booleans that a never-fired iOS callback left true
  // forever, so it sat on "Getting your location..." and never showed a map.
  it('still shows the map when the lookup settles with no position', () => {
    expect(
      nearbyView({
        permissionStatus: 'granted',
        locationLoading: false,
        hasLocation: false,
      }),
    ).toBe('map');
  });

  it('refreshes under the map instead of hiding it', () => {
    // A background refresh with coordinates already on screen must not throw
    // the user back to a spinner.
    expect(
      nearbyView({
        permissionStatus: 'granted',
        locationLoading: true,
        hasLocation: true,
      }),
    ).toBe('map');
  });

  it('prefers the denial notice over a spinner while re-checking', () => {
    expect(
      nearbyView({
        permissionStatus: 'denied',
        locationLoading: true,
        hasLocation: false,
      }),
    ).toBe('permission-notice');
  });
});

describe('coordsForNearby', () => {
  it('uses the real position when there is one', () => {
    expect(coordsForNearby({ lat: 37.7749, long: -122.4194 })).toEqual({
      lat: 37.7749,
      long: -122.4194,
    });
  });

  it('falls back to the default region when there is none', () => {
    expect(coordsForNearby(null)).toEqual(DEFAULT_COORDS);
    expect(coordsForNearby(undefined)).toEqual(DEFAULT_COORDS);
  });

  it('rejects non-finite coordinates rather than centring on NaN', () => {
    // A NaN region makes react-native-maps render nothing at all, which is
    // the same blank screen this fix is meant to remove.
    expect(coordsForNearby({ lat: NaN, long: 12 })).toEqual(DEFAULT_COORDS);
    expect(coordsForNearby({ lat: 12, long: Infinity })).toEqual(DEFAULT_COORDS);
  });

  it('keeps a legitimate zero coordinate', () => {
    expect(coordsForNearby({ lat: 0, long: 0 })).toEqual({ lat: 0, long: 0 });
  });
});
