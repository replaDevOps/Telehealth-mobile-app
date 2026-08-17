import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { mvs } from '@config/metrices';
import { colors } from '../../styles/colors';
import { SingleLogo } from '@assets/icons';

/**
 * Shown in place of a screen's contents while browsing as a guest.
 *
 * Cart, History, Settings and Notifications are backed entirely by
 * authenticated endpoints, so there is nothing to render for a guest. Opening
 * one goes straight to the Sign In screen (see useSignInGateOnFocus); this is
 * what the user lands back on if they decline, and the way back in.
 *
 * Deliberately takes no per-screen copy. Four surfaces each explaining their
 * own reason for needing an account read as four different sign-in walls; one
 * wording everywhere is the point.
 */
export const SignInPrompt: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const goToSignIn = () => {
    navigation.navigate('Auth', { screen: 'SignIn' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconCard}>
        <SingleLogo width={44} height={41} fill={colors.white} />
      </View>

      <Text style={styles.title}>{t('sign_in_required') || 'Sign in required'}</Text>

      <Text style={styles.description}>
        {t('sign_in_required_description') ||
          'Please sign in to continue with this action.'}
      </Text>

      <TouchableOpacity style={styles.button} onPress={goToSignIn} activeOpacity={0.85}>
        <Text style={styles.buttonText}>{t('sign_in') || 'Sign In'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: mvs(32),
  },
  iconCard: {
    width: mvs(80),
    height: mvs(80),
    borderRadius: mvs(23),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: mvs(24),
  },
  title: {
    fontSize: mvs(18),
    fontWeight: '700',
    color: colors.black,
    textAlign: 'center',
    marginBottom: mvs(8),
  },
  description: {
    fontSize: mvs(14),
    color: colors.secondary,
    textAlign: 'center',
    lineHeight: mvs(20),
    marginBottom: mvs(28),
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: mvs(12),
    paddingHorizontal: mvs(48),
    borderRadius: mvs(8),
  },
  buttonText: {
    color: colors.white,
    fontSize: mvs(16),
    fontWeight: 'bold',
  },
});

export default SignInPrompt;
