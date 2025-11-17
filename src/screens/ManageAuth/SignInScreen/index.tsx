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

export function SignInScreen({ navigation }) {
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
        setEmailError('Enter a valid email');
        valid = false;
      } else setEmailError('');
    } else {
      if (!phone.trim() || !isPhoneValid) {
        setPhoneError('Invalid phone number');
        valid = false;
      } else setPhoneError('');
    }

    if (!password.trim()) {
      setPasswordError('Password is required');
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
            <CustomText text="Welcome Back" />
          </View>
          <View style={styles.content}>
            <Text style={styles.TextContent}>
              Login and continue your healthy journey today!
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
                Email Address
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
                Phone Number
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: mvs(25) }}>
            {selectedTab === 'email' ? (
              <CustomTextInput
                label="Email Address"
                placeholder="Enter email address"
                value={email}
                onChangeText={setEmail}
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

          <CustomTextInput
            label="Password"
            placeholder="Enter your password"
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
              <Text style={styles.TextContent}>Remember Me</Text>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgetPassword')}
            >
              <Text style={styles.signinLink}>Forgot Password</Text>
            </TouchableOpacity>
          </View>

          <CustomButton title="Sign In" onPress={handleSignIn} />

          <View style={styles.signinRow}>
            <Text style={styles.TextContent}>Create an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.signinLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dividerContainer}>
            <View style={styles.line} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.line} />
          </View>

          <TouchableOpacity
            style={styles.appleButton}
            onPress={() => console.log('Apple Sign In')}
          >
            <AntDesign name="apple1" size={20} color={colors.white} />
            <Text style={styles.appleText}>Sign In with Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={() => console.log('Google Sign In')}
          >
            <GoogleSvg />
            <Text style={styles.googleText}>Sign In with Google</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
