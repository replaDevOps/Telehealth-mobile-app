import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import AppNavigator from './src/navigation/root-navigation';
import { setGlobalFont } from './src/utils/overrideText';
import { CartProvider } from '@context/CartContext';
import './src/services/i18n';
import { Provider as PaperProvider } from 'react-native-paper';

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
          <AppNavigator />
        </CartProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

export default App;
