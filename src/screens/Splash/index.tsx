import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, useColorScheme, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuthStore, useProfileStore, useLocationStore } from '@store';
import { restoreAppLanguage } from '../../services/language';
import { fcmService } from '../../services/firebase/fcmService';
import { useTranslation } from 'react-i18next';
import { Toast } from 'toastify-react-native';
import { SplashBottomIcon, SplashIcon } from '@assets/images';

const AnimatedImage = Animated.createAnimatedComponent(Image);

type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

type Props = {
  navigation: SplashScreenNavigationProp;
};

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const blurAnim = useRef(new Animated.Value(10)).current;
  const hasNavigatedRef = useRef(false);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const { t } = useTranslation();
  const { fetchProfile } = useProfileStore();
  const { fetchLocation } = useLocationStore();

  useEffect(() => {
    const checkAndNavigate = async () => {
      // Prevent multiple navigations
      if (hasNavigatedRef.current) {
        return;
      }
      try {
        // Applies the stored choice, or leaves i18n on its own default when
        // there is none. It no longer forces English in the else branch: that
        // was the line that undid a language the user had actually chosen.
        const selectedLanguage = await restoreAppLanguage();
        console.log('🌍 [SplashScreen] Language:', selectedLanguage ?? 'none stored');

        // Create a promise that resolves after minimum splash duration (2 seconds for animation)
        const minSplashDuration = new Promise(resolve => setTimeout(resolve, 2000));

        // Start location fetch in background - don't block navigation
        fetchLocation().catch(err => {
          console.warn('⚠️ Location fetch failed in Splash Screen:', err);
        });

        // Wait for minimum splash duration
        await minSplashDuration;

        // Get current auth state directly from store
        const currentAuth = useAuthStore.getState().auth;
        console.log('Current auth from store:', currentAuth);

        // If user is authenticated, fetch profile data and refresh FCM token
        if (currentAuth?.token) {
          fetchProfile();
          // Refresh FCM token in background — no need to await
          fcmService.initializeFcm().catch(err =>
            console.warn('[FCM] Background token refresh failed:', err),
          );
        }

        // Prevent multiple navigations
        if (hasNavigatedRef.current) {
          return;
        }
        hasNavigatedRef.current = true;

        // Navigate after minimum duration has passed
        if (!selectedLanguage) {
          Toast.info(t('please_select_language'));
          navigation.replace('Auth', { screen: 'LanguageSelection' });
        } else {
          // The marketplace is the default destination whether or not anyone is
          // signed in. Browsing clinics and services needs no account; signing
          // in is prompted at the points that do (cart, checkout, contacting a
          // clinic) and from the History and Settings tabs.
          navigation.replace('Main', { screen: 'EntryPoint' });
        }
      } catch (error) {
        console.error('Error during navigation check:', error);
        navigation.replace('Auth', { screen: 'LanguageSelection' });
      }
    };

    checkAndNavigate();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: false,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: false,
      }),
      Animated.timing(blurAnim, {
        toValue: 0,
        duration: 1200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim, blurAnim, navigation]);

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#1E1930' : '#FFFFFF' }]}>
      {/* Centered App Icon */}
      <Animated.View
        style={[
          styles.iconContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <AnimatedImage
          source={SplashIcon}
          style={styles.logo}
          resizeMode="contain"
          blurRadius={blurAnim}
        />
      </Animated.View>

      {/* Bottom Lockup with blur & scale animation */}
      <Animated.View
        style={[
          styles.bottomLockup,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <AnimatedImage
          source={SplashBottomIcon}
          style={styles.bottomIcon}
          resizeMode="contain"
          blurRadius={blurAnim}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4A148C',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 34,
  },
  bottomLockup: {
    position: 'absolute',
    bottom: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomIcon: {
    width: 90,
    height: 40,
  },
});



