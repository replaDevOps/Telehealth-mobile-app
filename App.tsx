import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppState, StatusBar } from 'react-native';
import AppNavigator from './src/navigation/root-navigation';
import { setGlobalFont } from './src/utils/overrideText';
import { CartProvider } from '@context/CartContext';
import { CartCountProvider } from '@context/CartCountContext';
import { NotificationCountProvider } from '@context/NotificationCountContext';
import { Provider as PaperProvider } from 'react-native-paper';
import ToastManager from 'toastify-react-native';
import { usePusherNotifications } from './src/hooks/usePusherNotifications';
import messaging from '@react-native-firebase/messaging';
import { Toast } from 'toastify-react-native';
import { fcmService } from './src/services/firebase/fcmService';
import { useNotificationStore } from '@store/useNotificationStore';
import { useAuthStore } from '@store';

import { useTranslation } from 'react-i18next';
import { setupGlobalToast } from './src/utils';

setGlobalFont();
setupGlobalToast();

// Background / quit-state message handler — must be registered outside any component
console.log('[FCM] Registering background message handler...');
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('[FCM] ✅ Background message received:', remoteMessage);
});
console.log('[FCM] ✅ Background message handler registered');

// Pulls the unread count back in line with the server. Used whenever a push
// may have changed it: FCM delivery, a notification tap, or returning to the
// foreground (pushes delivered while backgrounded never reach a JS handler).
const syncNotificationCount = () => {
  if (!useAuthStore.getState().isAuthenticated) {
    return;
  }
  useNotificationStore
    .getState()
    .refreshNotifications()
    .catch(err => console.warn('[FCM] Notification count refresh failed:', err));
};

const AppContent = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith('ar') || i18n.language === 'ar';

  // Setup Pusher notifications
  usePusherNotifications();

  useEffect(() => {
    // Foreground notification display
    const unsubscribe = fcmService.onForegroundMessage(({ title, body }) => {
      // Move the badge immediately, then reconcile with the server's is_read
      useNotificationStore.getState().incrementUnreadCount();
      syncNotificationCount();

      if (title || body) {
        Toast.info(`${title ?? ''}\n${body ?? ''}`.trim());
      }
    });

    // App opened from background by tapping notification
    fcmService.onBackgroundOpenedMessage(data => {
      console.log('[FCM] Opened from background, data:', data);
      syncNotificationCount();
      // Add navigation logic here based on data.screen or data.type if needed
    });

    // App opened from quit state by tapping notification
    fcmService.getInitialNotification().then(data => {
      if (data) {
        console.log('[FCM] Opened from quit state, data:', data);
        syncNotificationCount();
        // Add navigation logic here based on data.screen or data.type if needed
      }
    });

    // Pushes that land while the app is backgrounded are handled by the OS, so
    // the count is stale until we come back — and the store's 2 minute cache
    // would otherwise keep it stale.
    const appStateSub = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        syncNotificationCount();
      }
    });

    return () => {
      unsubscribe();
      appStateSub.remove();
    };
  }, []);

  return (
    <>
      <AppNavigator />
      <ToastManager
        showProgressBar={false}
        duration={1500}
        isRTL={isRtl}
        minHeight={46}
        style={{ minHeight: 46, paddingVertical: 6 }}
      />
    </>
  );
};

const App = () => {
  return (
    <SafeAreaProvider>
        <StatusBar
          backgroundColor="transparent"
          translucent={false}
          barStyle="dark-content"
        />
        <PaperProvider>
          <CartProvider>
            <CartCountProvider>
              <NotificationCountProvider>
                <AppContent />
              </NotificationCountProvider>
            </CartCountProvider>
          </CartProvider>
        </PaperProvider>
    </SafeAreaProvider>
  );
};

export default App;
