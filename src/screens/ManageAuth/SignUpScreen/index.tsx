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
import parsePhoneNumberFromString from 'libphonenumber-js';
import { CustomTextInput } from '@components/common/CustomTextInput';

export function SignUpScreen({ navigation }) {
  const [selectedTab, setSelectedTab] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [countryCode, setCountryCode] = useState('PK');
  const [phoneError, setPhoneError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [rememberError, setRememberError] = useState(false);

  const phoneNumber = parsePhoneNumberFromString(phone, countryCode);
  const formattedPhone = phoneNumber
    ? `+${phoneNumber.countryCallingCode}${phoneNumber.nationalNumber}`
    : `+${phone}`;

  const handleSignUp = () => {
    let valid = true;

    if (selectedTab === 'email') {
      if (!email.trim() || !email.includes('@')) {
        setEmailError('Enter a valid email');
        valid = false;
      } else {
        setEmailError('');
      }
    } else {
      if (!phone.trim() || !isPhoneValid) {
        setPhoneError('Invalid phone number');
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
      navigation.navigate('OTPScreen');
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
          <Header2 title="" showLanguage={true} />

          <View style={styles.logoContainer}>
            <LogoSvg />
          </View>

          <View style={{ ...styles.title }}>
            <CustomText text="Sign up" />
          </View>
          <View style={styles.content}>
            <Text style={styles.TextContent}>
              Join and start your healthy journey today!
            </Text>
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
                Email Address
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
                Phone Number
              </Text>
            </TouchableOpacity>
          </View>

          {/* Input Fields */}
          <View style={{ marginTop: mvs(25) }}>
            {selectedTab === 'email' ? (
              <CustomTextInput
                label="Email Address"
                placeholder="Enter email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                errorMessage={emailError}
              />
            ) : (
              <>
                <Text style={styles.label}>Phone Number</Text>
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
          <CustomButton title="Sign up" onPress={handleSignUp} />

          <View style={styles.signinRow}>
            <Text style={styles.TextContent}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
              <Text style={styles.signinLink}>Sign in</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.line} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.line} />
          </View>

          {/* Apple Sign Up */}
          <TouchableOpacity
            style={styles.appleButton}
            onPress={() => console.log('Apple Sign Up')}
          >
            <AntDesign name="apple1" size={20} color={colors.white} />
            <Text style={styles.appleText}>Sign up with Apple</Text>
          </TouchableOpacity>

          {/* Google Sign Up */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={() => console.log('Google Sign Up')}
          >
            <GoogleSvg />
            <Text style={styles.googleText}>Sign up with Google</Text>
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
              By continuing, you agree to Vena's{' '}
              <Text style={styles.linkText}>Terms & Conditions</Text> and{' '}
              <Text style={styles.linkText}>Privacy Policy</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
