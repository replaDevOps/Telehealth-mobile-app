import * as React from 'react';
import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Modal, ActivityIndicator, ScrollView } from 'react-native';
import UserProfile from '../../../components/common/UserProfile';
import { Header2 } from '../../../components/common/Header2';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Toast } from 'toastify-react-native';
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
import { colors } from '../../../styles/colors';
import { signOutGoogle } from '../../../services/firebase/googleAuth';
import { getMappedErrorMessage } from '@utils';

export const SettingScreen = ({ navigation }: { navigation: any }) => {
  const { t, i18n } = useTranslation();
  const { logout, isAuthenticated } = useAuthStore();
  const { profileData, fetchProfile, refreshProfile } = useProfileStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

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
            setIsLoggingOut(true);
            try {
              await Promise.all([
                apiClient.post(API.AUTH.LOGOUT),
                signOutGoogle(),
              ]);
            } catch (error: any) {
              console.log('Logout error:', error);
            }

            useProfileStore.getState().clearProfile();
            logout();
            navigation.replace('Auth', { screen: 'SignIn' });
          },
        },
      ],
      { cancelable: true },
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('delete_account'),
      t('delete_account_grace_warning'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete_account'),
          style: 'destructive',
          onPress: async () => {
            setIsDeletingAccount(true);
            try {
              const response = await apiClient.delete(API.SETTINGS.DELETE_USER_ACCOUNT);
              if (response.data?.success === false) {
                const errMsg = response.data?.message || t('failed_to_delete_account');
                Toast.error(getMappedErrorMessage(errMsg));
                setIsDeletingAccount(false);
                return;
              }
              const successMsg = response.data?.message || t('account_permanently_deleted');
              Toast.success(getMappedErrorMessage(successMsg));
              setTimeout(async () => {
                try { await signOutGoogle(); } catch { }
                useProfileStore.getState().clearProfile();
                logout();
                navigation.replace('Auth', { screen: 'SignIn' });
              }, 1000);
            } catch (error: any) {
              const errMsg = error?.response?.data?.message || error?.message || t('failed_to_delete_account');
              Toast.error(getMappedErrorMessage(errMsg));
              setIsDeletingAccount(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleLanguagePress = () => {
    Alert.alert(
      t('language'),
      t('please_select_language'),
      [
        {
          text: 'English',
          onPress: () => {
            i18n.changeLanguage('en');
          },
        },
        {
          text: 'العربية',
          onPress: () => {
            i18n.changeLanguage('ar');
          },
        },
        { text: t('cancel'), style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const handleNotificationsPress = () => {
    Alert.alert(
      t('notifications'),
      t('change_notifications_settings') || 'Do you want to enable notifications?',
      [
        { text: t('yes') || 'Yes', onPress: () => Toast.success(t('notifications_enabled') || 'Notifications enabled') },
        { text: t('no') || 'No', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const handlePaymentMethodsPress = () => {
    Alert.alert(
      t('payment_methods'),
      t('payment_methods_message') || 'Manage your saved credit and debit cards at checkout.',
      [{ text: t('okay'), style: 'default' }],
      { cancelable: true }
    );
  };

  const handleContactUsPress = () => {
    Alert.alert(
      t('contact_us'),
      'info@vena-app.com',
      [{ text: t('okay'), style: 'default' }],
      { cancelable: true }
    );
  };

  const handleAboutAppPress = () => {
    Alert.alert(
      t('about_app'),
      'Vena Patient App\nVersion 1.0.0 (Build 42)\n© 2026 Vena',
      [{ text: t('okay'), style: 'default' }],
      { cancelable: true }
    );
  };

  // =============== Menu Data ===============
  const menuData = [
    {
      icon: ProfileSvg,
      title: t('profile_settings'),
      onPress: () => navigation.navigate('ProfileSetting', { profileData }),
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
      icon: (props: any) => <Ionicons name="globe-outline" size={24} color={colors.black} {...props} />,
      title: t('language'),
      onPress: handleLanguagePress,
    },
    {
      icon: (props: any) => <Ionicons name="notifications-outline" size={24} color={colors.black} {...props} />,
      title: t('notifications'),
      onPress: handleNotificationsPress,
    },
    {
      icon: (props: any) => <Ionicons name="card-outline" size={24} color={colors.black} {...props} />,
      title: t('payment_methods'),
      onPress: handlePaymentMethodsPress,
    },
    {
      icon: (props: any) => <Ionicons name="chatbubbles-outline" size={24} color={colors.black} {...props} />,
      title: t('contact_us'),
      onPress: handleContactUsPress,
    },
    {
      icon: (props: any) => <Ionicons name="information-circle-outline" size={24} color={colors.black} {...props} />,
      title: t('about_app'),
      onPress: handleAboutAppPress,
    },
    {
      icon: (props: any) => <Ionicons name="trash-outline" size={24} color="#EB5757" {...props} />,
      title: t('delete_account'),
      textColor: '#EB5757',
      onPress: handleDeleteAccount,
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
    const isDelete = item.title === t('delete_account');

    return (
      <TouchableOpacity
        key={index}
        style={[style.menuItem, isLogout && style.logoutMenuItem, isDelete && { borderBottomWidth: 0 }]}
        onPress={item.onPress}
        activeOpacity={0.7}
      >
        <View style={style.menuLeft}>
          {typeof Icon === 'function' ? (
            <Icon />
          ) : (
            <Icon width={24} height={24} />
          )}
          <Text style={[style.menuTitle, isLogout && style.logoutMenuTitle, isDelete && { color: '#EB5757' }]}>
            {item.title}
          </Text>
        </View>
        {isLogout || isDelete ? null : <AntDesign name="right" size={20} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={style.safeArea}>
      <Header2 title={t('settings')} />

      <View style={[style.container, { flex: 1 }]}>
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

        {/* Menu Items Scroll Container */}
        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, marginTop: 12 }}>
          {menuData.map(renderMenuItem)}
        </ScrollView>
      </View>

      {/* Loading Modal for Logout */}
      <Modal
        visible={isLoggingOut}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={style.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.white} />
          <Text style={style.loadingText}>{t('logging_out') || 'Logging Out...'}</Text>
        </View>
      </Modal>

      {/* Loading Modal for Account Deletion */}
      <Modal
        visible={isDeletingAccount}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={style.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.white} />
          <Text style={style.loadingText}>{t('deleting_account') || 'Deleting Account...'}</Text>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
