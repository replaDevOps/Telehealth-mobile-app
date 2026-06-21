import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Image,
} from 'react-native';
import { colors } from '../../../styles/colors';
import { mvs } from '../../../config/metrices';
import { CustomButton } from '../../../components/common/CustomButton';
import { Header2 } from '../../../components/common/Header2';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { GoogleSvg } from '../../../assets/icons';
import { LogoPng } from '../../../assets/images';
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
import { sendPhoneOtp } from '@services/firebase/phoneAuth';
import { setPhoneConfirmation } from '@services/firebase/phoneAuthStore';
import { signInWithGoogle, googleStatusCodes } from '@services/firebase/googleAuth';
import { useAuthStore } from '@store';
import { fcmService } from '../../../services/firebase/fcmService';

const isValidEmailFormat = (value: string): boolean => {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  return trimmed.includes('@') && trimmed.indexOf('@') > 0 && trimmed.includes('.', trimmed.indexOf('@')) && trimmed.length > trimmed.indexOf('@') + 1;
};

export function SignUpScreen({ navigation }) {
  const { t } = useTranslation();
  const { setAuth } = useAuthStore();
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
    // Dismiss keyboard when Sign Up button is pressed
    Keyboard.dismiss();
    
    let valid = true;

    if (selectedTab === 'email') {
      if (!isValidEmailFormat(email)) {
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
      Toast.warn(t('please_accept_terms') || 'Please accept the Terms & Conditions and Privacy Policy to continue.');
      valid = false;
    } else {
      setRememberError(false);
    }

    if (valid) {
      try {
        setLoading(true);

        if (selectedTab === 'phone') {
          console.log("formattedPhone",formattedPhone)
          const confirmation = await sendPhoneOtp(formattedPhone);
          setPhoneConfirmation(confirmation);
          Toast.success(t('otp_sent_successfully'));
          navigation.navigate('OTPScreen', {
            source: 'signUp',
            method: 'phone',
            phone,
            countryCode,
          });
        } else {
          const { data } = await apiClient.post(API.AUTH.SEND_OTP_EMAIL, {
            email,
          });
          Toast.success(data.message);
          navigation.navigate('OTPScreen', {
            source: 'signUp',
            method: 'email',
            email,
          });
        }
      } catch (error: any) {
        console.log('error', error);
        Toast.error(error?.message || t('something_went_wrong'));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      const { accessToken } = await signInWithGoogle();
      if (!accessToken) throw new Error('No access token returned from Google');

      const { data } = await apiClient.post(API.AUTH.LOGIN_GOOGLE, { accessToken });
      console.log('✅ [Google] API response:', JSON.stringify(data, null, 2));
      setAuth(data?.user);

      fcmService.initializeFcm().catch(err =>
        console.warn('[FCM] Token store after Google sign-up failed:', err),
      );

      Toast.success(data?.message || 'Google sign-up successful');
      setTimeout(() => {
        if (data?.is_new_user) {
          navigation.replace('Profile', {
            name: data?.user?.name || data?.user?.fullName || '',
            email: data?.user?.email || '',
          });
        } else {
          navigation.replace('Main', { screen: 'Home' });
        }
      }, 500);
    } catch (error: any) {
      if (error?.code === googleStatusCodes.SIGN_IN_CANCELLED) {
        return;
      }
      const errorMsg =
        error?.response?.data?.data?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Google sign-up failed';
      console.error('❌ [Google] Sign-up error:', error);
      Toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
       
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: mvs(30) }}
          keyboardShouldPersistTaps="handled"
        >
           <Header2 title="" showLanguage={true} inScrollView={true} />
          <View style={styles.logoContainer}>
            <Image source={LogoPng} style={{ width: 300, height: 131, resizeMode: 'contain' }} />
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
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError && isValidEmailFormat(text)) setEmailError('');
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
                    if (phoneError) setPhoneError('');
                    if (errorMessage) setErrorMessage('');
                  }}
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

          {/* Apple Sign Up (only on iOS) */}
          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={styles.appleButton}
              onPress={() => console.log('Apple Sign Up')}
            >
              <AntDesign name="apple1" size={20} color={colors.white} />
              <Text style={styles.appleText}>{t('sign_up_apple')}</Text>
            </TouchableOpacity>
          )}

          {/* Google Sign Up */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignUp}
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
              <Text 
                style={styles.linkText}
                onPress={() => navigation.navigate('PolicyScreen', { type: 'terms' })}
              >
                {t('terms_conditions')}
              </Text>
              {t('and')}
              <Text 
                style={styles.linkText}
                onPress={() => navigation.navigate('PolicyScreen', { type: 'privacy' })}
              >
                {t('privacy_policy')}
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
