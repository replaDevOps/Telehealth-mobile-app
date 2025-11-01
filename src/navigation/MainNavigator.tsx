import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CustomTabBar from './bottomTab';
import { HomeScreen, NearbyClinics, SelectLocation } from '@screens';
import ClinicScreen from '@screens/ManageClinic';
import HistoryScreen from '@screens/ManageHistory';
import SettingScreen from '@screens/ManageSetting';
import { FilterScreen } from '@screens/ManageClinic/FilterScreen';
import ClinicDetailScreen from '@screens/ManageClinic/ClinicDetail';
import ChatOnboarding from '@screens/ManageClinic/ChatScreens/ChatOnboarding';
import ChatScreen from '@screens/ManageClinic/ChatScreens/ChatScreen';
import CheckoutScreen from '@screens/ManageClinic/Checkout';
import CartScreen from '@screens/ManageClinic/Cart';
export type MainStackParamList = {
  Home: undefined;
  Clinic: undefined;
  History: undefined;
  Setting: undefined;
  CustomTabBar: undefined;
};

const Stack = createNativeStackNavigator();

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
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ClinicScreen" component={ClinicScreen} />
      <Stack.Screen name="FilterScreen" component={FilterScreen} />
      <Stack.Screen name="ClinicDetail" component={ClinicDetailScreen} />
      <Stack.Screen name="ChatOnboarding" component={ChatOnboarding} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} />
      <Stack.Screen name="CartScreen" component={CartScreen} />
    </Stack.Navigator>
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
