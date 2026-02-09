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
import { LogoSvg } from '../../../assets/icons';
import { CustomText } from '../../../components/common/CustomText';
import PhoneNumberInput from '../../../components/common/PhoneTextInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './style';
import { CustomTextInput } from '@components/common/CustomTextInput';
import { useTranslation } from 'react-i18next';
import { apiClient } from '@services/api/api-client';
import { API } from '@services/api/api-endpoint';
import { Toast } from 'toastify-react-native';

interface ForgetPasswordScreenProps {
  navigation: any;
}

export function ForgetPasswordScreen({
  navigation,
}: ForgetPasswordScreenProps) {
  const { t } = useTranslation();
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
            <LogoSvg />
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
                <Text style={styles.label}>{t('phone_number')}</Text>
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
                let response;

                if (selectedTab === 'email') {
                  // Call forgot password by email API
                  response = await apiClient.post(API.AUTH.FORGOT_PASSWORD_EMAIL, {
                    email: email.trim(),
                  });
                } else {
                  console.log('phone', phone);
                  // Call forgot password by phone API
                  response = await apiClient.post(API.AUTH.FORGOT_PASSWORD_PHONE, {
                    phoneNo: phone.trim(),
                  });
                }

                // Check for success: false in response
                if (response.data?.success === false) {
                  const errorMsg = response.data?.message || 'Failed to send OTP';
                  Toast.error(errorMsg);
                  setLoading(false);
                  return;
                }

                // Success - show success message and navigate to OTP screen
                const successMessage = response.data?.message || 'OTP sent successfully';
                Toast.success(successMessage);

                navigation.navigate('OTPScreen', {
                  source: 'forgotPassword',
                  method: selectedTab, // 'email' or 'phone'
                  email: selectedTab === 'email' ? email.trim() : undefined,
                  phone: selectedTab === 'phone' ? phone.trim() : undefined,
                  countryCode:
                    selectedTab === 'phone' ? countryCode : undefined,
                });
              } catch (error: any) {
                console.error('Forgot password error:', error);
                const errorMsg =
                  error?.response?.data?.message ||
                  error?.data?.message ||
                  error?.message ||
                  'Failed to send OTP. Please try again.';

                Toast.error(errorMsg);

                // Set field-specific error
                if (selectedTab === 'email') {
                  setEmailError(errorMsg);
                } else {
                  setPhoneError(errorMsg);
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
