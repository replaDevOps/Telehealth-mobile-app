import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { KeyboardAvoidScrollview } from '../../../components/common/keyboard-avoid-scrollview';
import { LogoSvg } from '../../../assets/icons';
import { Header2 } from '../../../components/common/Header2';
import CustomText from '../../../components/common/CustomText';
import { CustomButton } from '../../../components/common/CustomButton';
import { CustomTextInput } from '../../../components/common/CustomTextInput';
import { AuthStackParamList } from '../../../navigation/AuthNavigator';
import { styles } from './styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { apiClient } from '@services/api/api-client';
import { API } from '@services/api/api-endpoint';
import { Toast } from 'toastify-react-native';

type NavProps = StackNavigationProp<AuthStackParamList, 'SetPassword'>;
type RouteProps = RouteProp<AuthStackParamList, 'SetPassword'>;

interface Props {
  navigation: NavProps;
  route: RouteProps;
}

export const SetPassword: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const token = route.params?.token;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    // Reset all errors
    setPasswordError('');
    setConfirmPasswordError('');

    let valid = true;

    // Validate password field
    if (!password.trim()) {
      setPasswordError(t('password_required'));
      valid = false;
    }

    // Validate confirm password field
    if (!confirmPassword.trim()) {
      setConfirmPasswordError(t('confirm_password_required'));
      valid = false;
    }

    // If either field is empty, don't proceed
    if (!valid) {
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setConfirmPasswordError(t('passwords_not_match'));
      return;
    }

    if (!token) {
      Toast.error('Invalid token. Please try again.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        token: token,
        password: password.trim(),
        confirmationPassword: confirmPassword.trim(),
      };

      console.log('Resetting password with payload:', { ...payload, password: '***', confirmationPassword: '***' });

      const response = await apiClient.post(API.AUTH.RESET_PASSWORD, payload);

      // Check for success: false in response
      if (response.data?.success === false) {
        const errorMessage = response.data?.message || 'Failed to reset password';
        Toast.error(errorMessage);
        setLoading(false);
        return;
      }

      // Success
      const successMessage = response.data?.message || 'Password reset successfully';
      Toast.success(successMessage);
      
      // Navigate to sign in screen
      navigation.navigate('SignIn');
    } catch (error: any) {
      console.error('Reset password error:', error);
      const errorMessage = 
        error?.response?.data?.message || 
        error?.data?.message ||
        error?.message || 
        'Failed to reset password. Please try again.';
      Toast.error(errorMessage);
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidScrollview>
      <SafeAreaView style={{ flex: 1 }}>
        <Header2 title="" showLanguage={true} />

        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <LogoSvg />
          </View>

          <View style={styles.content}>
            <CustomText text={t('set_new_password')} />
          </View>

          <View style={styles.content}>
            <Text style={styles.TextContent}>
              {t('otp_verified')}
            </Text>
          </View>

          <View style={styles.InputContainer}>
            <CustomTextInput
              label={t('password')}
              placeholder={t('enter_password')}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError('');
              }}
              secureTextEntry={true}
              errorMessage={passwordError}
            />
            <CustomTextInput
              label={t('confirm_password')}
              placeholder={t('confirm_your_password')}
              secureTextEntry
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (confirmPasswordError) setConfirmPasswordError('');
              }}
              errorMessage={confirmPasswordError}
            />
          </View>

          <CustomButton
            title={loading ? t('processing') : t('update_password')}
            onPress={handleNext}
            // disabled={loading}
          />
        </View>
      </SafeAreaView>
    </KeyboardAvoidScrollview>
  );
};
