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
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@store';

export const SettingScreen = ({ navigation }: { navigation: any }) => {
  const { t } = useTranslation();
  const { logout } = useAuthStore();
  const [profileImage, setProfileImage] = useState<string>('');

  // =============== Handlers ===============
  const handleImageSelected = (uri: string) => {
    setProfileImage(uri);
  };

  const handleLogout = () => {
    Alert.alert(
      t('log_out'),
      t('are_you_sure_logout'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('log_out'),
          style: 'destructive',
          onPress: () => {
            logout();
            navigation.replace('Auth', { screen: 'SignIn' });
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
      title: t('profile_settings'),
      onPress: () => navigation.navigate('ProfileSetting'),
    },
    {
      icon: FAQsSvg,
      title: t('faqs'),
      onPress: () => navigation.navigate('FAQs'),
    },
    {
      icon: RefundSvg,
      title: t('refund_requests'),
      onPress: () => navigation.navigate('RefundRequest2'),
    },
    {
      icon: LogoutSvg,
      title: t('log_out'),
      backgroundColor: '#FEECED',
      textColor: '#EB5757',
      onPress: handleLogout,
    },
  ];

  // =============== Render Menu Item ===============
  const renderMenuItem = (item: any, index: number) => {
    const Icon = item.icon;
    const isLogout = item.title === t('log_out');

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
      <Header2 title={t('settings')} />

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
