import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CommonActions } from '@react-navigation/native';
import { colors } from '../../styles/colors';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ClinicSvg,
  HomeSvg,
  SettingSvg,
  HistorySvg,
  FHomeSvg,
  FClinicSvg,
  fSettingSvg,
  fHistorySvg,
} from '../../assets/icons';
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
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: (() => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? '';

          const showTabScreens = [
            'HomeScreen',
            'ClinicScreen',
            'HistoryScreen',
            'SettingScreen',
          ];

          if (!showTabScreens.includes(routeName) && routeName !== '') {
            return { display: 'none' };
          }

          return {
            ...styles.tabBar,
            height: 65 + insets.bottom,
            paddingBottom: 5 + insets.bottom,
          };
        })(),

        tabBarIcon: ({ focused }) => {
          let SvgComponent;
          let label = '';
          switch (route.name) {
            case 'Home':
              SvgComponent = focused ? FHomeSvg : HomeSvg;
              label = t('home');
              break;
            case 'Clinic':
              SvgComponent = focused ? FClinicSvg : ClinicSvg;

              label = t('clinic');
              break;
            case 'History':
              SvgComponent = focused ? fHistorySvg : HistorySvg;

              label = t('history');
              break;
            case 'Setting':
              SvgComponent = focused ? fSettingSvg : SettingSvg;

              label = t('setting');
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
      <Tab.Screen
        name="Setting"
        component={SettingNavigator}
        listeners={({ navigation }) => ({
          tabPress: e => {
            try {
              console.log('Resetting Setting tab to root screen');
              // Always navigate the Setting tab to its root screen when pressed
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Setting', params: { screen: 'SettingScreen' } }],
                })
              );
            } catch (err) {
              // Fallback: perform normal navigation
              navigation.navigate('Setting');
            }
          },
        })}
      />
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
