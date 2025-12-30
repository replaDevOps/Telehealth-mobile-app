import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mvs } from '../../config/metrices';
import LogoSvg from '../../assets/icons/LogoSvg';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { colors } from '../../styles/colors';
import { useAuthStore, useProfileStore, useLocationStore } from '@store';

type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

type Props = {
  navigation: SplashScreenNavigationProp;
};

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { isAuthenticated } = useAuthStore();
  const { fetchProfile } = useProfileStore();
  const { fetchLocation } = useLocationStore();

  useEffect(() => {
    const checkAndNavigate = async () => {
      try {
        const selectedLanguage = await AsyncStorage.getItem('selectedLanguage');
        
        // Fetch location if permission is available (non-blocking)
        fetchLocation().catch(err => {
          console.warn('Location fetch failed:', err);
        });
        
        // If user is authenticated, fetch profile data once on app start
        if (isAuthenticated) {
          fetchProfile();
        }
        
        setTimeout(() => {
          if (!selectedLanguage) {
            navigation.replace('Auth', { screen: 'LanguageSelection' });
          } else if (isAuthenticated) {
            navigation.replace('Main', { screen: 'Home' });
          } else {
            navigation.replace('Auth', { screen: 'SignIn' });
          }
        }, 3000);
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
  }, [fadeAnim, navigation, isAuthenticated]);

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
