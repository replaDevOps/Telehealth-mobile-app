import React from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar, StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/root-navigation';
import { colors } from './src/styles/colors';
import { setGlobalFont } from './src/utils/overrideText';
import { CartProvider } from '@context/CartContext';

setGlobalFont();

const App = () => {
  return (
    <SafeAreaProvider>
      <StatusBar
        backgroundColor="transparent"
        translucent={false}
        barStyle="dark-content"
      />
      {/* <SafeAreaView style={styles.safeArea}> */}

      <CartProvider>
        <AppNavigator />
      </CartProvider>

      {/* </SafeAreaView> */}
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
});

export default App;
