import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CustomTabBar from './bottomTab';
import { HomeScreen, NearbyClinics, SelectLocation } from '@screens';
import {
  FilterScreen,
  ClinicDetailScreen,
  CheckoutScreen,
  ConsultationPayment,
  AudioConsultation,
  VideoConsultation,
  ChatOnboarding,
  ClinicScreen,
} from '@screens/ManageClinic';
import { HistoryScreen } from '@screens/ManageHistory';
import {
  ChangePassword,
  FAQs,
  ProfileSetting,
  RefundRequest2,
  SettingScreen,
} from '@screens/ManageSetting';
import {
  CardDetails,
  ChatScreen,
  RefundRequest,
  PrescriptionScreen,
  CartScreen,
} from '@screens/Comman';

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
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="CardDetails" component={CardDetails} />
      <Stack.Screen name="Refund" component={RefundRequest} />
      <ClinicStack.Screen name="CheckoutScreen" component={CheckoutScreen} />
      <ClinicStack.Screen name="CartScreen" component={CartScreen} />
      <ClinicStack.Screen
        name="PrescriptionScreen"
        component={PrescriptionScreen}
      />
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

      <ClinicStack.Screen
        name="ConsultationPayment"
        component={ConsultationPayment}
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
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="HistoryScreen"
    >
      <Stack.Screen name="HistoryScreen" component={HistoryScreen} />
    </Stack.Navigator>
  );
};

export const SettingNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingScreen" component={SettingScreen} />
      <Stack.Screen name="ProfileSetting" component={ProfileSetting} />
      <Stack.Screen name="ChangePassword" component={ChangePassword} />
      <Stack.Screen name="FAQs" component={FAQs} />
      <Stack.Screen name="RefundRequest2" component={RefundRequest2} />
    </Stack.Navigator>
  );
};
