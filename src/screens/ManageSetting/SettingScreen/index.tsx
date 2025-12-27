// SettingScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import UserProfile from '../../../components/common/UserProfile';
import { Header2 } from '../../../components/common/Header2';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

import {
  ProfileSvg,
  FAQsSvg,
  RefundSvg,
  LogoutSvg,
} from '@assets/icons';
import style from './style';
import { RoyaltyPointsBar } from '@components/molecules';
import { useTranslation } from 'react-i18next';
import { useAuthStore, useProfileStore } from '@store';
import { apiClient } from '../../../services/api/api-client';
import { API } from '../../../services/api/api-endpoint';

export const SettingScreen = ({ navigation }: { navigation: any }) => {
  const { t } = useTranslation();
  const { logout, isAuthenticated } = useAuthStore();
  const { profileData, fetchProfile, refreshProfile } = useProfileStore();
  
  // Extract profile image and loyalty points from store
  const profileImage = profileData?.image || profileData?.profileImage || profileData?.profile_image || '';
  const loyaltyPoints = profileData?.loyaltyPoints 
    ? (typeof profileData.loyaltyPoints === 'string' 
        ? parseInt(profileData.loyaltyPoints, 10) 
        : profileData.loyaltyPoints)
    : 0;

  // Fetch profile data on component mount and when screen is focused (only if authenticated)
  // The store will use cached data if available and fresh
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        fetchProfile();
      }
    }, [isAuthenticated, fetchProfile])
  );

  // =============== Handlers ===============
  const handleImageSelected = (uri: string) => {
    // Update profile in store
    useProfileStore.getState().updateProfile({ image: uri });
    // Refresh profile data after image upload
    refreshProfile();
  };

  const handleLogout = async () => {
    Alert.alert(
      t('log_out'),
      t('are_you_sure_logout'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('log_out'),
          style: 'destructive',
          onPress: async () => {
            try {
              // Call logout API
              await apiClient.post(API.AUTH.LOGOUT);
            } catch (error: any) {
              // Even if API call fails, proceed with logout
              console.log('Logout API error:', error);
            } finally {
              // Clear auth store and profile store, then navigate to login
              useProfileStore.getState().clearProfile();
              logout();
              navigation.replace('Auth', { screen: 'SignIn' });
            }
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
      onPress: () => navigation.navigate('ProfileSetting', {
        profileData: profileData,
      }),
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
          points={loyaltyPoints}
          validTill="18/09/2025"
          onPress={() => navigation.navigate('RoyaltyPoints')}
        />

        {/* Menu Items */}
        {menuData.map(renderMenuItem)}
      </View>
    </SafeAreaView>
  );
};
