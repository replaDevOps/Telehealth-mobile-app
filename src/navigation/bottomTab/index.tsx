import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../../styles/colors';

import {
  ClinicSvg,
  HomeSvg,
  SettingSvg,
  HistorySvg,
  FHomeSvg,
  FClinicSvg,
  fSettingSvg,
  fHistorySvg,
} from '../../assets/icons'; // Adjust the import path as needed
import {
  ClinicNavigator,
  HistoryNavigator,
  HomeNavigator,
  SettingNavigator,
} from '@navigation/MainNavigator';

export type TabParamList = {
  Home: undefined;
  Clinic: undefined;
  History: undefined;
  Setting: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export default function CustomTabBar() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarIcon: ({ focused }) => {
          let SvgComponent;
          let label = '';
          switch (route.name) {
            case 'Home':
              SvgComponent = focused ? FHomeSvg : HomeSvg;
              label = 'Home';
              break;
            case 'Clinic':
              SvgComponent = ClinicSvg;
              SvgComponent = focused ? FClinicSvg : ClinicSvg;

              label = 'Clinic';
              break;
            case 'History':
              SvgComponent = HistorySvg;
              SvgComponent = focused ? fHistorySvg : HistorySvg;

              label = 'History';
              break;
            case 'Setting':
              SvgComponent = SettingSvg;
              SvgComponent = focused ? fSettingSvg : SettingSvg;

              label = 'Setting';
              break;
          }
          return (
            <View style={styles.iconLabelWrapper}>
              {SvgComponent && (
                <SvgComponent width={24} height={24} fill={''} />
              )}
              <Text
                numberOfLines={1}
                style={[
                  styles.labelText,
                  { color: focused ? colors.primary : colors.secondary },
                ]}
              >
                {label}
              </Text>
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeNavigator} />
      <Tab.Screen name="Clinic" component={ClinicNavigator} />
      <Tab.Screen name="History" component={HistoryNavigator} />
      <Tab.Screen name="Setting" component={SettingNavigator} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    height: 65,
    paddingBottom: 5,
    paddingTop: 5,
  },
  iconLabelWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    paddingTop: 10,
    gap: 8,
  },
  labelText: {
    fontSize: 12,
    fontFamily: 'DMSans-Regular',
    textAlign: 'center',
    width: '100%',
  },
});
