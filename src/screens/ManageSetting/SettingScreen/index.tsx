import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import { KeyboardAvoidScrollview } from '../../../components/common/keyboard-avoid-scrollview';
import UserProfile from '../../../components/common/UserProfile';
import { Header2 } from '../../../components/common/Header2';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../styles/colors';

import {
  ProfileSvg,
  FAQsSvg,
  RefundSvg,
  LoyaltyPSvg,
  LogoutSvg,
} from '@assets/icons';
import { Share } from 'react-native'; // for sharing
import style from './style';
import { mvs } from '@config/metrices';

export const SettingScreen = ({ navigation }: { navigation: any }) => {
  const [profileImage, setProfileImage] = useState<string>('');

  // =============== Handlers ===============
  const handleImageSelected = (uri: string) => {
    setProfileImage(uri);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message:
          Platform.OS === 'android'
            ? 'Check out this awesome app! https://your-app-link.com'
            : 'Check out this awesome app!',
        url: 'https://your-app-link.com', // iOS
        title: 'Share App',
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share at the moment');
    }
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

  const handleSaveAndContinue = () => {
    Alert.alert('Success', 'Settings saved successfully!');
  };

  // =============== Menu Data ===============
  const menuData = [
    {
      icon: ProfileSvg,
      title: 'Profile Settings',
      onPress: () => navigation.navigate('ProfileSetting'), // Fixed loop!
    },
    {
      icon: FAQsSvg,
      title: 'FAQs',
      onPress: () => navigation.navigate('FAQs'), // Fixed wrong screen
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
        style={[
          style.menuItem,
          {
            // marginTop: isLogout ? 30 : 0,
            backgroundColor: isLogout ? colors.red : colors.gray,
            // paddingVertical: isLogout ? 16 : 20,
          },
        ]}
        onPress={item.onPress}
        activeOpacity={0.7}
      >
        <View style={style.menuLeft}>
          <Icon width={24} height={24} />
          <Text style={[style.menuTitle, isLogout && { color: colors.white }]}>
            {item.title}
          </Text>
        </View>
        {isLogout ? null : <AntDesign name="right" size={20} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <Header2 title="Settings" />

      <View style={style.container}>
        {/* User Profile Section */}
        <UserProfile
          profileImage={profileImage}
          onImageSelected={handleImageSelected}
        />

        <View style={{ marginVertical: mvs(30) }} />

        {/* Menu Items */}
        {menuData.map(renderMenuItem)}
      </View>
    </SafeAreaView>
  );
};
