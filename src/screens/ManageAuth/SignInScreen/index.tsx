import React, { useMemo, useState } from 'react';
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
    countryCode: 'PK' as CountryCode,
    isPhoneValid: false,
    loading: false,
  });

  const formattedPhone = useMemo(() => {
    if (!form.phone || typeof form.phone !== 'string') {
      return '';
    }

    const parsed = parsePhoneNumberFromString(form.phone, meta.countryCode);

    if (!parsed) return '';

    return `+${parsed.countryCallingCode}${parsed.nationalNumber}`;
  }, [form.phone, meta.countryCode]);

  const validate = (): boolean => {
    const nextErrors = { email: '', phone: '', password: '' };
    let valid = true;

    if (tab === 'email' && (!form.email || !form.email.includes('@'))) {
      nextErrors.email = t('invalid_email');
      valid = false;
    }

    if (tab === 'phone' && (!form.phone || !meta.isPhoneValid)) {
      nextErrors.phone = t('invalid_phone');
      valid = false;
    }

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
          : { phone: formattedPhone, password: form.password };

      const endpoint =
        tab === 'email' ? API.AUTH.LOGIN_EMAIL : API.AUTH.LOGIN_PHONE;

      const { data } = await apiClient.post(endpoint, payload);
      setAuth(data?.user);
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
                onPress={() => setTab(type)}
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
                onChangeText={text => setForm({ ...form, email: text })}
                errorMessage={errors.email}
              />
            ) : (
              <>
                <Text style={styles.label}>{t('phone_number')}</Text>
                <PhoneNumberInput
                  phone={form.phone}
                  setPhone={text => setForm({ ...form, phone: text })}
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
            onChangeText={text => setForm({ ...form, password: text })}
            secureTextEntry={true}
            errorMessage={errors.password}
          />

          <View style={styles.PasswordRemember}>
            <View style={styles.CheckBox}>
              <TouchableOpacity
                onPress={() => {
                  setMeta({ ...meta, remember: !meta.remember });
                  setMeta({ ...meta, rememberError: false });
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

          <TouchableOpacity
            style={styles.appleButton}
            onPress={() => console.log('Apple Sign In')}
          >
            <AntDesign name="apple1" size={20} color={colors.white} />
            <Text style={styles.appleText}>{t('sign_in_apple')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={() => console.log('Google Sign In')}
          >
            <GoogleSvg />
            <Text style={styles.googleText}>{t('sign_in_google')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
