import React, { useMemo, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  StatusBar,
  ImageBackground,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { mvs } from '@config/metrices';
import { Header2 } from '@components/common/Header2';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { GoogleSvg } from '@assets/icons';
import { LogoPng, LogoDarkPng, authBgLight, authBgDark } from '@assets/images';
import PhoneNumberInput from '@components/common/PhoneTextInput';
import { styles } from './style';
import { CustomTextInput } from '@components/common/CustomTextInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import parsePhoneNumberFromString, { CountryCode } from 'libphonenumber-js';
import { useTranslation } from 'react-i18next';
import { Toast } from 'toastify-react-native';
import { apiClient } from '@services/api/api-client';
import { colors } from '../../../styles/colors';
import { useAuthStore, useGuestStore } from '@store';
import { API } from '@services/api/api-endpoint';
import { fcmService } from '../../../services/firebase/fcmService';
import { signInWithGoogle, googleStatusCodes } from '../../../services/firebase/googleAuth';
import { signInWithApple, appleErrorCodes } from '../../../services/firebase/appleAuth';
import { getMappedErrorMessage } from '@utils';
import { returnFromAuth } from '@navigation/navigation-service';

type TabType = 'email' | 'phone';

export function SignInScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const { setAuth } = useAuthStore();
  const { continueAsGuest } = useGuestStore();
  const isRtl = i18n.language === 'ar';

  const handleContinueAsGuest = () => {
    continueAsGuest();
    // Reached both on a cold start and from a guest who was prompted to sign
    // in mid-browse and declined. The latter should land back where they were,
    // not on a second copy of Home stacked over the first.
    returnFromAuth();
  };

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [tab, setTab] = useState<TabType>('email');
  const [form, setForm] = useState({
    email: '',
    phone: '',
    password: '',
  });

  const [errors, setErrors] = useState({
    email: '',
    phone: '',
    password: '',
  });

  const [meta, setMeta] = useState({
    remember: false,
    rememberError: false,
    countryCode: 'SA' as CountryCode,
    isPhoneValid: false,
    loading: false,
  });

  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  const formattedPhone = useMemo(() => {
    if (!form.phone || typeof form.phone !== 'string') {
      return '';
    }

    const parsed = parsePhoneNumberFromString(form.phone, meta.countryCode);
    console.log('parsed', parsed);
    if (!parsed) return '';

    return parsed.format('E.164');
  }, [form.phone, meta.countryCode]);

  // Load saved credentials and theme settings on mount
  useEffect(() => {
    const loadSavedCredentials = async () => {
      try {
        console.log('🔍 Loading saved credentials...');
        const savedTab = await AsyncStorage.getItem('rememberMeTab');
        const savedEmail = await AsyncStorage.getItem('rememberMeEmail');
        const savedPhone = await AsyncStorage.getItem('rememberMePhone');
        const savedCountryCode = await AsyncStorage.getItem('rememberMeCountryCode');
        const savedTheme = await AsyncStorage.getItem('appTheme');
        
        if (savedTheme === 'light' || savedTheme === 'dark') {
          setTheme(savedTheme);
        }

        console.log('📦 Saved credentials:', {
          tab: savedTab,
          email: savedEmail ? '***' : null,
          phone: savedPhone ? '***' : null,
          countryCode: savedCountryCode,
        });
        
        if (savedTab && (savedEmail || savedPhone)) {
          console.log('✅ Found saved credentials, loading...');
          setTab(savedTab as TabType);
          
          if (savedEmail) {
            setForm(prev => ({ ...prev, email: savedEmail }));
            console.log('✅ Email loaded:', savedEmail);
          }
          
          if (savedPhone && savedCountryCode) {
            setForm(prev => ({ ...prev, phone: savedPhone }));
            setMeta(prev => ({ ...prev, countryCode: savedCountryCode as CountryCode }));
            console.log('✅ Phone loaded:', savedPhone, 'Country:', savedCountryCode);
          }
          
          setMeta(prev => ({ ...prev, remember: true }));
          console.log('✅ Remember me checkbox set to checked');
        } else {
          console.log('ℹ️ No saved credentials found');
        }
      } catch (error) {
        console.error('❌ Error loading saved credentials:', error);
      }
    };

    loadSavedCredentials();
  }, []);

  const handleThemeChange = async (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem('appTheme', newTheme);
    } catch (e) {
      console.warn('Failed to save theme setting', e);
    }
  };

  const validate = (): boolean => {
    const nextErrors = { email: '', phone: '', password: '' };
    let valid = true;

    if (tab === 'email') {
      if (!form.email || !form.email.includes('@')) {
        nextErrors.email = t('invalid_email');
        valid = false;
      }
      nextErrors.phone = '';
    } 
    else if (tab === 'phone') {
      nextErrors.email = '';
      if (!form.phone || !meta.isPhoneValid) {
        nextErrors.phone = t('invalid_phone');
        valid = false;
      }
    }

    if (!form.password) {
      nextErrors.password = t('password_required');
      valid = false;
    }

    setErrors(nextErrors);
    return valid;
  };

  const handleSignIn = async () => {
    if (!validate()) return;

    setMeta(prev => ({ ...prev, loading: true }));
    try {
      const payload =
        tab === 'email'
          ? { email: form.email, password: form.password }
          : {
              phoneNo: formattedPhone,
              phone: formattedPhone,
              phone_no: formattedPhone,
              password: form.password,
            };

      console.log('🚀 Login payload:', JSON.stringify(payload, null, 2));

      const endpoint = tab === 'email' ? API.AUTH.LOGIN_EMAIL : API.AUTH.LOGIN_PHONE;
      const { data } = await apiClient.post(endpoint, payload);
      console.log('✅ API login response:', JSON.stringify(data, null, 2));

      if (meta.remember) {
        await AsyncStorage.setItem('rememberMeTab', tab);
        if (tab === 'email') {
          await AsyncStorage.setItem('rememberMeEmail', form.email);
          await AsyncStorage.removeItem('rememberMePhone');
        } else {
          await AsyncStorage.setItem('rememberMePhone', form.phone);
          await AsyncStorage.setItem('rememberMeCountryCode', meta.countryCode);
          await AsyncStorage.removeItem('rememberMeEmail');
        }
      } else {
        await AsyncStorage.removeItem('rememberMeTab');
        await AsyncStorage.removeItem('rememberMeEmail');
        await AsyncStorage.removeItem('rememberMePhone');
        await AsyncStorage.removeItem('rememberMeCountryCode');
      }

      setAuth(data?.user);

      fcmService.initializeFcm().catch(err =>
        console.warn('[FCM] Token store after email login failed:', err),
      );

      Toast.success(getMappedErrorMessage(data?.message) || t('login_successful'));
      setTimeout(() => {
        returnFromAuth();
      }, 500);
    } catch (error: any) {
      console.log('Login error:', error);
      const backendMsg =
        error?.response?.data?.message || error?.data?.message || error?.message || error;
      Toast.error(getMappedErrorMessage(backendMsg));
    } finally {
      setMeta(prev => ({ ...prev, loading: false }));
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { accessToken } = await signInWithGoogle();
      if (!accessToken) throw new Error('No access token returned from Google');

      const { data } = await apiClient.post(API.AUTH.LOGIN_GOOGLE, { accessToken });
      console.log('✅ [Google] API response:', JSON.stringify(data, null, 2));
      setAuth(data?.user);

      fcmService.initializeFcm().catch(err =>
        console.warn('[FCM] Token store after Google login failed:', err),
      );

      Toast.success(data?.message || 'Google sign-in successful');
      setTimeout(() => {
        if (data?.is_new_user) {
          navigation.replace('Profile', {
            name: data?.user?.name || data?.user?.fullName || '',
            email: data?.user?.email || '',
          });
        } else {
          returnFromAuth();
        }
      }, 500);
    } catch (error: any) {
      if (error?.code === googleStatusCodes.SIGN_IN_CANCELLED) {
        return;
      }
      console.error('❌ [Google] Sign-in error:', error);
      const rawErrorDetail = error?.code || error?.message || 'Unknown Error';
      Toast.error(`${t('google_sign_in_failed')} (${rawErrorDetail})`);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setAppleLoading(true);
    try {
      const { identityToken, nonce, fullName, email, user } = await signInWithApple();

      // TODO: replace with the backend exchange once /patient-auth/login-with-apple
      // exists, mirroring handleGoogleSignIn: post the credential, setAuth(data.user),
      // initialise FCM, then navigate on data.is_new_user.
      console.log('✅ [Apple] Firebase uid:', user?.uid);
      console.log('✅ [Apple] identityToken:', identityToken);
      console.log('✅ [Apple] nonce (raw, unhashed):', nonce);
      // Apple sends these only on a user's first ever sign-in - persist them then.
      console.log('✅ [Apple] fullName:', fullName, '| email:', email);

      Toast.success('Apple sign-in successful');
    } catch (error: any) {
      if (error?.code === appleErrorCodes.CANCELED) {
        return;
      }
      console.error('❌ [Apple] Sign-in error:', error);
      const rawErrorDetail = error?.code || error?.message || 'Unknown Error';
      Toast.error(`Apple sign-in failed (${rawErrorDetail})`);
    } finally {
      setAppleLoading(false);
    }
  };

  const isLight = theme === 'light';
  const cardBg = isLight ? '#FFFFFF' : '#1A0D36';
  const cardBorder = isLight ? '#E8EBF0' : '#3A2E5B';
  const textCol = isLight ? colors.black : colors.white;
  const secTextCol = isLight ? colors.secondaryText : '#D1C4E9';

  const linkColor = isLight ? colors.primary : '#C490FF';
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

            {/* Redesigned Rounded Login Card */}
            <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              {/* Center Logo */}
              <View style={styles.logoContainer}>
                <Image
                  source={theme === 'dark' ? LogoDarkPng : LogoPng}
                  style={styles.logo}
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
                {(['phone', 'email'] as TabType[]).map(type => {
                  const isActive = tab === type;
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
                        setTab(type);
                        setErrors({ email: '', phone: '', password: '' });
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
                            : '#C4B5FD'
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
                              : '#C4B5FD',
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
                {tab === 'email' ? (
                  <CustomTextInput
                    label={t('email_address')}
                    placeholder={t('enter_email')}
                    value={form.email}
                    onChangeText={text => {
                      setForm({ ...form, email: text });
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    errorMessage={errors.email}
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
                      phone={form.phone}
                      setPhone={text => {
                        setForm({ ...form, phone: text });
                        if (errors.phone) setErrors({ ...errors, phone: '' });
                      }}
                      countryCode={meta.countryCode}
                      setCountryCode={code =>
                        setMeta({ ...meta, countryCode: code as CountryCode })
                      }
                      phoneError={errors.phone}
                      onValidationChange={valid =>
                        setMeta({ ...meta, isPhoneValid: valid })
                      }
                      CustomStyle={{
                        backgroundColor: isLight ? colors.white : 'transparent',
                      }}
                      theme={theme}
                    />
                  </View>
                )}
              </View>

              <CustomTextInput
                label={t('password')}
                placeholder="********"
                value={form.password}
                onChangeText={text => {
                  setForm({ ...form, password: text });
                  if (errors.password) setErrors({ ...errors, password: '' });
                }}
                secureTextEntry={true}
                errorMessage={errors.password}
                theme={theme}
                leftIconName="lock-closed-outline"
              />

              {/* Remember Me / Forgot Password */}
              <View style={styles.PasswordRemember}>
                <View style={[styles.CheckBox, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                  <TouchableOpacity
                    onPress={() => {
                      setMeta(prev => ({ 
                        ...prev, 
                        remember: !prev.remember,
                        rememberError: false 
                      }));
                    }}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: meta.remember }}
                  >
                    <Ionicons
                      name={meta.remember ? 'checkbox' : 'square-outline'}
                      size={22}
                      color={
                        meta.rememberError
                          ? 'red'
                          : meta.remember
                          ? linkColor
                          : isLight
                          ? colors.border
                          : '#9E8BCA'
                      }
                    />
                  </TouchableOpacity>
                  <Text style={[styles.TextContent, { color: secTextCol }]}>
                    {t('remember_me')}
                  </Text>
                </View>

                <TouchableOpacity onPress={() => navigation.navigate('ForgetPassword')}>
                  <Text style={[styles.signinLink, { color: linkColor }]}>{t('forgot_password')}</Text>
                </TouchableOpacity>
              </View>

              {/* Gradient CTA Sign In button */}
              <TouchableOpacity
                style={styles.gradientButtonContainer}
                onPress={handleSignIn}
                disabled={meta.loading || googleLoading}
              >
                <LinearGradient
                  colors={isLight ? ['#7625D7', '#9D4EDD'] : ['#7625D7', '#4A148C']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  {meta.loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <View style={{ flexDirection: isRtl ? 'row-reverse' : 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={styles.gradientButtonText}>{t('sign_in')}</Text>
                      <Ionicons
                        name={isRtl ? 'arrow-back-outline' : 'arrow-forward-outline'}
                        size={18}
                        color="#FFFFFF"
                      />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Footer switcher sign up */}
              <View style={[styles.signinRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <Text style={[styles.TextContent, { color: secTextCol }]}>
                  {t('create_account_prompt')}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                  <Text style={[styles.signinLink, { color: linkColor }]}>{t('sign_up_link')}</Text>
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
                    { flexDirection: isRtl ? 'row-reverse' : 'row' },
                    (meta.loading || googleLoading || appleLoading) && { opacity: 0.6 },
                  ]}
                  onPress={handleAppleSignIn}
                  disabled={meta.loading || googleLoading || appleLoading}
                >
                  {appleLoading ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <>
                      <AntDesign name="apple1" size={20} color={colors.white} />
                      <Text
                        style={[
                          styles.appleText,
                          {
                            marginLeft: isRtl ? 0 : mvs(10),
                            marginRight: isRtl ? mvs(10) : 0,
                          },
                        ]}
                      >
                        {t('sign_in_apple')}
                      </Text>
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
                  (meta.loading || googleLoading) && { opacity: 0.6 },
                ]}
                onPress={handleGoogleSignIn}
                disabled={meta.loading || googleLoading}
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
                      {t('sign_in_google')}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Browse without an account. The marketplace is fully public;
                signing in is only required to add to cart, check out, or
                contact a clinic. */}
            <TouchableOpacity
              style={styles.guestButton}
              onPress={handleContinueAsGuest}
              disabled={meta.loading || googleLoading || appleLoading}
            >
              <Text style={[styles.guestButtonText, { color: linkColor }]}>
                {t('continue_as_guest')}
              </Text>
            </TouchableOpacity>

            {/* Footer Text info */}
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
