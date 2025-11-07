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

interface ForgetPasswordScreenProps {
  navigation: any;
}

export function ForgetPasswordScreen({
  navigation,
}: ForgetPasswordScreenProps) {
  const [selectedTab, setSelectedTab] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('PK');
  const [phoneError, setPhoneError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [emailError, setEmailError] = useState(''); // ← ADD
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
            <CustomText text="Forget Password" />
          </View>
          <View style={styles.content}>
            <Text style={styles.TextContent}>
              Enter the email address or phone number to send you the OTP code.
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

          <CustomButton
            title="Next"
            onPress={() => {
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

              if (valid) {
                navigation.navigate('SetPassword');
              }
            }}
          />

          <View style={styles.signinRow}>
            <Text style={styles.TextContent}>Remember Password? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
              <Text style={styles.signinLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
