import * as React from 'react';
import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Modal, ActivityIndicator, ScrollView, Switch } from 'react-native';
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
import { RoyaltyPointsBar, SignInPrompt } from '@components/molecules';
import { useSignInGateOnFocus } from '../../../hooks/useRequireAuth';
import { useTranslation } from 'react-i18next';
import { useAuthStore, useProfileStore } from '@store';
import { apiClient } from '../../../services/api/api-client';
import { API } from '../../../services/api/api-endpoint';
import { colors } from '../../../styles/colors';
import { signOutGoogle } from '../../../services/firebase/googleAuth';
import { getMappedErrorMessage } from '@utils';
import { resetToHome } from '@navigation/navigation-service';
import { setAppLanguage } from '@services/language';
import { isNotificationOn } from './notificationStatus';

export const SettingScreen = ({ navigation }: { navigation: any }) => {
  // Guests get the Sign In screen rather than a wall: this screen is nothing
  // but authenticated content.
  useSignInGateOnFocus();
  const { t } = useTranslation();
  const { logout, isAuthenticated } = useAuthStore();
  // No session at all: browsing is allowed, this tab is not.
  const isSignedOut = !useAuthStore(state => state.auth?.token);
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
            // Browsing needs no account, so a signed-out user belongs in the
            // marketplace rather than at a sign-in wall.
            resetToHome();
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
                // Same as log out, and more so: there is no account left to
                // sign back into.
                resetToHome();
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

  // Reflects the account's stored notificationStatus, so it survives leaving
  // and returning to this screen without a local copy going stale.
  const notificationsEnabled = isNotificationOn(profileData?.notificationStatus);
  const [togglingNotifications, setTogglingNotifications] = useState(false);

  const handleNotificationsToggle = async (value: boolean) => {
    if (togglingNotifications) return;

    // Optimistic: the switch should move under the user's finger, not after a
    // round trip. Rolled back below if the server disagrees.
    setTogglingNotifications(true);
    useProfileStore.getState().updateProfile({ notificationStatus: value });

    try {
      const response = await apiClient.post(API.SETTINGS.NOTIFICATION_TOGGLE, {
        enable_notification: value,
      });

      if (response.data?.success === false) {
        throw new Error(response.data?.message || t('something_went_wrong'));
      }

      Toast.success(
        value
          ? t('notifications_enabled') || 'Notifications enabled'
          : t('notifications_disabled') || 'Notifications disabled',
      );
    } catch (error: any) {
      // Put the switch back where it was, so it never shows a state the
      // account is not actually in.
      useProfileStore.getState().updateProfile({ notificationStatus: !value });
      const errMsg =
        error?.response?.data?.message || error?.message || t('something_went_wrong');
      Toast.error(getMappedErrorMessage(errMsg));
    } finally {
      setTogglingNotifications(false);
    }
  };

  const handleLanguagePress = () => {
    Alert.alert(
      t('language'),
      t('please_select_language'),
      [
        {
          text: 'English',
          onPress: () => {
            setAppLanguage('en');
          },
        },
        {
          text: 'العربية',
          onPress: () => {
            setAppLanguage('ar');
          },
        },
        { text: t('cancel'), style: 'cancel' },
      ],
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
      icon: (props: any) => <Ionicons name="card-outline" size={24} color={colors.black} {...props} />,
      title: t('payment_methods') || 'Payment Methods',
      onPress: () => navigation.navigate('SavedCardsScreen'),
    },
    {
      icon: (props: any) => <Ionicons name="globe-outline" size={24} color={colors.black} {...props} />,
      title: t('language'),
      onPress: handleLanguagePress,
    },
    {
      icon: (props: any) => <Ionicons name="notifications-outline" size={24} color={colors.black} {...props} />,
      title: t('notifications'),
      toggle: true,
      value: notificationsEnabled,
      onToggle: handleNotificationsToggle,
      disabled: togglingNotifications,
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

    const label = (
      <View style={style.menuLeft}>
        {typeof Icon === 'function' ? <Icon /> : <Icon width={24} height={24} />}
        <Text style={[style.menuTitle, isLogout && style.logoutMenuTitle, isDelete && { color: '#EB5757' }]}>
          {item.title}
        </Text>
      </View>
    );

    // A toggle row is a plain View: wrapping a Switch in a TouchableOpacity
    // gives the row two competing press targets, and tapping just beside the
    // switch would silently flip it.
    if (item.toggle) {
      return (
        <View key={index} style={style.menuItem}>
          {label}
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            disabled={item.disabled}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>
      );
    }

    return (
      <TouchableOpacity
        key={index}
        style={[style.menuItem, isLogout && style.logoutMenuItem, isDelete && { borderBottomWidth: 0 }]}
        onPress={item.onPress}
        activeOpacity={0.7}
      >
        {label}
        {isLogout || isDelete ? null : <AntDesign name="right" size={20} />}
      </TouchableOpacity>
    );
  };

  // Profile, rewards, password and account actions are all account-scoped
  // (/patient-setting/*), so a guest is offered the way in instead.
  if (isSignedOut) {
    return (
      <SafeAreaView style={style.safeArea}>
        <Header2 title={t('settings')} back={false} />
        <SignInPrompt />
      </SafeAreaView>
    );
  }

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
