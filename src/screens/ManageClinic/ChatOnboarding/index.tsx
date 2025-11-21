import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header2 } from '@components/common/Header2';
import { SingleLogo } from '@assets/icons';
import { colors } from '../../../styles/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mvs } from '@config/metrices';
import { CustomButton } from '@components/common/CustomButton';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

export function ChatOnboarding() {
  const { t } = useTranslation();
  const navigation = useNavigation();

  // ✅ Manage checkbox states
  const [features, setFeatures] = useState({
    [t('saudi_dialect')]: true,
    [t('smart_photo_scan')]: false,
    [t('suggests_services_devices')]: false,
    [t('clinic_specific')]: false,
  });

  const toggleFeature = (key: string) => {
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <Header2 title="" />

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{t('lets_chat_with')}</Text>
        <Text style={styles.highlight}>{t('vena_ai_sparkle')}</Text>
        <Text style={styles.subtitle}>
          {t('smart_ai_concerns')}
        </Text>

        {/* Logo */}
        <View style={styles.MainLogoContainer}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <SingleLogo />
            </View>
          </View>
        </View>
        <View style={{ alignItems: 'center', marginVertical: mvs(20) }}>
          {/* Section Title */}
          <View style={[{ flexDirection: 'row', marginTop: mvs(60) }]}>
            <Text style={styles.title}>{t('how')} </Text>
            <Text style={[styles.title, { color: colors.primary }]}>{t('vena_ai')} </Text>
            <Text style={styles.title}>{t('helps_you')}</Text>
          </View>

          <View style={styles.checkboxGrid}>
            {Object.keys(features).map(key => {
              const checked = features[key];
              return (
                <LinearGradient
                  key={key}
                  colors={['#DDD2E6', colors.white]}
                  start={{ x: 0, y: 0 }} // top
                  end={{ x: 0, y: 1 }} // bottom
                  style={styles.gradientChip}
                >
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => toggleFeature(key)}
                    style={styles.innerChip}
                  >
                    {/* Checkbox */}
                    <View
                      style={[
                        styles.checkboxCircle,
                        checked && {
                          backgroundColor: colors.primary,
                          borderColor: colors.primary,
                        },
                      ]}
                    >
                      {checked && (
                        <Ionicons name="checkmark" size={12} color="#fff" />
                      )}
                    </View>

                    {/* Label */}
                    <Text style={styles.checkboxLabel}>{key}</Text>
                  </TouchableOpacity>
                </LinearGradient>
              );
            })}
          </View>
        </View>

        {/* Get Started Button */}
        <CustomButton
          title={t('get_started')}
          onPress={() => navigation.navigate('ChatScreen')}
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
}

import { styles } from './style';
