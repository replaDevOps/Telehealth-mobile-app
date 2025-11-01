import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header2 } from '@components/common/Header2';
import { SingleLogo } from '@assets/icons';
import { colors } from '../../../../styles/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckboxItem } from '@components/atoms';
import { mvs } from '@config/metrices';
import { CustomButton } from '@components/common/CustomButton';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function ChatOnboarding() {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F0F8',
  },
  content: {
    alignItems: 'center',
    flex: 1,
    width: '100%',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E1E1E',
  },
  highlight: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.primary,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B6B6B',
    textAlign: 'center',
    marginTop: 10,
  },
  MainLogoContainer: {
    marginVertical: 40,
    width: 180,
    height: 180,
    borderRadius: 100,
    backgroundColor: '#EBE3F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginVertical: 40,
    width: 170,
    height: 170,
    borderRadius: 100,
    backgroundColor: '#E4DBEB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCircle: {
    width: 160,
    height: 160,
    borderRadius: 100,
    backgroundColor: '#DDD2E6',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  logoText: {
    fontSize: 60,
    fontWeight: '900',
    color: '#7B2FF7',
  },
  checkboxContainer: {
    width: '85%',
    marginTop: 10,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  checkboxGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
    width: '90%',
  },
  checkboxWrapper: {
    margin: 6,
  },
  checkboxChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 140,
    justifyContent: 'center',
  },
  checkedChip: {
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 4,
  },
  uncheckedChip: {
    backgroundColor: '#F5F0FF',
    borderWidth: 1,
    borderColor: '#E2D4FF',
  },
  checkboxLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 30,
    width: '90%',
    position: 'absolute',
    bottom: 0,
  },
  gradientChip: {
    borderRadius: 10,
    margin: 5,
  },
  innerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  checkboxCircle: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 1.8,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: '#fff',
  },
});
