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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePassword = (password: string) => {
    // Example: Password must be at least 8 characters, include a number and a special character
    const passwordRegex =
      /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleNext = async () => {
    setError('');

    if (!password || !confirmPassword) {
      setError(t('fields_required'));
      return;
    }

    // if (!validatePassword(password)) {
    //   setError(
    //     'Password must be at least 8 characters long and include a number and a special character.',
    //   );
    //   return;
    // }

    if (password !== confirmPassword) {
      setError(t('passwords_not_match'));
      return;
    }

    if (!token) {
      setError('Invalid token. Please try again.');
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
        setError(errorMessage);
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
      setError(errorMessage);
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
              onChangeText={setPassword}
              secureTextEntry={true}
              errorMessage={error}
            />
            <CustomTextInput
              label={t('confirm_password')}
              placeholder={t('confirm_your_password')}
              secureTextEntry
              value={confirmPassword}
              onChangeText={text => setConfirmPassword(text)}
              errorMessage={error}
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
