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

export function ChatOnboarding() {
  const navigation = useNavigation();

  // ✅ Manage checkbox states
  const [features, setFeatures] = useState({
    'Saudi Dialect': true,
    'Smart photo scan': false,
    'Suggests services & devices': false,
    'Clinic specific': false,
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
        <Text style={styles.title}>Let’s Chat with</Text>
        <Text style={styles.highlight}>VENA AI ✨</Text>
        <Text style={styles.subtitle}>
          Smart AI that understands your concerns{'\n'}
          and gives instant care tips.
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
            <Text style={styles.title}>How </Text>
            <Text style={[styles.title, { color: colors.primary }]}>
              Vena AI{' '}
            </Text>
            <Text style={styles.title}>Helps You</Text>
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
          title="Get Started"
          onPress={() => navigation.navigate('ChatScreen')}
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
}

import { styles } from './style';
