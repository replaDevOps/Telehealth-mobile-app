import React from 'react';
import { NavigationContainer, createNavigationContainerRef, CommonActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { SplashScreen } from '@screens';
import AuthNavigator from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
const Stack = createNativeStackNavigator<RootStackParamList>();

// Create navigation ref for programmatic navigation
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

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

// Helper to navigate to ProfileSetting inside the Setting tab without creating
// confusing back-stack behavior. Uses the root navigation ref to target the
// nested navigators: Main -> EntryPoint (tabs) -> Setting -> ProfileSetting
export function navigateToProfileSetting() {
  if (!navigationRef || !navigationRef.isReady()) return;

  navigationRef.navigate('Main' as any, {
    screen: 'EntryPoint',
    params: {
      screen: 'Setting',
      params: {
        initial: false,
        screen: 'ProfileSetting',
      },
    },
  } as any);
}
