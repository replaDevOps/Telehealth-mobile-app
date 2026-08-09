import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CustomTabBar from './bottomTab';
import {
  HomeScreen,
  NearbyClinics,
  NotificationScreen,
  SelectLocation,
} from '@screens';
import {
  FilterScreen,
  ClinicDetailScreen,
  CheckoutScreen,
  ConsultationPayment,
  AudioConsultation,
  VideoConsultation,
  ChatOnboarding,
  ClinicScreen,
  WaitingForDoctor,
} from '@screens/ManageClinic';
import { HistoryScreen } from '@screens/ManageHistory';
import {
  ChangePassword,
  FAQs,
  LoyaltyPointsDetails,
  RefundRequest2,
  RoyaltyPoints,
  SettingScreen,
  ProfileSetting,
} from '@screens/ManageSetting';
import {
  CardDetails,
  ChatScreen,
  RefundRequest,
  PrescriptionScreen,
  CartScreen,
  RefundPolicy,
  PolicyScreen,
  PaymentStatusScreen,
  PaymentWebViewScreen,
} from '@screens/Comman';

export type MainStackParamList = {
  EntryPoint: undefined;
  ChatScreen: { chatId: string; name: string };
  CardDetails: undefined;
  Refund: { paymentId: string;[key: string]: any };
  CheckoutScreen: undefined;
  PaymentWebView: {
    paymentUrl: string;
    paymentId: number | string;
    expectedAmount?: number;
  };
  PaymentStatus: { paymentId: number | string; expectedAmount?: number };
  CartScreen: undefined;
  PrescriptionScreen: undefined;
  Notification: undefined;
  ClinicDetail: { clinic: any };
  AudioConsultation: undefined;
  VideoConsultation: undefined;
  ChatOnboarding: undefined;
  ConsultationPayment: undefined;
  RefundPolicy: undefined;
  PolicyScreen: { type: 'privacy' | 'terms' };
  HomeScreen: undefined;
  NearbyClinics: undefined;
  SelectLocation: undefined;
  HistoryScreen: undefined;
  SettingScreen: undefined;
  ProfileSetting: { navigation: any; route?: any };
  ChangePassword: undefined;
  FAQs: undefined;
  RefundRequest2: undefined;
  RoyaltyPoints: undefined;
  LoyaltyPointsDetails: undefined;
};

export type ClinicStackParamList = {
  ClinicScreen: undefined;
  FilterScreen: undefined;
  ClinicDetail: undefined;
  ChatOnboarding: undefined;

  CheckoutScreen: undefined;
  CartScreen: undefined;
  ConsultationPayment: undefined;
  WaitingForDoctor: {
    consultationID: number | string;
    consultationType?: string;
  };
  PrescriptionScreen: undefined;
  AudioConsultation: undefined;
  VideoConsultation: undefined;
};

const Stack = createNativeStackNavigator<MainStackParamList>();
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
      <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} />
      <Stack.Screen
        name="PaymentWebView"
        component={PaymentWebViewScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="PaymentStatus"
        component={PaymentStatusScreen}
        options={{ gestureEnabled: false, headerBackVisible: false }}
      />
      <Stack.Screen name="CartScreen" component={CartScreen} />
      <Stack.Screen name="PrescriptionScreen" component={PrescriptionScreen} />
      <Stack.Screen name="Notification" component={NotificationScreen} />

      <Stack.Screen name="ClinicDetail" component={ClinicDetailScreen} />
      <Stack.Screen name="AudioConsultation" component={AudioConsultation} />
      <Stack.Screen name="VideoConsultation" component={VideoConsultation} />
      <ClinicStack.Screen name="ChatOnboarding" component={ChatOnboarding} />

      <Stack.Screen
        name="ConsultationPayment"
        component={ConsultationPayment}
      />
      <Stack.Screen
        name="WaitingForDoctor"
        component={WaitingForDoctor}
        options={{
          gestureEnabled: false, // Disable swipe gestures (iOS)
          headerBackVisible: false, // Hide back button
        }}
      />
      <Stack.Screen name="RefundPolicy" component={RefundPolicy} />
      <Stack.Screen name="PolicyScreen" component={PolicyScreen} />
    </Stack.Navigator>
  );
};

export const HomeNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="NearbyClinics" component={NearbyClinics} />
      <Stack.Screen name="SelectLocation" component={SelectLocation} />
      <Stack.Screen name="ClinicDetail" component={ClinicDetailScreen} />
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
      {/* ProfileSetting is registered inside SettingNavigator to avoid duplicate route names */}
      <Stack.Screen name="ChangePassword" component={ChangePassword} />
      <Stack.Screen name="FAQs" component={FAQs} />
      <Stack.Screen name="RefundRequest2" component={RefundRequest2} />
      <Stack.Screen name="RoyaltyPoints" component={RoyaltyPoints} />
      <Stack.Screen
        name="LoyaltyPointsDetails"
        component={LoyaltyPointsDetails}
      />
    </Stack.Navigator>
  );
};
