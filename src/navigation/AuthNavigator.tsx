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

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  LanguageSelection: undefined;
  Onboarding: undefined;
  OTPScreen: { email?: string };
  CreatePassword: undefined;
  Profile: undefined;
  ForgetPassword: undefined;
  SetPassword: undefined;
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
      <Stack.Screen name="ForgetPassword" component={ForgetPasswordScreen} />
      <Stack.Screen name="SetPassword" component={SetPassword} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
