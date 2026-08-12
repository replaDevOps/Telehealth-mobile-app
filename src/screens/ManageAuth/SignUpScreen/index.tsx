import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Image,
  ActivityIndicator,
  StatusBar,
  ImageBackground,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../../../styles/colors';
import { mvs } from '../../../config/metrices';
import { Header2 } from '../../../components/common/Header2';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { GoogleSvg } from '../../../assets/icons';
import { LogoPng, authBgLight, authBgDark } from '../../../assets/images';
import PhoneNumberInput from '../../../components/common/PhoneTextInput';
import { styles } from './style';
import { SafeAreaView } from 'react-native-safe-area-context';
import parsePhoneNumberFromString, { CountryCode } from 'libphonenumber-js';
import { CustomTextInput } from '@components/common/CustomTextInput';
import { useTranslation } from 'react-i18next';
import { API } from '@services/api/api-endpoint';
import { apiClient } from '@services/api/api-client';
import { Toast } from 'toastify-react-native';
import { signInWithGoogle, googleStatusCodes } from '@services/firebase/googleAuth';
import { signInWithApple, appleErrorCodes } from '@services/firebase/appleAuth';
import { useAuthStore } from '@store';
import { getMappedErrorMessage } from '@utils';
import { fcmService } from '../../../services/firebase/fcmService';

const isValidEmailFormat = (value: string): boolean => {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  return (
    trimmed.includes('@') &&
    trimmed.indexOf('@') > 0 &&
    trimmed.includes('.', trimmed.indexOf('@')) &&
    trimmed.length > trimmed.indexOf('@') + 1
  );
};

const getMappedMessage = (rawMsg: string, t: any) => {
  if (!rawMsg) return t('something_went_wrong');
  const msgLower = rawMsg.toLowerCase();
  if (
    msgLower.includes('already registered') ||
    msgLower.includes('already_registered') ||
    msgLower.includes('already exist')
  ) {
    return t('phone_already_registered');
  }
  if (msgLower.includes('invalid') && msgLower.includes('phone')) {
    return t('invalid_phone');
  }
  const translated = t(rawMsg);
  if (translated !== rawMsg) return translated;
  return rawMsg;
};

