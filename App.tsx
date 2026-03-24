import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import AppNavigator from './src/navigation/root-navigation';
import { setGlobalFont } from './src/utils/overrideText';
import { CartProvider } from '@context/CartContext';
import { CartCountProvider } from '@context/CartCountContext';
import { NotificationCountProvider } from '@context/NotificationCountContext';
import i18n from './src/services/i18n';
import { Provider as PaperProvider } from 'react-native-paper';
import ToastManager from 'toastify-react-native';
import { usePusherNotifications } from './src/hooks/usePusherNotifications';
import messaging from '@react-native-firebase/messaging';
import { Toast } from 'toastify-react-native';
import { fcmService } from './src/services/firebase/fcmService';

setGlobalFont();

// Background / quit-state message handler — must be registered outside any component
console.log('[FCM] Registering background message handler...');
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('[FCM] ✅ Background message received:', remoteMessage);
});
console.log('[FCM] ✅ Background message handler registered');

const AppContent = () => {
  // Setup Pusher notifications
  usePusherNotifications();

  useEffect(() => {
    // Foreground notification display
    const unsubscribe = fcmService.onForegroundMessage(({ title, body }) => {
      if (title || body) {
        Toast.info(`${title ?? ''}\n${body ?? ''}`.trim());
      }
    });

    // App opened from background by tapping notification
    fcmService.onBackgroundOpenedMessage(data => {
      console.log('[FCM] Opened from background, data:', data);
      // Add navigation logic here based on data.screen or data.type if needed
    });

    // App opened from quit state by tapping notification
    fcmService.getInitialNotification().then(data => {
      if (data) {
        console.log('[FCM] Opened from quit state, data:', data);
        // Add navigation logic here based on data.screen or data.type if needed
      }
    });

    return unsubscribe;
  }, []);

  return (
    <>
      <AppNavigator />
      <ToastManager
        showProgressBar={false}
        duration={1500}
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
