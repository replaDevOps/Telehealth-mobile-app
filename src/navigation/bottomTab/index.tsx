import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../../styles/colors';
import ClinicScreen from '../../screens/bottomTab/ClinicScreen';
import HistoryScreen from '../../screens/bottomTab/HistoryScreen';
import SettingScreen from '../../screens/bottomTab/SettingScreen';
import HomeScreen from '../../screens/bottomTab/HomeScreen';
import { ClinicSvg, HomeSvg, SettingSvg, HistorySvg } from '../../assets/icons'; // Adjust the import path as needed

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
          let SvgComponent = null;
          let label = '';
          switch (route.name) {
            case 'Home':
              SvgComponent = HomeSvg;
              label = 'Home';
              break;
            case 'Clinic':
              SvgComponent = ClinicSvg;
              label = 'Clinic';
              break;
            case 'History':
              SvgComponent = HistorySvg;
              label = 'History';
              break;
            case 'Setting':
              SvgComponent = SettingSvg;
              label = 'Setting';
              break;
          }
          return (
            <View style={styles.iconLabelWrapper}>
              {SvgComponent && (
                <SvgComponent
                  width={24}
                  height={24}
                  fill={focused ? colors.primary : colors.secondary}
                />
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
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Clinic" component={ClinicScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Setting" component={SettingScreen} />
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
