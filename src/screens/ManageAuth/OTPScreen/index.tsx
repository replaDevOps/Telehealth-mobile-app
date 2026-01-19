import React, {
  useEffect,
  useRef,
  useState,
  createRef,
  RefObject,
  useCallback,
} from 'react';
import { TextInput, TouchableOpacity, View, Text } from 'react-native';
import { useIsFocused, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import styles from './style';
import { KeyboardAvoidScrollview } from '../../../components/common/keyboard-avoid-scrollview';
import { LogoSvg } from '../../../assets/icons';
import { Header2 } from '../../../components/common/Header2';
import CustomText from '../../../components/common/CustomText';
import { CustomButton } from '../../../components/common/CustomButton';
import { useTranslation } from 'react-i18next';
import { AuthStackParamList } from '../../../navigation/AuthNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import parsePhoneNumberFromString, { CountryCode } from 'libphonenumber-js';
import { Toast } from 'toastify-react-native';
import { API } from '@services/api/api-endpoint';
import { apiClient } from '@services/api/api-client';
import { tryCatch } from '@utils';

type NavProps = StackNavigationProp<AuthStackParamList, 'OTPScreen'>;
type RouteProps = RouteProp<AuthStackParamList, 'OTPScreen'>;

interface Props {
  navigation: NavProps;
  route: RouteProps;
}

export const NumberVerification: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [inputValues, setInputValues] = useState<string[]>(Array(5).fill(''));
  const [timer, setTimer] = useState(60); // 60 seconds = 1 minute

  const inputRefs = useRef<RefObject<TextInput | null>[]>([]);
  const lastSubmittedOtp = useRef<string>('');
  const isSubmittingRef = useRef<boolean>(false);
  const timerIntervalRef = useRef<any>(null);

  const source = route.params?.source;
  const method = route.params?.method;
  const email = route.params?.email;
  const phone = route.params?.phone;
  const countryCode = route.params?.countryCode;

  useEffect(() => {
    inputRefs.current = Array(5)
      .fill(null)
      .map(() => createRef<TextInput>());
  }, []);

  // Timer countdown effect
  useEffect(() => {
    // Clear any existing interval first
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    // Only start timer if timer > 0
    if (timer > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            if (timerIntervalRef.current) {
              clearInterval(timerIntervalRef.current);
              timerIntervalRef.current = null;
            }
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }

    // Cleanup on unmount or when timer changes
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [timer]);

  // Format timer to MM:SS
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNext = useCallback(async () => {
    if (inputValues.some(value => value.length !== 1)) {
      console.log('Invalid OTP', inputValues);
      Toast.error(t('please_enter_valid_otp'));
      return;
    }
    const otp = inputValues.join('');
    
    // Prevent duplicate submissions - check multiple conditions
    if (isSubmittingRef.current || loading) {
      console.log('Submission already in progress, skipping...');
      return;
    }
    
    if (lastSubmittedOtp.current === otp) {
      console.log('Same OTP already submitted, skipping...');
      return;
    }
    
    try {
      isSubmittingRef.current = true;
      setLoading(true);
      lastSubmittedOtp.current = otp;
      console.log('OTP submitted:', otp);

      // Use different endpoint based on source
      const endpoint = source === 'forgotPassword' 
        ? API.AUTH.VERIFY_OTP_PASSWORD 
        : API.AUTH.VERIFY_OTP;

      const response = await apiClient.post(endpoint, {
        otp,
      });

      // Check for success: false in response
      if (response.data?.success === false) {
        const errorMessage = response.data?.message || 'Invalid OTP';
        Toast.error(errorMessage);
        // Clear all inputs on error
        setInputValues(Array(5).fill(''));
        lastSubmittedOtp.current = ''; // Reset on error so user can retry
        setLoading(false);
        isSubmittingRef.current = false;
        // Focus back to first input
        setTimeout(() => {
          const firstRef = inputRefs.current[0];
          if (firstRef?.current) {
            firstRef.current.focus();
          }
        }, 100);
        return;
      }

      const successMessage = response.data?.message || 'OTP verified successfully';
      Toast.success(successMessage);
      
      if (source === 'forgotPassword') {
        // Extract token from response for password reset
        const token = response.data?.data?.token || response.data?.token;
        navigation.navigate('SetPassword', {
          token: token,
        });
      } else {
        // Pass email/phone data to CreatePassword screen
        navigation.navigate('CreatePassword', {
          email,
          phone,
          countryCode,
        });
      }
      isSubmittingRef.current = false;
    } catch (error: any) {
      console.error('OTP verification error:', error);
      const errorMessage = 
        error?.response?.data?.message || 
        error?.data?.message ||
        error?.message || 
        'Failed to verify OTP';
      Toast.error(errorMessage);
      // Clear all inputs on error
      setInputValues(Array(5).fill(''));
      lastSubmittedOtp.current = ''; // Reset on error so user can retry
      setLoading(false);
      isSubmittingRef.current = false;
      // Focus back to first input
      setTimeout(() => {
        const firstRef = inputRefs.current[0];
        if (firstRef?.current) {
          firstRef.current.focus();
        }
      }, 100);
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  }, [inputValues, source, navigation, email, phone, countryCode, t]);

  const handleChangeText = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '').slice(0, 1); // Only take first digit
    const newValues = [...inputValues];
    newValues[index] = digit;
    setInputValues(newValues);

    // Focus next input if a digit was entered and not on last input
    if (digit && index < 4) {
      // Use setTimeout to ensure focus happens after state update and render
      setTimeout(() => {
        const nextRef = inputRefs.current[index + 1];
        if (nextRef?.current) {
          nextRef.current.focus();
        }
      }, 0);
    }
  };

  const handleKeyPress = (event: any, index: number) => {
    // Handle backspace key
    if (event.nativeEvent.key === 'Backspace') {
      const newValues = [...inputValues];
      
      // If current field has a value, clear it
      if (newValues[index]) {
        newValues[index] = '';
        setInputValues(newValues);
      } else if (index > 0) {
        // If current field is empty, move to previous field and clear it
        newValues[index - 1] = '';
        setInputValues(newValues);
        setTimeout(() => {
          const prevRef = inputRefs.current[index - 1];
          if (prevRef?.current) {
            prevRef.current.focus();
          }
        }, 0);
      }
    }
  };

  useEffect(() => {
    const filled = inputValues.every(v => v.length === 1);
    const otp = inputValues.join('');
    
    // Only auto-submit if:
    // 1. All fields are filled
    // 2. Not currently loading
    // 3. Not already submitting
    // 4. OTP hasn't been submitted before
    // 5. All fields have exactly 1 digit
    if (
      filled && 
      !loading && 
      !isSubmittingRef.current && 
      lastSubmittedOtp.current !== otp &&
      otp.length === 5
    ) {
      handleNext();
    }
  }, [inputValues, loading, handleNext]);

  async function handleResendOTP() {
    // Don't allow resend if timer is still active
    if (timer > 0) {
      return;
    }

    setResendLoading(true);
    const endPoint = method === 'email' ? API.AUTH.RESEND_OTP_EMAIL : API.AUTH.RESEND_OTP_PHONE;
    
    let payload;
    if (method === 'email') {
      console.log('email', email);
      // Use email from route params
      payload = { email: email };
    } else {
      // Format phone number properly with country code
      if (phone && countryCode) {
        const phoneNumber = parsePhoneNumberFromString(
          phone,
          countryCode as CountryCode,
        );
        const formattedPhone = phoneNumber
          ? `+${phoneNumber.countryCallingCode}${phoneNumber.nationalNumber}`
          : phone;
        payload = { phoneNo: formattedPhone };
      } else {
        Toast.error('Phone number is required');
        setResendLoading(false);
        return;
      }
    }
    
    const [,err]= await tryCatch(apiClient.post(endPoint, payload));
    if (err) {
      const errorMessage = 
        (err as any)?.response?.data?.message ||
        (err as any)?.response?.data?.data?.message ||
        (err as Error).message ||
        'Failed to resend OTP';
      Toast.error(errorMessage);
      setResendLoading(false);
      return;
    }
    
    // Show success message
    Toast.success('New code sent successfully');
    
    // Reset timer to 60 seconds
    setTimer(60);
    
    // Clear inputs to allow entering new OTP
    setInputValues(Array(5).fill(''));
    lastSubmittedOtp.current = '';
    
    setResendLoading(false);
    
    // Focus back to first input
    setTimeout(() => {
      const firstRef = inputRefs.current[0];
      if (firstRef?.current) {
        firstRef.current.focus();
      }
    }, 100);
  }

  const getDisplayText = () => {
    if (method === 'email') {
      if (email) {
        const [localPart, domain] = email.split('@');
        const maskedEmail =
          localPart.length > 2
            ? `${localPart.substring(0, 2)}***@${domain}`
            : `***@${domain}`;
        return maskedEmail;
      }
      return '***@gmail.com';
    } else if (method === 'phone') {
      if (phone && countryCode) {
        const phoneNumber = parsePhoneNumberFromString(
          phone,
          countryCode as CountryCode,
        );
        if (phoneNumber) {
          const maskedPhone = `+${
            phoneNumber.countryCallingCode
          }${phoneNumber.nationalNumber.substring(0, 2)}**********`;
          return maskedPhone;
        }
      }
      return '+92***';
    }
    return '+91****4@gmail.com';
  };

  return (
    <KeyboardAvoidScrollview>
      <SafeAreaView style={{ flex: 1 }}>
        <Header2 title="" showLanguage={true} />

        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <LogoSvg />
          </View>

          <View style={styles.title}>
            <CustomText text={t('otp_code')} />
          </View>

          <View style={styles.content}>
            <Text style={styles.TextContent}>
              {method === 'email'
                ? `${t('enter_otp_email')} ${getDisplayText()}`
                : `${t('enter_otp_phone')} ${getDisplayText()}`}
            </Text>
          </View>

          <View style={styles.inputContainer}>
            {Array.from({ length: 5 }).map((_, idx) => (
              <TextInput
                key={idx}
                ref={inputRefs.current[idx] ?? undefined}
                style={styles.inputBox}
                maxLength={1}
                keyboardType="numeric"
                onChangeText={value => handleChangeText(value, idx)}
                onKeyPress={(e) => handleKeyPress(e, idx)}
                value={inputValues[idx]}
                autoFocus={idx === 0 && isFocused}
              />
            ))}
          </View>

          <CustomButton
            title={loading ? t('verifying') : t('confirm')}
            onPress={handleNext}
            loading={loading}
            disabled={loading}
          />

          <View style={styles.signinRow}>
            <Text style={styles.TextContent}>{t('didnt_receive_code')}</Text>
            <TouchableOpacity 
              onPress={handleResendOTP}
              disabled={timer > 0 || resendLoading}
            >
              {resendLoading ? (
                <Text style={styles.signinLink}>{t('sending')}...</Text>
              ) : timer > 0 ? (
                <Text style={[styles.signinLink, { opacity: 0.5 }]}>
                  {t('resend_code')} ({formatTimer(timer)})
                </Text>
              ) : (
                <Text style={styles.signinLink}>{t('resend_code')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidScrollview>
  );
};
