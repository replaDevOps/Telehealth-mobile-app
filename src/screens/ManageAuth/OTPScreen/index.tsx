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
  const [inputValues, setInputValues] = useState<string[]>(Array(5).fill(''));

  const inputRefs = useRef<RefObject<TextInput | null>[]>([]);
  const lastSubmittedOtp = useRef<string>('');

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

  const handleNext = useCallback(async () => {
    if (inputValues.some(value => value.length !== 1)) {
      console.log('Invalid OTP', inputValues);
      Toast.error(t('please_enter_valid_otp'));
      return;
    }
    const otp = inputValues.join('');
    
    // Prevent duplicate submissions
    if (lastSubmittedOtp.current === otp && loading) {
      return;
    }
    
    try {
      setLoading(true);
      lastSubmittedOtp.current = otp;
      console.log('OTP submitted:', otp);

      const { data } = await apiClient.post(API.AUTH.VERIFY_OTP, {
        otp,
      });
      console.log("🚀 ~ handleNext ~ data:", data)
      Toast.success(data.message);
      if (source === 'forgotPassword') {
        navigation.navigate('SetPassword');
      } else {
        navigation.navigate('CreatePassword');
      }
    } catch (error: any) {
      Toast.error(error.message);
      lastSubmittedOtp.current = ''; // Reset on error so user can retry
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }, [inputValues, loading, source, navigation, t]);

  const handleChangeText = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '');
    const newValues = [...inputValues];
    newValues[index] = digit;
    setInputValues(newValues);

    if (digit && index < 4) {
      inputRefs.current[index + 1]?.current?.focus();
    }
  };

  useEffect(() => {
    const filled = inputValues.every(v => v.length === 1);
    const otp = inputValues.join('');
    if (filled && !loading && lastSubmittedOtp.current !== otp) {
      handleNext();
    }
  }, [inputValues, loading, handleNext]);

  async function handleResendOTP() {
    setLoading(true);
    const endPoint = method === 'email' ? API.AUTH.RESEND_OTP_EMAIL : API.AUTH.RESEND_OTP_PHONE;
    const payload = method === 'email' ? { email } : { phoneNo: phone };
    const [data,err]= await tryCatch(apiClient.post(endPoint, payload));
    if (err) {
      Toast.error((err as Error).message);
      setLoading(false);
      return;
    }
    Toast.success(data.data.message);
    setLoading(false);
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
            <TouchableOpacity onPress={handleResendOTP}>
              <Text style={styles.signinLink}>{t('resend_code')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidScrollview>
  );
};
