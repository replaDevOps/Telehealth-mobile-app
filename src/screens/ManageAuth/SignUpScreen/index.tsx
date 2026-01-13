import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '../../../styles/colors';
import { mvs } from '../../../config/metrices';
import { CustomButton } from '../../../components/common/CustomButton';
import { Header2 } from '../../../components/common/Header2';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { GoogleSvg, LogoSvg } from '../../../assets/icons';
import { CustomText } from '../../../components/common/CustomText';
import PhoneNumberInput from '../../../components/common/PhoneTextInput';
import { styles } from './style';
import { SafeAreaView } from 'react-native-safe-area-context';
import parsePhoneNumberFromString, { CountryCode } from 'libphonenumber-js';
import { CustomTextInput } from '@components/common/CustomTextInput';
import { useTranslation } from 'react-i18next';
import { API } from '@services/api/api-endpoint';
import { apiClient } from '@services/api/api-client';
import { Toast } from 'toastify-react-native';

export function SignUpScreen({ navigation }) {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [countryCode, setCountryCode] = useState('SA');
  const [phoneError, setPhoneError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [rememberError, setRememberError] = useState(false);
  const [loading, setLoading] = useState(false);

  const phoneNumber = parsePhoneNumberFromString(
    phone,
    countryCode as CountryCode,
  );
  const formattedPhone = phoneNumber
    ? `+${phoneNumber.countryCallingCode}${phoneNumber.nationalNumber}`
    : `+${phone}`;

  const handleSignUp = async () => {
    let valid = true;

    if (selectedTab === 'email') {
      if (!email.trim() || !email.includes('@')) {
        setEmailError(t('invalid_email'));
        valid = false;
      } else {
        setEmailError('');
      }
    } else {
      if (!phone.trim() || !isPhoneValid) {
        setPhoneError(t('invalid_phone'));
        valid = false;
      } else {
        setPhoneError('');
      }
    }

    if (!isChecked) {
      setRememberError(true);
      valid = false;
    } else {
      setRememberError(false);
    }

    if (valid) {
      try {
        setLoading(true);
        const endPoint =
          selectedTab === 'email'
            ? API.AUTH.SEND_OTP_EMAIL
            : API.AUTH.SEND_OTP_PHONE;

        const payload =
          selectedTab === 'email' ? { email } : { phoneNo: formattedPhone };

        const { data } = await apiClient.post(endPoint, payload);
        Toast.success(data.message);
        navigation.navigate('OTPScreen', {
          source: 'signUp',
          method: selectedTab, // 'email' or 'phone'
          email: selectedTab === 'email' ? email : undefined,
          phone: selectedTab === 'phone' ? phone : undefined,
          countryCode: selectedTab === 'phone' ? countryCode : undefined,
        });
      } catch (error: any) {
        console.log('error', error);
        Toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Header2 title="" showLanguage={true} />
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: mvs(30) }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <LogoSvg />
          </View>

          <View style={{ ...styles.title }}>
            <CustomText text={t('sign_up')} />
          </View>
          <View style={styles.content}>
            <Text style={styles.TextContent}>{t('join_journey')}</Text>
          </View>

          {/* Tabs for Email / Phone */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                selectedTab === 'email' && styles.activeTab,
              ]}
              onPress={() => setSelectedTab('email')}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === 'email' && styles.activeTabText,
                ]}
              >
                {t('email_address')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                selectedTab === 'phone' && styles.activeTab,
              ]}
              onPress={() => setSelectedTab('phone')}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === 'phone' && styles.activeTabText,
                ]}
              >
                {t('phone_number')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Input Fields */}
          <View style={{ marginTop: mvs(25) }}>
            {selectedTab === 'email' ? (
              <CustomTextInput
                label={t('email_address')}
                placeholder={t('enter_email')}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                errorMessage={emailError}
              />
            ) : (
              <>
                <Text style={styles.label}>{t('phone_number')}</Text>
                <PhoneNumberInput
                  phone={phone}
                  setPhone={setPhone}
                  countryCode={countryCode}
                  setCountryCode={setCountryCode}
                  phoneError={phoneError}
                  errorMessage={errorMessage}
                  onValidationChange={setIsPhoneValid}
                  CustomStyle={{ backgroundColor: colors.white }}
                />
              </>
            )}
          </View>

          {/* Sign Up Button */}
          <CustomButton
            title={t('sign_up')}
            onPress={handleSignUp}
            loading={loading}
          />

          <View style={styles.signinRow}>
            <Text style={styles.TextContent}>{t('already_account')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
              <Text style={styles.signinLink}>{t('sign_in')}</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.line} />
            <Text style={styles.orText}>{t('or')}</Text>
            <View style={styles.line} />
          </View>

          {/* Apple Sign Up */}
          <TouchableOpacity
            style={styles.appleButton}
            onPress={() => console.log('Apple Sign Up')}
          >
            <AntDesign name="apple1" size={20} color={colors.white} />
            <Text style={styles.appleText}>{t('sign_up_apple')}</Text>
          </TouchableOpacity>

          {/* Google Sign Up */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={() => console.log('Google Sign Up')}
          >
            <GoogleSvg />
            <Text style={styles.googleText}>{t('sign_up_google')}</Text>
          </TouchableOpacity>

          {/* Terms & Conditions */}
          <View style={styles.termsRow}>
            <TouchableOpacity
              onPress={() => {
                setIsChecked(!isChecked);
                if (rememberError) setRememberError(false);
              }}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isChecked }}
            >
              <Ionicons
                name={isChecked ? 'checkbox' : 'square-outline'}
                size={22}
                color={
                  rememberError
                    ? 'red'
                    : isChecked
                    ? colors.primary
                    : colors.border
                }
              />
            </TouchableOpacity>

            <Text style={styles.TextContent}>
              {t('terms_agreement')}
              <Text style={styles.linkText}>{t('terms_conditions')}</Text>
              {t('and')}
              <Text style={styles.linkText}>{t('privacy_policy')}</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
