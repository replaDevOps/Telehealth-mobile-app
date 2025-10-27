import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignInScreen from '../screens/auth/SignInScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import NumberVerification from '../screens/auth/OTPScreen';
import LanguageScreen from '../screens/auth/LanguageScreen';
import CreatePassword from '../screens/auth/CreatePasswordScreen';
import ProfileScreen from '../screens/auth/ProfileScreen';

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  LanguageSelection: undefined;
  Onboarding: undefined;
  OTPScreen: { email?: string };
  CreatePassword: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="LanguageSelection"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="LanguageSelection" component={LanguageScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="OTPScreen" component={NumberVerification} />
      <Stack.Screen name="CreatePassword" component={CreatePassword} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
