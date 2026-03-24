import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mvs } from '../../config/metrices';
import LogoSvg from '../../assets/icons/LogoSvg';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { colors } from '../../styles/colors';
import { useAuthStore, useProfileStore, useLocationStore } from '@store';
import i18n from '../../services/i18n';
import { fcmService } from '../../services/firebase/fcmService';

type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

type Props = {
  navigation: SplashScreenNavigationProp;
};

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const hasNavigatedRef = useRef(false);
  const { auth } = useAuthStore();
  console.log('auth', auth);
  const { fetchProfile } = useProfileStore();
  const { fetchLocation } = useLocationStore();

  useEffect(() => {
    const checkAndNavigate = async () => {
      // Prevent multiple navigations
      if (hasNavigatedRef.current) {
        return;
      }
      try {
        const selectedLanguage = await AsyncStorage.getItem('selectedLanguage');
        
        // Initialize i18n with the saved language
        if (selectedLanguage) {
          await i18n.changeLanguage(selectedLanguage);
          console.log('🌍 [SplashScreen] Initialized language:', selectedLanguage);
        } else {
          await i18n.changeLanguage('en');
          console.log('🌍 [SplashScreen] Defaulting to English');
        }

        // Create a promise that resolves after minimum splash duration (2 seconds for animation)
        const minSplashDuration = new Promise(resolve => setTimeout(resolve, 2000));

        // Start location fetch in background - don't block navigation
        // Location will load on Home screen with a loader
        fetchLocation().catch(err => {
          console.warn('⚠️ Location fetch failed in Splash Screen:', err);
        });

        // Only wait for minimum splash duration - navigate quickly
        await minSplashDuration;

        // Get current auth state directly from store to avoid stale closure values
        // This is important because Zustand persistence hydrates asynchronously
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

        // Navigate after both location is fetched and minimum duration has passed
        if (!selectedLanguage) {
          navigation.replace('Auth', { screen: 'LanguageSelection' });
        } else if (currentAuth?.token) {
          console.log(currentAuth, "Called Sign");
          navigation.replace('Main', { screen: 'Home' });
        } else {
          console.log(currentAuth, "Called Sign");
          navigation.replace('Auth', { screen: 'SignIn' });
        }
      } catch (error) {
        console.error('Error during navigation check:', error);
        navigation.replace('Auth', { screen: 'LanguageSelection' });
      }
    };

    checkAndNavigate();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fadeAnim, navigation]); // Only run once on mount

  return (
    <View style={styles.logoContainer}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <LogoSvg width={mvs(250)} height={mvs(200)} />
      </Animated.View>
      <ActivityIndicator
        size="large"
        color={colors.primary}
        style={{ position: 'absolute', bottom: 100 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
