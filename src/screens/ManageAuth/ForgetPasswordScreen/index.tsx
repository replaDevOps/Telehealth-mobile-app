import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
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

interface ForgetPasswordScreenProps {
  navigation: any;
}

export function ForgetPasswordScreen({
  navigation,
}: ForgetPasswordScreenProps) {
  const [selectedTab, setSelectedTab] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [countryCode, setCountryCode] = useState('PK');
  const [phoneError, setPhoneError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);

  return (
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
            <>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                placeholder="Enter email address"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                accessibilityLabel="Email input"
              />
            </>
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
            console.log(
              'Forget Password with:',
              selectedTab === 'email' ? email : phone,
            );
            navigation.navigate('SetPassword');
          }}
          // disabled={
          //   !isChecked ||
          //   (selectedTab === 'email' ? !email.trim() : !phone.trim())
          // }
        />

        <View style={styles.signinRow}>
          <Text style={styles.TextContent}>Remember Password? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
            <Text style={styles.signinLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: mvs(20),
    paddingTop: mvs(10),
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: mvs(20),
  },
  logo: {
    width: mvs(120),
    height: mvs(60),
  },
  title: {
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    gap: mvs(15),
    marginTop: mvs(6),
  },
  TextContent: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.secondaryText,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: mvs(13),
    textAlign: 'center',
    marginTop: mvs(6),
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: mvs(25),
    backgroundColor: colors.gray,
    borderRadius: mvs(12),
    padding: mvs(5),
    width: '80%',
    alignSelf: 'center',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: mvs(12),
    borderRadius: mvs(10),
  },
  activeTab: {
    backgroundColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    color: colors.black,
    fontWeight: '500',
    fontSize: mvs(13),
  },
  activeTabText: {
    color: colors.white,
    fontWeight: '600',
  },
  label: {
    fontSize: mvs(13),
    color: colors.black,
    marginBottom: mvs(8),
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: mvs(12),
    paddingHorizontal: mvs(14),
    paddingVertical: mvs(12),
    backgroundColor: '#F8F8FA',
    fontSize: mvs(14),
  },
  signinRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signinText: {
    color: colors.gray,
    fontSize: mvs(13),
  },
  signinLink: {
    color: colors.primary,
    fontWeight: '600',
    marginLeft: mvs(4),
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: mvs(25),
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  orText: {
    marginHorizontal: mvs(12),
    color: colors.gray,
    fontSize: mvs(13),
    fontWeight: '500',
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.black,
    borderRadius: mvs(12),
    paddingVertical: mvs(14),
    marginTop: mvs(10),
  },
  appleText: {
    color: colors.white,
    marginLeft: mvs(10),
    fontSize: mvs(15),
    fontWeight: '600',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F8FA',
    borderRadius: mvs(12),
    paddingVertical: mvs(14),
    marginTop: mvs(10),
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  googleText: {
    color: colors.black,
    marginLeft: mvs(10),
    fontSize: mvs(15),
    fontWeight: '600',
  },
  termsRow: {
    flexDirection: 'row',
    // alignItems: 'flex-start',
    marginTop: mvs(20),
    marginBottom: mvs(15),
    gap: 10,
  },
  termsText: {
    flex: 1,
    marginLeft: mvs(10),
    color: colors.gray,
    fontSize: mvs(12),
    lineHeight: mvs(18),
  },
  linkText: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});
