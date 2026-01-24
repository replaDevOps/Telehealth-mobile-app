import React, { useState } from 'react';
import { View } from 'react-native';
import { KeyboardAvoidScrollview } from '../../../components/common/keyboard-avoid-scrollview';
import { Header2 } from '../../../components/common/Header2';
import { CustomTextInput } from '../../../components/common/CustomTextInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './style';
import { useTranslation } from 'react-i18next';
import { tryCatch } from '@utils';
import { API } from '@services/api/api-endpoint';
import { apiClient } from '@services/api/api-client';
import { Toast } from 'toastify-react-native';

export const ChangePassword = ({ navigation }) => {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');

  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  // Per-field errors
  const [oldPasswordError, setOldPasswordError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePassword = (password: string) => {
    // Example: Password must be at least 8 characters, include a number and a special character
    const passwordRegex =
      /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSave = async () => {
    // reset errors
    setError('');
    setOldPasswordError('');
    setPasswordError('');
    setConfirmPasswordError('');

    // Validate each field with specific messages
    let hasError = false;
    if (!oldPassword) {
      setOldPasswordError(t('please_enter_old_password') || 'Current password is required');
      hasError = true;
    }

    if (!password) {
      setPasswordError(t('please_enter_password') || 'New password is required');
      hasError = true;
    }

    if (!confirmPassword) {
      setConfirmPasswordError(t('please_confirm_password') || 'Password confirmation is required');
      hasError = true;
    }

    if (hasError) return;

    // Validate new password format
    if (!validatePassword(password)) {
      setPasswordError(
        'Password must be at least 8 characters long and include a number and a special character.',
      );
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setConfirmPasswordError(t('passwords_not_match') || 'Passwords do not match');
      return;
    }

    // Validate old password and new password are different
    if (oldPassword === password) {
      setPasswordError('New password must be different from old password');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        oldPassword: oldPassword.trim(),
        newPassword: password.trim(),
        confirmPassword: confirmPassword.trim(),
      };

      const [res, err] = await tryCatch(
        apiClient.post(API.SETTINGS.CHANGE_PASSWORD, payload),
      );
      console.log("🚀 ~ handleSave ~ res:", res)
      console.log("🚀 ~ handleSave ~ err:", err)

      if (err) {
        const errorMessage = (err as Error).message || 'Failed to change password';
        setError(errorMessage);
        Toast.error(errorMessage);
        setLoading(false);
        return;
      }

      // Check if API returned success: false (even with 200 status)
      const responseData = res.data?.data || res.data;
      if (res.data?.success === false || responseData?.success === false) {
        const errorMessage = responseData?.message || res.data?.message || 'Failed to change password';
        setError(errorMessage);
        Toast.error(errorMessage);
        setLoading(false);
        return;
      }

      // Show success message
      const successMessage = res.data?.message || responseData?.message || 'Password changed successfully';
      Toast.success(successMessage);
      
      // Clear form and navigate back
      setOldPassword('');
      setPassword('');
      setConfirmPassword('');
      setError('');
      setOldPasswordError('');
      setPasswordError('');
      setConfirmPasswordError('');
      setLoading(false);
      navigation.goBack();
    } catch (error: any) {
      const errorMessage = error?.message || 'An unexpected error occurred';
      setError(errorMessage);
      Toast.error(errorMessage);
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidScrollview>
      <SafeAreaView style={{ flex: 1 }}>
        <Header2 
          title={t('password_label')} 
          useSave={true} 
          handleSave={handleSave}
          loading={loading}
        />

        <View style={styles.container}>
          <View style={styles.InputContainer}>
            <CustomTextInput
              label={t('old_password')}
              placeholder={t('enter_old_password')}
              value={oldPassword}
              onChangeText={text => {
                setOldPassword(text);
                if (text) setOldPasswordError('');
              }}
              secureTextEntry={true}
              errorMessage={oldPasswordError}
            />
            <CustomTextInput
              label={t('new_password')}
              placeholder={t('enter_new_password')}
              value={password}
              onChangeText={text => {
                setPassword(text);
                if (text) setPasswordError('');
              }}
              secureTextEntry={true}
              errorMessage={passwordError}
            />
            <CustomTextInput
              label={t('retype_password')}
              placeholder={t('retype_new_password')}
              secureTextEntry
              value={confirmPassword}
              onChangeText={text => {
                setConfirmPassword(text);
                if (text) setConfirmPasswordError('');
              }}
              errorMessage={confirmPasswordError}
            />
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidScrollview>
  );
};
