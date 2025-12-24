import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import AppNavigator from './src/navigation/root-navigation';
import { setGlobalFont } from './src/utils/overrideText';
import { CartProvider } from '@context/CartContext';
import { CartCountProvider } from '@context/CartCountContext';
import './src/services/i18n';
import { Provider as PaperProvider } from 'react-native-paper';
import ToastManager from 'toastify-react-native';

setGlobalFont();

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
            <AppNavigator />
          </CartCountProvider>
        </CartProvider>
      </PaperProvider>
      <ToastManager
        showProgressBar={false}
        duration={1500}
      />
    </SafeAreaProvider>
  );
};

export default App;
