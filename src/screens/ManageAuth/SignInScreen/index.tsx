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
import { CustomTextInput } from '../../../components/common/CustomTextInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import parsePhoneNumberFromString from 'libphonenumber-js';
import { useTranslation } from 'react-i18next';

export function SignInScreen({ navigation }) {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [rememberError, setRememberError] = useState(false);
  const [countryCode, setCountryCode] = useState('PK');
  const [phoneError, setPhoneError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const phoneNumber = parsePhoneNumberFromString(phone, countryCode);
  const formattedPhone = phoneNumber
    ? `+${phoneNumber.countryCallingCode}${phoneNumber.nationalNumber}`
    : `+${phone}`;

  const handleSignIn = () => {
    let valid = true;

    if (selectedTab === 'email') {
      if (!email.trim() || !email.includes('@')) {
        setEmailError(t('invalid_email'));
        valid = false;
      } else setEmailError('');
    } else {
      if (!phone.trim() || !isPhoneValid) {
        setPhoneError(t('invalid_phone'));
        valid = false;
      } else setPhoneError('');
    }

    if (!password.trim()) {
      setPasswordError(t('password_required'));
      valid = false;
    } else setPasswordError('');

    if (!isChecked) {
      setRememberError(true);
      valid = false;
    } else {
      setRememberError(false);
    }

    if (valid && isChecked) {
      navigation.navigate('Main', { screen: 'Home' });
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
            <Text style={styles.TextContent}>
              {t('login_continue')}
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
                onChangeText={setEmail}
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

          <CustomTextInput
            label={t('password')}
            placeholder={t('enter_password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            errorMessage={passwordError}
          />

          <View style={styles.PasswordRemember}>
            <View style={styles.CheckBox}>
              <TouchableOpacity
                onPress={() => {
                  setIsChecked(!isChecked);
                  setRememberError(false);
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
              <Text style={styles.TextContent}>{t('remember_me')}</Text>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgetPassword')}
            >
              <Text style={styles.signinLink}>{t('forgot_password')}</Text>
            </TouchableOpacity>
          </View>

          <CustomButton title={t('sign_in')} onPress={handleSignIn} />

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
