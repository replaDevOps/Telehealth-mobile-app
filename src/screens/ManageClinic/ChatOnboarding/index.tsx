import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Header2 } from '@components/common/Header2';
import { SingleLogo } from '@assets/icons';
import { colors } from '../../../styles/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomButton } from '@components/common/CustomButton';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { styles } from './style';

const FEATURES = [
  'saudi_dialect',
  'smart_photo_scan',
  'suggests_services_devices',
  'clinic_specific',
] as const;

export function ChatOnboarding() {
  const { t } = useTranslation();
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <Header2 title="" />

      <View style={styles.content}>
        {/* Hero text */}
        <Text style={styles.title}>{t('lets_chat_with')}</Text>
        <Text style={styles.highlight}>{t('vena_ai_sparkle')}</Text>
        <Text style={styles.subtitle}>{t('smart_ai_concerns')}</Text>

        {/* Logo */}
        <View style={styles.MainLogoContainer}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <SingleLogo />
            </View>
          </View>
        </View>

        {/* Features section */}
        <View style={styles.featuresSection}>
          <View style={styles.featuresTitleRow}>
            <Text style={styles.title}>{t('how')} </Text>
            <Text style={[styles.title, { color: colors.primary }]}>{t('vena_ai')} </Text>
            <Text style={styles.title}>{t('helps_you')}</Text>
          </View>

          <View style={styles.checkboxGrid}>
            {FEATURES.map(key => (
              <LinearGradient
                key={key}
                colors={['#DDD2E6', colors.white]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.gradientChip}
              >
                <View style={styles.innerChip}>
                  <View style={[styles.checkboxCircle, styles.checkboxChecked]}>
                    <Ionicons name="checkmark" size={12} color="#fff" />
                  </View>
                  <Text style={styles.checkboxLabel}>{t(key)}</Text>
                </View>
              </LinearGradient>
            ))}
          </View>
        </View>

        {/* CTA */}
        <CustomButton
          title={t('get_started')}
          onPress={async () => {
            await AsyncStorage.setItem('vena_ai_onboarding_seen', 'true');
            (navigation as any).replace('ChatScreen');
          }}
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
}
