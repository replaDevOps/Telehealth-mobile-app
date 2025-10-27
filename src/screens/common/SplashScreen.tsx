import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mvs } from '../../config/metrices';
import LogoSvg from '../../assets/icons/LogoSvg';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { colors } from '../../styles/colors';

type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

type Props = {
  navigation: SplashScreenNavigationProp;
};

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();

    const checkTokenAndNavigate = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        setTimeout(() => {
          if (token) {
            navigation.replace('Main', { screen: 'Home' });
          } else {
            navigation.replace('Auth', { screen: 'LanguageSelection' });
          }
        }, 3000);
      } catch (error) {
        console.error('Error checking token:', error);
        navigation.replace('Auth', { screen: 'LanguageSelection' });
      }
    };

    checkTokenAndNavigate();
  }, [fadeAnim, navigation]);

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

export default SplashScreen;
