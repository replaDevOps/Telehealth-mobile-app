import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { SplashScreen } from '@screens';
import AuthNavigator from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { navigationRef } from './navigation-service';

const Stack = createNativeStackNavigator<RootStackParamList>();

// The imperative helpers live in navigation-service so that screens can import
// them without closing a require cycle back through this file. Re-exported here
// for the call sites that already import them from this path.
export {
  navigationRef,
  resetToHome,
  returnFromAuth,
  navigateToProfileSetting,
} from './navigation-service';

const AppNavigator = () => {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="Splash"
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="Main" component={MainNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
