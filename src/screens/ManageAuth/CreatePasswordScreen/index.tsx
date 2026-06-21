import React, { useState, useEffect } from 'react';
import { View, Text, Image } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { KeyboardAvoidScrollview } from '../../../components/common/keyboard-avoid-scrollview';
import { LogoPng } from '../../../assets/images';
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
import { tryCatch } from '@utils';
import { Toast } from 'toastify-react-native';

type NavProps = StackNavigationProp<AuthStackParamList, 'CreatePassword'>;
type RouteProps = RouteProp<AuthStackParamList, 'CreatePassword'>;

interface Props {
  navigation: NavProps;
  route: RouteProps;
}

export const CreatePassword: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle back button - navigate to SignUp instead of OTP
  // This ensures user needs to verify OTP again if they go back
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // Only handle if it's a back action (not programmatic navigation)
      if (e.data.action.type !== 'GO_BACK') {
        return;
      }

      // Prevent default behavior of going back to OTP screen
      e.preventDefault();

      // Reset navigation stack to SignUp screen
      // This clears the OTP screen from history so user must verify again
      // Use setTimeout to avoid infinite loop
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'SignUp' }],
        });
      }, 0);
    });

    return unsubscribe;
  }, [navigation]);

  const validatePassword = (value: string) => {
    const passwordRegex =
      /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
    return passwordRegex.test(value);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    
    // Validate password in real-time if user has started typing
    if (value.length > 0) {
      if (!validatePassword(value)) {
        setPasswordError(
          'Password must be at least 8 characters long and include a number and a special character.'
        );
      } else {
        setPasswordError('');
      }
    } else {
      setPasswordError('');
    }

    // Also check confirm password match if it's already filled
    if (confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError(t('passwords_not_match'));
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    
    // Validate confirm password in real-time if user has started typing
    if (value.length > 0) {
      if (password && value !== password) {
        setConfirmPasswordError(t('passwords_not_match'));
      } else {
        setConfirmPasswordError('');
      }
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleNext = async() => {
    // Clear previous errors
    setPasswordError('');
    setConfirmPasswordError('');

    if (!password || !confirmPassword) {
      if (!password) {
        setPasswordError(t('password_required'));
      }
      if (!confirmPassword) {
        setConfirmPasswordError(t('confirm_password_required'));
      }
      return;
    }

    if (!validatePassword(password)) {
      setPasswordError(
        'Password must be at least 8 characters long and include a number and a special character.',
      );
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError(t('passwords_not_match'));
      return;
    }
    setLoading(true);
    const firebaseUid = route.params?.firebaseUid;
    const [data, err] = await tryCatch(
      apiClient.post(API.AUTH.CREATE_PASSWORD, {
        password,
        confirmPassword,
        ...(firebaseUid ? { firebaseUid } : {}),
      }),
    );
    if (err) {
      Toast.error((err as Error).message);
      setLoading(false);
      return;
    }
    const successMsg = t('password_created_success');
    Toast.success(successMsg);
    setLoading(false);
    navigation.navigate('Profile', {
      email: route.params?.email,
      phone: route.params?.phone,
      countryCode: route.params?.countryCode,
      firebaseUid,
    });
  };

  return (
    <KeyboardAvoidScrollview>
      <SafeAreaView style={{ flex: 1 }}>
        <Header2 title="" showLanguage={true} />

        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Image source={LogoPng} style={{ width: 300, height: 131, resizeMode: 'contain' }} />
          </View>

          <View style={styles.content}>
            <CustomText text={t('create_password')} />
          </View>

          <View style={styles.content}>
            <Text style={styles.TextContent}>
              {t('create_strong_password')}
            </Text>
          </View>

          <View style={styles.InputContainer}>
            <CustomTextInput
              label={t('password')}
              placeholder={t('enter_password')}
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry={true}
              errorMessage={passwordError}
            />
            <CustomTextInput
              label={t('confirm_password')}
              placeholder={t('confirm_your_password')}
              secureTextEntry
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              errorMessage={confirmPasswordError}
            />
          </View>

          <CustomButton
            title={loading ? t('processing') : t('next')}
            onPress={handleNext}
            loading={loading}
            disabled={loading}
          />
        </View>
      </SafeAreaView>
    </KeyboardAvoidScrollview>
  );
};
