import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { mvs } from '@config/metrices';
import { colors } from '../../styles/colors';
import { SingleLogo } from '@assets/icons';

interface SignInPromptProps {
  /** Why signing in is needed here, e.g. "to see your consultation history". */
  description?: string;
}

/**
 * Shown in place of a tab's contents while browsing as a guest.
 *
 * History and Settings are backed entirely by authenticated endpoints
 * (/history/* and /patient-setting/*), so there is nothing to render for a
 * guest. Rather than an empty list or a wall of 401s, offer the way in.
 */
export const SignInPrompt: React.FC<SignInPromptProps> = ({ description }) => {
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
        {description ||
          t('sign_in_required_description') ||
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
