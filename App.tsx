import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import AppNavigator from './src/navigation/root-navigation';
import { setGlobalFont } from './src/utils/overrideText';
import { CartProvider } from '@context/CartContext';
import { CartCountProvider } from '@context/CartCountContext';
import { NotificationCountProvider } from '@context/NotificationCountContext';
import './src/services/i18n';
import { Provider as PaperProvider } from 'react-native-paper';
import ToastManager from 'toastify-react-native';
import { usePusherNotifications } from './src/hooks/usePusherNotifications';

setGlobalFont();

const AppContent = () => {
  // Setup Pusher notifications
  usePusherNotifications();

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
