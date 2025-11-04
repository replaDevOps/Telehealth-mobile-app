import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CustomTabBar from './bottomTab';
import { HomeScreen, NearbyClinics, SelectLocation } from '@screens';
import HistoryScreen from '@screens/ManageHistory';
import SettingScreen from '@screens/ManageSetting';
import {
  FilterScreen,
  ClinicDetailScreen,
  CheckoutScreen,
  CartScreen,
  ConsultationPayment,
  PrescriptionScreen,
  AudioConsultation,
  VideoConsultation,
  ChatOnboarding,
  ChatScreen,
  ClinicScreen,
} from '@screens/ManageClinic';

export type MainStackParamList = {
  Home: undefined;
  Clinic: undefined;
  History: undefined;
  Setting: undefined;
  CustomTabBar: undefined;
};

export type ClinicStackParamList = {
  ClinicScreen: undefined;
  FilterScreen: undefined;
  ClinicDetail: undefined;
  ChatOnboarding: undefined;
  ChatScreen: undefined;
  CheckoutScreen: undefined;
  CartScreen: undefined;
  ConsultationPayment: undefined;
  PrescriptionScreen: undefined;
  AudioConsultation: undefined;
  VideoConsultation: undefined;
};

const Stack = createNativeStackNavigator();
const ClinicStack = createNativeStackNavigator<ClinicStackParamList>();

export const MainNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="EntryPoint"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="EntryPoint" component={CustomTabBar} />
    </Stack.Navigator>
  );
};

export const HomeNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="NearbyClinics" component={NearbyClinics} />
      <Stack.Screen name="SelectLocation" component={SelectLocation} />
    </Stack.Navigator>
  );
};

export const ClinicNavigator = () => {
  return (
    <ClinicStack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="ClinicScreen"
    >
      <ClinicStack.Screen name="ClinicScreen" component={ClinicScreen} />
      <ClinicStack.Screen name="FilterScreen" component={FilterScreen} />
      <ClinicStack.Screen name="ClinicDetail" component={ClinicDetailScreen} />
      <ClinicStack.Screen name="ChatOnboarding" component={ChatOnboarding} />
      <ClinicStack.Screen name="ChatScreen" component={ChatScreen} />
      <ClinicStack.Screen name="CheckoutScreen" component={CheckoutScreen} />
      <ClinicStack.Screen name="CartScreen" component={CartScreen} />
      <ClinicStack.Screen
        name="ConsultationPayment"
        component={ConsultationPayment}
      />
      <ClinicStack.Screen
        name="PrescriptionScreen"
        component={PrescriptionScreen}
      />
      <ClinicStack.Screen
        name="AudioConsultation"
        component={AudioConsultation}
      />
      <ClinicStack.Screen
        name="VideoConsultation"
        component={VideoConsultation}
      />
    </ClinicStack.Navigator>
  );
};

export const HistoryNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HistoryScreen" component={HistoryScreen} />
    </Stack.Navigator>
  );
};

export const SettingNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingScreen" component={SettingScreen} />
    </Stack.Navigator>
  );
};
