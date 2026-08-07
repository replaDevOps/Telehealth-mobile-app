import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  NumberVerification,
  CreatePassword,
  ProfileScreen,
  SetPassword,
  ForgetPasswordScreen,
  LanguageScreen,
  OnboardingScreen,
  SignInScreen,
  SignUpScreen,
} from '@screens';
import { PolicyScreen } from '@screens/Comman';

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  LanguageSelection: undefined;
  Onboarding: undefined;
  CreatePassword: {
    email?: string;
    phone?: string;
    countryCode?: string;
  };
  Profile: {
    email?: string;
    phone?: string;
    countryCode?: string;
    name?: string;
  };
  ForgetPassword: undefined;
  SetPassword: {
    token?: string;
  };
  OTPScreen: {
    source: 'forgotPassword' | 'signUp';
    method: 'email' | 'phone';
    email?: string;
    phone?: string;
    countryCode?: string;
  };
  PolicyScreen: { type: 'privacy' | 'terms' };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="SignIn"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="LanguageSelection" component={LanguageScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="OTPScreen" component={NumberVerification} />
      <Stack.Screen name="CreatePassword" component={CreatePassword} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="ForgetPassword" component={ForgetPasswordScreen} />
      <Stack.Screen name="SetPassword" component={SetPassword} />
      <Stack.Screen name="PolicyScreen" component={PolicyScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
