import React, { useMemo, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { mvs } from '@config/metrices';
import { CustomButton } from '@components/common/CustomButton';
import { Header2 } from '@components/common/Header2';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { GoogleSvg, LogoSvg } from '@assets/icons';
import { CustomText } from '@components/common/CustomText';
import PhoneNumberInput from '@components/common/PhoneTextInput';
import { styles } from './style';
import { CustomTextInput } from '@components/common/CustomTextInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import parsePhoneNumberFromString, { CountryCode } from 'libphonenumber-js';
import { useTranslation } from 'react-i18next';
import { Toast } from 'toastify-react-native';
import { apiClient } from '@services/api/api-client';
import { colors } from '../../../styles/colors';
import { useAuthStore } from '@store';
import { API } from '@services/api/api-endpoint';
import { fcmService } from '../../../services/firebase/fcmService';
import { signInWithGoogle, googleStatusCodes } from '../../../services/firebase/googleAuth';

type TabType = 'email' | 'phone';

export function SignInScreen({ navigation }) {
  const { t } = useTranslation();
  const { setAuth } = useAuthStore();

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

  const formattedPhone = useMemo(() => {
    if (!form.phone || typeof form.phone !== 'string') {
      return '';
    }

    const parsed = parsePhoneNumberFromString(form.phone, meta.countryCode);
    console.log('parsed', parsed);
    if (!parsed) return '';

    return parsed.format('E.164');
  }, [form.phone, meta.countryCode]);

  // Load saved credentials on mount if remember me was checked
  useEffect(() => {
    const loadSavedCredentials = async () => {
      try {
        console.log('🔍 Loading saved credentials...');
        const savedTab = await AsyncStorage.getItem('rememberMeTab');
        const savedEmail = await AsyncStorage.getItem('rememberMeEmail');
        const savedPhone = await AsyncStorage.getItem('rememberMePhone');
        const savedCountryCode = await AsyncStorage.getItem('rememberMeCountryCode');
        
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

  const validate = (): boolean => {
    // Clear all errors first - explicitly clear inactive tab errors
    const nextErrors = { email: '', phone: '', password: '' };
    let valid = true;

    // Only validate email if on email tab
    if (tab === 'email') {
      if (!form.email || !form.email.includes('@')) {
        nextErrors.email = t('invalid_email');
        valid = false;
      }
      // Clear phone error when on email tab
      nextErrors.phone = '';
    } 
    // Only validate phone if on phone tab
    else if (tab === 'phone') {
      // Clear email error when on phone tab
      nextErrors.email = '';
      if (!form.phone || !meta.isPhoneValid) {
        nextErrors.phone = t('invalid_phone');
        valid = false;
      }
    }

    // Always validate password
    if (!form.password) {
      nextErrors.password = t('password_required');
      valid = false;
    }

    setErrors(nextErrors);
    return valid;
  };

  const handleSignIn = async () => {
    // Validate first (user errors - show under inputs)
    if (!validate()) {
      return;
    }
    setMeta({ ...meta, loading: true });

    try {
      const payload =
        tab === 'email'
          ? { email: form.email, password: form.password }
          : { phoneNo: formattedPhone, password: form.password };
      console.log('payload', payload);
      const endpoint =
        tab === 'email' ? API.AUTH.LOGIN_EMAIL : API.AUTH.LOGIN_PHONE;
      console.log('endpoint', endpoint);
      const { data } = await apiClient.post(endpoint, payload);
      console.log('data', data);
      setAuth(data?.user);

      // Store FCM token in background after successful login
      fcmService.initializeFcm().catch(err =>
        console.warn('[FCM] Token store after login failed:', err),
      );

      // Save credentials if remember me is checked
      if (meta.remember) {
        try {
          console.log('💾 Saving credentials (Remember me checked):', {
            tab,
            email: tab === 'email' ? form.email : 'N/A',
            phone: tab === 'phone' ? form.phone : 'N/A',
            countryCode: tab === 'phone' ? meta.countryCode : 'N/A',
          });
          
          await AsyncStorage.setItem('rememberMeTab', tab);
          if (tab === 'email') {
            await AsyncStorage.setItem('rememberMeEmail', form.email);
            await AsyncStorage.removeItem('rememberMePhone');
            await AsyncStorage.removeItem('rememberMeCountryCode');
            console.log('✅ Saved email:', form.email);
          } else {
            await AsyncStorage.setItem('rememberMePhone', form.phone);
            await AsyncStorage.setItem('rememberMeCountryCode', meta.countryCode);
            await AsyncStorage.removeItem('rememberMeEmail');
            console.log('✅ Saved phone:', form.phone, 'Country:', meta.countryCode);
          }
          console.log('✅ Credentials saved successfully');
        } catch (error) {
          console.error('❌ Error saving credentials:', error);
        }
      } else {
        // Clear saved credentials if remember me is unchecked
        try {
          console.log('🗑️ Clearing saved credentials (Remember me unchecked)');
          await AsyncStorage.multiRemove([
            'rememberMeTab',
            'rememberMeEmail',
            'rememberMePhone',
            'rememberMeCountryCode',
          ]);
          console.log('✅ Credentials cleared successfully');
        } catch (error) {
          console.error('❌ Error clearing credentials:', error);
        }
      }
      
      Toast.success(data?.message || 'Login successful');
      // Delay navigation to allow toast to be visible
      setTimeout(() => {
        navigation.replace('Main', { screen: 'Home' });
      }, 500);
      setMeta({ ...meta, loading: false });
    } catch (error: any) {
      // API errors (like unauthorized) - show in toast only, not under input
      const errorMsg = 
        error?.response?.data?.data?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Login failed. Please check your credentials and try again.';
      
      Toast.error(errorMsg);
      setMeta({ ...meta, loading: false });
    }
  };

  const handleGoogleSignIn = async () => {
    setMeta(prev => ({ ...prev, loading: true }));
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
        'Google sign-in failed';
      console.error('❌ [Google] Sign-in error:', error);
      Toast.error(errorMsg);
    } finally {
      setMeta(prev => ({ ...prev, loading: false }));
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
            <LogoSvg />
          </View>

          <View style={{ ...styles.title }}>
            <CustomText text={t('welcome_back')} />
          </View>
          <View style={styles.content}>
            <Text style={styles.TextContent}>{t('login_continue')}</Text>
          </View>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            {(['email', 'phone'] as TabType[]).map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.tabButton, tab === type && styles.activeTab]}
                onPress={() => {
                  setTab(type);
                  // Clear all field errors when switching tabs
                  setErrors({ email: '', phone: '', password: '' });
                }}
              >
                <Text
                  style={[styles.tabText, tab === type && styles.activeTabText]}
                >
                  {t(type === 'email' ? 'email_address' : 'phone_number')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ marginTop: mvs(25) }}>
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
              />
            ) : (
              <>
                <Text style={styles.label}>{t('phone_number')}</Text>
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
                  CustomStyle={{ backgroundColor: colors.white }}
                />
              </>
            )}
          </View>

          <CustomTextInput
            label={t('password')}
            placeholder={t('enter_password')}
            value={form.password}
            onChangeText={text => {
              setForm({ ...form, password: text });
              if (errors.password) setErrors({ ...errors, password: '' });
            }}
            secureTextEntry={true}
            errorMessage={errors.password}
          />

          <View style={styles.PasswordRemember}>
            <View style={styles.CheckBox}>
              <TouchableOpacity
                onPress={() => {
                  const newRememberValue = !meta.remember;
                  console.log('🔄 Remember me checkbox toggled:', newRememberValue);
                  setMeta(prev => ({ 
                    ...prev, 
                    remember: newRememberValue,
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
                      ? colors.primary
                      : colors.border
                  }
                />
              </TouchableOpacity>
              <Text style={styles.TextContent}>{t('remember_me')}</Text>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgetPassword')}
            >
              <Text style={styles.signinLink}>{t('forgot_password')}</Text>
            </TouchableOpacity>
          </View>

          <CustomButton
            title={t('sign_in')}
            onPress={handleSignIn}
            loading={meta.loading}
          />

          <View style={styles.signinRow}>
            <Text style={styles.TextContent}>{t('create_account')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.signinLink}>{t('sign_up')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dividerContainer}>
            <View style={styles.line} />
            <Text style={styles.orText}>{t('or')}</Text>
            <View style={styles.line} />
          </View>

          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={styles.appleButton}
              onPress={() => console.log('Apple Sign In')}
            >
              <AntDesign name="apple1" size={20} color={colors.white} />
              <Text style={styles.appleText}>{t('sign_in_apple')}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
          >
            <GoogleSvg />
            <Text style={styles.googleText}>{t('sign_in_google')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
