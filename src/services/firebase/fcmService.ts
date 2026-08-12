import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';
import { apiClient } from '@services/api/api-client';
import { API } from '@services/api/api-endpoint';

const TAG = '[FCM]';

/**
 * Request notification permissions (iOS requires explicit request; Android 13+ requires it too)
 */
async function requestPermission(): Promise<boolean> {
  console.log(`${TAG} Requesting notification permission... (platform: ${Platform.OS})`);

  if (Platform.OS === 'ios') {
    const authStatus = await messaging().requestPermission();
    const granted =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    console.log(`${TAG} iOS permission status: ${authStatus} → ${granted ? '✅ granted' : '❌ denied'}`);
    return granted;
  }

  if (Platform.OS === 'android' && Platform.Version >= 33) {
    console.log(`${TAG} Android 13+ — requesting POST_NOTIFICATIONS permission`);
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
    console.log(`${TAG} Android permission result: ${granted} → ${isGranted ? '✅ granted' : '❌ denied'}`);
    return isGranted;
  }

  console.log(`${TAG} Permission auto-granted (Android < 13)`);
  return true;
}

/**
 * Get the current FCM token. Returns null if permission was denied.
 */
async function getFcmToken(): Promise<string | null> {
  try {
    console.log(`${TAG} ── getFcmToken() started`);
    const hasPermission = await requestPermission();
    if (!hasPermission) {
      console.warn(`${TAG} ❌ Notification permission denied — cannot get FCM token`);
      return null;
    }

    // iOS refuses getToken() until the device has an APNs registration. This is
    // a no-op on Android and cheap to re-check, so guard rather than assume.
    if (Platform.OS === 'ios' && !messaging().isDeviceRegisteredForRemoteMessages) {
      console.log(`${TAG} Registering device for remote messages (iOS)...`);
      await messaging().registerDeviceForRemoteMessages();
    }

    console.log(`${TAG} Fetching FCM token from Firebase...`);
    const token = await messaging().getToken();
    console.log(`${TAG} ✅ FCM token retrieved successfully`);
    console.log(`${TAG} Token: ${token}`);
    return token;
  } catch (error) {
    console.error(`${TAG} ❌ Failed to get FCM token:`, error);
    return null;
  }
}

/**
 * Send the FCM token to the backend. Safe to call even if token is null.
 */
async function storeFcmToken(token: string): Promise<void> {
  try {
    console.log(`${TAG} Storing FCM token on backend...`);
    await apiClient.post(API.SETTINGS.STORE_FCM_TOKEN, { fcmToken: token });
    console.log(`${TAG} ✅ FCM token stored on backend successfully`);
  } catch (error) {
    console.warn(`${TAG} ❌ Failed to store FCM token on backend:`, error);
  }
}

/**
 * Call after login or on app launch (when authenticated):
 *  1. Gets FCM token
 *  2. Stores it on the backend
 *  3. Listens for token refresh and re-stores automatically
 */
async function initializeFcm(): Promise<void> {
  console.log(`${TAG} ══════════════════════════════`);
  console.log(`${TAG} initializeFcm() — starting`);
  console.log(`${TAG} ══════════════════════════════`);

  const token = await getFcmToken();
  if (token) {
    await storeFcmToken(token);
    console.log(`${TAG} ✅ Firebase FCM fully initialized`);
  } else {
    console.warn(`${TAG} ⚠️  FCM initialized but no token available (permission denied or error)`);
  }

  // Listen for token refresh (e.g., app reinstall, token expiry)
  messaging().onTokenRefresh(async newToken => {
    console.log(`${TAG} 🔄 Token refreshed — storing new token`);
    await storeFcmToken(newToken);
  });
}

/**
 * Register a handler for notifications received while app is in the FOREGROUND.
 * Returns unsubscribe function — call it on component unmount.
 */
function onForegroundMessage(
  handler: (notification: { title?: string; body?: string; data?: Record<string, string> }) => void,
): () => void {
  return messaging().onMessage(async remoteMessage => {
    console.log('[FCM] Foreground message:', remoteMessage);
    handler({
      title: remoteMessage.notification?.title,
      body: remoteMessage.notification?.body,
      data: remoteMessage.data as Record<string, string>,
    });
  });
}

/**
 * Register a handler for notifications that open the app from BACKGROUND state.
 * Call this once at app startup.
 */
function onBackgroundOpenedMessage(
  handler: (data: Record<string, string>) => void,
): void {
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('[FCM] App opened from background by notification:', remoteMessage);
    if (remoteMessage.data) {
      handler(remoteMessage.data as Record<string, string>);
    }
  });
}

/**
 * Check if the app was launched from a QUIT state via a notification tap.
 * Call this once at app startup.
 */
async function getInitialNotification(): Promise<Record<string, string> | null> {
  const remoteMessage = await messaging().getInitialNotification();
  if (remoteMessage) {
    console.log('[FCM] App opened from quit state by notification:', remoteMessage);
    return (remoteMessage.data as Record<string, string>) ?? null;
  }
  return null;
}

export const fcmService = {
  initializeFcm,
  onForegroundMessage,
  onBackgroundOpenedMessage,
  getInitialNotification,
};
