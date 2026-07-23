import { Linking, Platform, Alert } from 'react-native';

/**
 * Opens app settings where the user can enable location permission for the app.
 * Works on both iOS and Android.
 */
export const openAppSettings = async (): Promise<void> => {
  try {
    await Linking.openSettings();
  } catch (err) {
    console.warn('Failed to open app settings:', err);
  }
};

/**
 * Opens location settings:
 * - Android: System location settings (where user can turn on GPS)
 * - iOS: App settings (iOS doesn't expose system location settings directly)
 */
export const openLocationSettings = async (): Promise<void> => {
  try {
    if (Platform.OS === 'android') {
      await Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS');
    } else {
      await Linking.openSettings();
    }
  } catch (err) {
    console.warn('Failed to open location settings:', err);
    await openAppSettings();
  }
};

/**
 * Geolocation error codes
 * 1 = PERMISSION_DENIED, 2 = POSITION_UNAVAILABLE, 3 = TIMEOUT
 */
const LOCATION_ERROR = {
  PERMISSION_DENIED: 1,
  POSITION_UNAVAILABLE: 2,
  TIMEOUT: 3,
} as const;

/**
 * Shows an alert offering to open settings when location permission is denied
 * or location services are not active.
 */
export const showLocationSettingsAlert = (
  options: {
    title?: string;
    message?: string;
    openLocationSettings?: boolean;
  } = {}
): void => {
  const {
    title = 'Location Required',
    message = 'Please enable location access to use this feature. Would you like to open settings?',
    openLocationSettings: useLocationSettings = false,
  } = options;

  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Open Settings',
      onPress: () =>
        useLocationSettings && Platform.OS === 'android'
          ? openLocationSettings()
          : openAppSettings(),
    },
  ]);
};

/**
 * Handles getCurrentPosition errors. Only shows "Open Settings" alert for
 * PERMISSION_DENIED (1) or POSITION_UNAVAILABLE (2). For TIMEOUT (3), silently
 * uses default - no alert, since timeout often means slow GPS, not a settings issue.
 */
export const handleLocationError = (
  error: { code?: number; message?: string },
  options: {
    title?: string;
    message?: string;
    openLocationSettings?: boolean;
  } = {}
): void => {
  const code = error?.code;
  if (code === LOCATION_ERROR.TIMEOUT) {
    return;
  }
  showLocationSettingsAlert(options);
};
