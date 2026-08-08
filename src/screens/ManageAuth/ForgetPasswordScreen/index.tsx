import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { colors } from '../../../styles/colors';
import { mvs } from '../../../config/metrices';
import { CustomButton } from '../../../components/common/CustomButton';
import { Header2 } from '../../../components/common/Header2';
import { LogoPng } from '../../../assets/images';
import { CustomText } from '../../../components/common/CustomText';
import PhoneNumberInput from '../../../components/common/PhoneTextInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './style';
import { CustomTextInput } from '@components/common/CustomTextInput';
import { useTranslation } from 'react-i18next';
import { apiClient } from '@services/api/api-client';
import { API } from '@services/api/api-endpoint';
import { Toast } from 'toastify-react-native';
import parsePhoneNumberFromString, { CountryCode } from 'libphonenumber-js';

interface ForgetPasswordScreenProps {
  navigation: any;
}

export function ForgetPasswordScreen({
  navigation,
}: ForgetPasswordScreenProps) {
  const { t, i18n } = useTranslation();
  const [selectedTab, setSelectedTab] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('SA');
  const [phoneError, setPhoneError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
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
            <Image source={LogoPng} style={{ width: 300, height: 131, resizeMode: 'contain' }} />
          </View>

          <View style={{ ...styles.title }}>
            <CustomText text={t('forget_password')} />
          </View>
          <View style={styles.content}>
            <Text style={styles.TextContent}>
              {t('forget_password_description')}
            </Text>
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                selectedTab === 'email' && styles.activeTab,
              ]}
              onPress={() => setSelectedTab('email')}
              accessibilityRole="tab"
              accessibilityState={{ selected: selectedTab === 'email' }}
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
              accessibilityRole="tab"
              accessibilityState={{ selected: selectedTab === 'phone' }}
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

          <View style={{ marginTop: mvs(25) }}>
            {selectedTab === 'email' ? (
              <CustomTextInput
                label={t('email_address')}
                placeholder={t('enter_email')}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setEmailError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                errorMessage={emailError}
              />
            ) : (
              <>
                <Text style={[styles.label, i18n.language === 'ar' && { textAlign: 'right' }]}>{t('phone_number')}</Text>
                <PhoneNumberInput
                  phone={phone}
                  setPhone={(text) => {
                    setPhone(text);
                    setPhoneError('');
                    setErrorMessage('');
                  }}
                  countryCode={countryCode}
                  setCountryCode={(code) => {
                    setCountryCode(code);
                    setPhoneError('');
                    setErrorMessage('');
                  }}
                  phoneError={phoneError}
                  errorMessage={errorMessage}
                  onValidationChange={setIsPhoneValid}
                  CustomStyle={{ backgroundColor: colors.white }}
                />
              </>
            )}
          </View>

          <CustomButton
            title={t('next')}
            onPress={async () => {
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

              if (!valid || loading) {
                return;
              }

              setLoading(true);
              setErrorMessage('');
              setEmailError('');
              setPhoneError('');

              try {
                if (selectedTab === 'email') {
                  const response = await apiClient.post(API.AUTH.FORGOT_PASSWORD_EMAIL, {
                    email: email.trim(),
                  });

                  if (response.data?.success === false) {
                    Toast.error(response.data?.message || 'Failed to send OTP');
                    setLoading(false);
                    return;
                  }

                  Toast.success(response.data?.message || 'OTP sent successfully');
                  navigation.navigate('OTPScreen', {
                    source: 'forgotPassword',
                    method: 'email',
                    email: email.trim(),
                  });
                } else {
                  // Backend validates the number for this flow via `type`.
                  // Only send the OTP when it responds success:true; otherwise it
                  // returns the reason (e.g. "Phone number is not registered").
                  let checkData: any;
                  try {
                    const checkRes = await apiClient.post(API.AUTH.CHECK_PHONE_NO, {
                      phoneNo: phone.trim(),
                      type: 'forgot-password',
                    });
                    checkData = checkRes?.data;
                  } catch (checkErr: any) {
                    checkData = checkErr?.response?.data || checkErr?.data;
                  }
                  if (checkData?.success !== true) {
                    const msg = checkData?.message || t('phone_not_registered');
                    setPhoneError(msg);
                    Toast.error(msg);
                    setLoading(false);
                    return;
                  }

                  // Phone: backend sends the OTP (same as the email flow)
                  const phoneNumber = parsePhoneNumberFromString(phone, countryCode as CountryCode);
                  const formattedPhone = phoneNumber
                    ? `+${phoneNumber.countryCallingCode}${phoneNumber.nationalNumber}`
                    : `+${phone}`;

                  const response = await apiClient.post(API.AUTH.FORGOT_PASSWORD_PHONE, {
                    phoneNo: formattedPhone,
                  });

                  if (response.data?.success === false) {
                    const msg = response.data?.message || 'Failed to send OTP';
                    setPhoneError(msg);
                    Toast.error(msg);
                    setLoading(false);
                    return;
                  }

                  Toast.success(response.data?.message || t('otp_sent_successfully'));
                  navigation.navigate('OTPScreen', {
                    source: 'forgotPassword',
                    method: 'phone',
                    phone: phone.trim(),
                    countryCode,
                  });
                }
              } catch (error: any) {
                console.error('Forgot password error:', error);
                // Backend messages (e.g. "Phone number is invalid.") are
                // user-friendly — surface them, else fall back to a generic one.
                const message =
                  error?.response?.data?.message ||
                  error?.data?.message ||
                  t('something_went_wrong_try_later') ||
                  'Something went wrong. Please try again later.';

                Toast.error(message);

                if (selectedTab === 'email') {
                  setEmailError(message);
                } else {
                  setPhoneError(message);
                }
              } finally {
                setLoading(false);
              }
            }}
            loading={loading}
            disabled={loading}
          />

          <View style={styles.signinRow}>
            <Text style={styles.TextContent}>{t('remember_password')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
              <Text style={styles.signinLink}>{t('sign_in')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
