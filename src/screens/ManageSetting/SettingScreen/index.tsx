// SettingScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import UserProfile from '../../../components/common/UserProfile';
import { Header2 } from '../../../components/common/Header2';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  ProfileSvg,
  FAQsSvg,
  RefundSvg,
  LoyaltyPSvg,
  LogoutSvg,
} from '@assets/icons';
import style from './style';
import { RoyaltyPointsBar } from '@components/molecules';

export const SettingScreen = ({ navigation }: { navigation: any }) => {
  const [profileImage, setProfileImage] = useState<string>('');

  // =============== Handlers ===============
  const handleImageSelected = (uri: string) => {
    setProfileImage(uri);
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'SignIn' }],
            });
          },
        },
      ],
      { cancelable: true },
    );
  };

  // =============== Menu Data ===============
  const menuData = [
    {
      icon: ProfileSvg,
      title: 'Profile Settings',
      onPress: () => navigation.navigate('ProfileSetting'),
    },
    {
      icon: FAQsSvg,
      title: 'FAQs',
      onPress: () => navigation.navigate('FAQs'),
    },
    {
      icon: RefundSvg,
      title: 'Refund Requests',
      onPress: () => navigation.navigate('RefundRequest2'),
    },
    {
      icon: LoyaltyPSvg,
      title: 'Loyalty Program',
      onPress: () => navigation.navigate('LoyaltyProgramScreen'),
    },
    {
      icon: LogoutSvg,
      title: 'Log Out',
      backgroundColor: '#FEECED',
      textColor: '#EB5757',
      onPress: handleLogout,
    },
  ];

  // =============== Render Menu Item ===============
  const renderMenuItem = (item: any, index: number) => {
    const Icon = item.icon;
    const isLogout = item.title === 'Log Out';

    return (
      <TouchableOpacity
        key={index}
        style={[style.menuItem, isLogout && style.logoutMenuItem]}
        onPress={item.onPress}
        activeOpacity={0.7}
      >
        <View style={style.menuLeft}>
          <Icon width={24} height={24} />
          <Text style={[style.menuTitle, isLogout && style.logoutMenuTitle]}>
            {item.title}
          </Text>
        </View>
        {isLogout ? null : <AntDesign name="right" size={20} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={style.safeArea}>
      <Header2 title="Settings" />

      <View style={style.container}>
        {/* User Profile Section */}
        <UserProfile
          profileImage={profileImage}
          onImageSelected={handleImageSelected}
        />

        {/* Royalty Points Section */}
        <RoyaltyPointsBar
          points={300}
          validTill="18/09/2025"
          onPress={() => navigation.navigate('RoyaltyPoints')}
        />

        {/* Menu Items */}
        {menuData.map(renderMenuItem)}
      </View>
    </SafeAreaView>
  );
};
