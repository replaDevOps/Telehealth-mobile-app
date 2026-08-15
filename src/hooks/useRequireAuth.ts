import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '@store';

/**
 * Gate for the actions a guest cannot perform: adding to the cart, checking
 * out, and contacting a clinic. Everything else in the marketplace stays open.
 *
 * Usage:
 *   const requireAuth = useRequireAuth();
 *   if (!requireAuth()) return;   // prompt shown, caller stops here
 *
 * Returns true when the user is signed in, so the caller may proceed. Returns
 * false after offering to send them to sign-in.
 */
export const useRequireAuth = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  // The absence of a token is the whole test: it covers both a guest who never
  // signed in and a session that expired underneath the user.
  const token = useAuthStore(state => state.auth?.token);

  return useCallback(
    (message?: string): boolean => {
      if (token) {
        return true;
      }

      Alert.alert(
        t('sign_in_required') || 'Sign in required',
        message ||
        t('sign_in_required_description') ||
        'Please sign in to continue with this action.',
        [
          { text: t('cancel') || 'Cancel', style: 'cancel' },
          {
            text: t('sign_in') || 'Sign In',
            onPress: () => {
              // Root-level navigate: the Auth stack is a sibling of Main, so
              // this works from anywhere inside the tabs.
              navigation.navigate('Auth', { screen: 'SignIn' });
            },
          },
        ],
      );
      return false;
    },
    [token, navigation, t],
  );
};
