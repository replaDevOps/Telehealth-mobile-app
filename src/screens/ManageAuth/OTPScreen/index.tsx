import React, {
  useEffect,
  useRef,
  useState,
  createRef,
  RefObject,
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
import parsePhoneNumberFromString from 'libphonenumber-js';

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

  const handleChangeText = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '');
    const newValues = [...inputValues];
    newValues[index] = digit;
    setInputValues(newValues);

    if (digit && index < 4) {
      inputRefs.current[index + 1]?.current?.focus();
    }

    const filled = newValues.every(v => v.length === 1);
    setLoading(filled);
  };

  const handleNext = () => {
    const otp = inputValues.join('');
    console.log('OTP submitted:', otp);

    if (source === 'forgotPassword') {
      navigation.navigate('SetPassword');
    } else {
      navigation.navigate('CreatePassword');
    }
  };

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
        const phoneNumber = parsePhoneNumberFromString(phone, countryCode);
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
                onChangeText={t => handleChangeText(t, idx)}
                value={inputValues[idx]}
                autoFocus={idx === 0 && isFocused}
              />
            ))}
          </View>

          <CustomButton
            title={loading ? t('verifying') : t('confirm')}
            onPress={handleNext}
            // disabled={!loading}
          />

          <View style={styles.signinRow}>
            <Text style={styles.TextContent}>{t('didnt_receive_code')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
              <Text style={styles.signinLink}>{t('resend_code')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidScrollview>
  );
};