export function SignUpScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const { setAuth } = useAuthStore();

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  const phoneNumber = parsePhoneNumberFromString(
    phone,
    countryCode as CountryCode,
  );
  const formattedPhone = phoneNumber
    ? `+${phoneNumber.countryCallingCode}${phoneNumber.nationalNumber}`
    : `+${phone}`;

  // Load saved theme settings on mount
  useEffect(() => {
    const loadSavedTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('appTheme');
        if (savedTheme === 'light' || savedTheme === 'dark') {
          setTheme(savedTheme);
        }
      } catch (e) {
        console.warn('Failed to load theme', e);
      }
    };
    loadSavedTheme();
  }, []);

  const handleThemeChange = async (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem('appTheme', newTheme);
    } catch (e) {
      console.warn('Failed to save theme setting', e);
    }
  };

  const handleSignUp = async () => {
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
      Toast.warn(
        t('please_accept_terms') ||
          'Please accept the Terms & Conditions and Privacy Policy to continue.',
      );
      valid = false;
    } else {
      setRememberError(false);
    }

    if (valid) {
      try {
        setLoading(true);

        if (selectedTab === 'phone') {
          // The send-otp endpoint validates the number itself (e.g. returns
          // "Phone number is already registered"), so no pre-check is needed.
          const { data } = await apiClient.post(API.AUTH.SEND_OTP_PHONE, {
            phoneNo: formattedPhone,
          });
          if (data?.success === false) {
            const msg = data?.message || t('something_went_wrong');
            setPhoneError(msg);
            Toast.error(msg);
            setLoading(false);
            return;
          }

          Toast.success(getMappedErrorMessage(data?.message || 'otp_sent_successfully'));
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
          console.log('✅ API sign-up email response:', JSON.stringify(data, null, 2));

          Toast.success(getMappedErrorMessage(data?.message || 'otp_sent_successfully'));
          navigation.navigate('OTPScreen', {
            source: 'signUp',
            method: 'email',
            email,
          });
        }
      } catch (error: any) {
        console.log('error', error);
        // Backend errors (e.g. "Phone number is already registered") carry a
        // user-friendly message — surface it, otherwise fall back to a
        // friendly generic message.
        const backendMsg =
          error?.response?.data?.message || error?.data?.message;
        if (selectedTab === 'phone') {
          if (backendMsg) {
            const msg = getMappedMessage(backendMsg, t);
            setPhoneError(msg);
            Toast.error(msg);
          } else {
            const rawErrorDetail = error?.code || error?.message || 'Unknown Error';
            Toast.error(`${t('something_went_wrong')} (${rawErrorDetail})`);
          }
        } else {
          Toast.error(backendMsg || error?.message || t('something_went_wrong'));
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
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
      console.error('❌ [Google] Sign-up error:', error);
      const rawErrorDetail = error?.code || error?.message || 'Unknown Error';
      Toast.error(`${t('google_sign_in_failed')} (${rawErrorDetail})`);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAppleSignUp = async () => {
    setAppleLoading(true);
    try {
      const { identityToken, nonce, fullName, email, user } = await signInWithApple();

      // TODO: replace with the backend exchange once /patient-auth/login-with-apple
      // exists, mirroring handleGoogleSignUp: post the credential, setAuth(data.user),
      // initialise FCM, then navigate on data.is_new_user.
      console.log('✅ [Apple] Firebase uid:', user?.uid);
      console.log('✅ [Apple] identityToken:', identityToken);
      console.log('✅ [Apple] nonce (raw, unhashed):', nonce);
      // Apple sends these only on a user's first ever sign-in - persist them then.
      console.log('✅ [Apple] fullName:', fullName, '| email:', email);

      Toast.success('Apple sign-up successful');
    } catch (error: any) {
      if (error?.code === appleErrorCodes.CANCELED) {
        return;
      }
      console.error('❌ [Apple] Sign-up error:', error);
      const rawErrorDetail = error?.code || error?.message || 'Unknown Error';
      Toast.error(`Apple sign-up failed (${rawErrorDetail})`);
    } finally {
      setAppleLoading(false);
    }
  };

  const isLight = theme === 'light';
  const cardBg = isLight ? '#FFFFFF' : '#1A0D36';
  const cardBorder = isLight ? '#E8EBF0' : '#3A2E5B';
  const textCol = isLight ? colors.black : colors.white;
  const secTextCol = isLight ? colors.secondaryText : '#A8A8A9';

  const linkColor = isLight ? colors.primary : '#B388FF';
  const bgImage = isLight ? authBgLight : authBgDark;

  return (
    <ImageBackground source={bgImage} style={{ flex: 1 }} resizeMode="cover">
      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
        <StatusBar hidden={true} />
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: mvs(20),
              paddingTop: mvs(10),
              paddingBottom: mvs(30),
            }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header with theme / language toggles */}
            <Header2
              title=""
              showLanguage={true}
              inScrollView={true}
              theme={theme}
              onThemeChange={handleThemeChange}
              showLogoLeft={true}
            />

            {/* Rounded Card Container */}
            <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              {/* Center Logo */}
              <View style={styles.logoContainer}>
                <Image
                  source={LogoPng}
                  style={[styles.logo, theme === 'dark' && { tintColor: '#FFFFFF' }]}
                  resizeMode="contain"
                />
              </View>

              {/* Tagline */}
              <Text style={[styles.tagline, { color: secTextCol }]}>
                {t('beauty_tagline')}
              </Text>

              {/* Tab switch method switcher */}
              <View
                style={[
                  styles.tabContainer,
                  {
                    flexDirection: isRtl ? 'row-reverse' : 'row',
                    backgroundColor: isLight ? '#F1F3F8' : '#1D1236',
                  },
                ]}
              >
                {(['phone', 'email'] as ('email' | 'phone')[]).map(type => {
                  const isActive = selectedTab === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.tabButton,
                        isActive && [
                          styles.activeTab,
                          { backgroundColor: isLight ? '#FFFFFF' : '#3A2E5B' },
                        ],
                      ]}
                      onPress={() => {
                        setSelectedTab(type);
                        setPhoneError('');
                        setEmailError('');
                      }}
                    >
                      <Ionicons
                        name={type === 'email' ? 'mail-outline' : 'phone-portrait-outline'}
                        size={mvs(16)}
                        color={
                          isActive
                            ? isLight
                              ? '#7625D7'
                              : '#FFFFFF'
                            : isLight
                            ? '#545A65'
                            : '#A8A8A9'
                        }
                      />
                      <Text
                        style={[
                          styles.tabText,
                          {
                            color: isActive
                              ? isLight
                                ? '#7625D7'
                                : '#FFFFFF'
                              : isLight
                              ? '#545A65'
                              : '#A8A8A9',
                          },
                          isActive && styles.activeTabText,
                        ]}
                      >
                        {t(type === 'email' ? 'email_address_tab' : 'phone_number_tab')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Content inputs fields */}
              <View style={{ marginTop: mvs(10) }}>
                {selectedTab === 'email' ? (
                  <CustomTextInput
                    label={t('email_address')}
                    placeholder={t('enter_email')}
                    value={email}
                    onChangeText={text => {
                      setEmail(text);
                      if (emailError) setEmailError('');
                    }}
                    errorMessage={emailError}
                    theme={theme}
                    leftIconName="mail-outline"
                  />
                ) : (
                  <View style={{ marginBottom: mvs(16) }}>
                    <Text
                      style={[
                        styles.label,
                        { color: textCol },
                        isRtl && { textAlign: 'right' },
                      ]}
                    >
                      {t('phone_number')}
                    </Text>
                    <PhoneNumberInput
                      phone={phone}
                      setPhone={text => {
                        setPhone(text);
                        if (phoneError) setPhoneError('');
                      }}
                      countryCode={countryCode}
                      setCountryCode={setCountryCode}
                      phoneError={phoneError}
                      onValidationChange={setIsPhoneValid}
                      CustomStyle={{
                        backgroundColor: isLight ? colors.white : 'transparent',
                      }}
                      theme={theme}
                    />
                  </View>
                )}
              </View>

              {/* Terms and Conditions Consent */}
              <View
                style={[
                  styles.termsRow,
                  { flexDirection: isRtl ? 'row-reverse' : 'row' },
                ]}
              >
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
                        ? linkColor
                        : isLight
                        ? colors.border
                        : '#5C4E7E'
                    }
                  />
                </TouchableOpacity>

                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.termsText,
                      {
                        textAlign: isRtl ? 'right' : 'left',
                        color: secTextCol,
                      },
                    ]}
                  >
                    {t('terms_agreement')}
                    <Text
                      style={[styles.linkText, { color: linkColor }]}
                      onPress={() => navigation.navigate('PolicyScreen', { type: 'terms' })}
                    >
                      {t('terms_conditions')}
                    </Text>
                    {t('and')}
                    <Text
                      style={[styles.linkText, { color: linkColor }]}
                      onPress={() => navigation.navigate('PolicyScreen', { type: 'privacy' })}
                    >
                      {t('privacy_policy')}
                    </Text>
                  </Text>
                </View>
              </View>

              {/* Gradient CTA Sign Up button */}
              <TouchableOpacity
                style={styles.gradientButtonContainer}
                onPress={handleSignUp}
                disabled={loading || googleLoading}
              >
                <LinearGradient
                  colors={isLight ? ['#7625D7', '#9D4EDD'] : ['#7625D7', '#4A148C']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <View style={{ flexDirection: isRtl ? 'row-reverse' : 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={styles.gradientButtonText}>{t('sign_up')}</Text>
                      <Ionicons
                        name={isRtl ? 'arrow-back-outline' : 'arrow-forward-outline'}
                        size={18}
                        color="#FFFFFF"
                      />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Already have an account row */}
              <View style={[styles.signinRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <Text style={[styles.TextContent, { color: secTextCol }]}>
                  {t('already_account_prompt')}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                  <Text style={[styles.signinLink, { color: linkColor }]}>{t('sign_in_link')}</Text>
                </TouchableOpacity>
              </View>

              {/* Or Divider */}
              <View style={styles.dividerContainer}>
                <View style={[styles.line, { backgroundColor: isLight ? colors.border : '#3A2E5B' }]} />
                <Text style={[styles.orText, { color: secTextCol }]}>{t('or')}</Text>
                <View style={[styles.line, { backgroundColor: isLight ? colors.border : '#3A2E5B' }]} />
              </View>

              {/* Apple / Google buttons */}
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={[
                    styles.appleButton,
                    (loading || googleLoading || appleLoading) && { opacity: 0.6 },
                  ]}
                  onPress={handleAppleSignUp}
                  disabled={loading || googleLoading || appleLoading}
                >
                  {appleLoading ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <>
                      <AntDesign name="apple1" size={20} color={colors.white} />
                      <Text style={styles.appleText}>{t('sign_in_apple')}</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.googleButton,
                  {
                    backgroundColor: isLight ? '#F8F8FA' : 'rgba(29, 18, 54, 0.4)',
                    borderColor: isLight ? '#E0E0E0' : '#3A2E5B',
                    flexDirection: isRtl ? 'row-reverse' : 'row',
                  },
                  (loading || googleLoading) && { opacity: 0.6 },
                ]}
                onPress={handleGoogleSignUp}
                disabled={loading || googleLoading}
              >
                {googleLoading ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <GoogleSvg />
                    <Text
                      style={[
                        styles.googleText,
                        {
                          color: textCol,
                          marginLeft: isRtl ? 0 : mvs(10),
                          marginRight: isRtl ? mvs(10) : 0,
                        },
                      ]}
                    >
                      {t('sign_up_google')}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Footer Done by text info */}
            <View style={styles.footerContainer}>
              <Text style={[styles.footerText, { color: secTextCol }]}>
                {t('footer_done_by')}
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}
