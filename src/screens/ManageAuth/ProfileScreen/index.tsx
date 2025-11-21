import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { KeyboardAvoidScrollview } from '../../../components/common/keyboard-avoid-scrollview';

import { CustomTextInput } from '../../../components/common/CustomTextInput';
import { CustomDropdown } from '../../../components/common/CustomDropdwon';
import UserProfile from '../../../components/common/UserProfile';
import { CustomButton } from '../../../components/common/CustomButton';
import { Header2 } from '../../../components/common/Header2';
import CustomText from '../../../components/common/CustomText';
import { styles } from './style';
import PhoneNumberInput from '../../../components/common/PhoneTextInput';
import { colors } from '../../../styles/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

type RootStackParamList = {
  SetupProfile: undefined;
  SignIn: undefined; // Replace with actual next screen
};

type NavProps = StackNavigationProp<RootStackParamList, 'SetupProfile'>;

interface Props {
  navigation: NavProps;
}

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('PK');
  const [phoneError, setPhoneError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [nationality, setNationality] = useState('');
  const [IdCardNumber, setIdCardNumber] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [nameError, setNameError] = useState('');
  const [ageError, setAgeError] = useState('');
  const [idError, setIdError] = useState('');
  const [nationalityError, setNationalityError] = useState('');
  const [genderError, setGenderError] = useState('');

  const handleImageSelected = (uri: string) => {
    setProfileImage(uri);
  };

  const handleConfirm = () => {
    let valid = true;

    // Reset errors
    setNameError('');
    setEmailError('');
    setPhoneError('');
    setIdError('');
    setAgeError('');
    setNationalityError('');
    setGenderError('');

    if (!fullName.trim()) {
      setNameError(t('name_required'));
      valid = false;
    }
    if (!email.trim() || !email.includes('@')) {
      setEmailError(t('email_required'));
      valid = false;
    }
    if (!phone.trim() || !isPhoneValid) {
      setPhoneError(t('phone_required'));
      valid = false;
    }
    if (!nationality) {
      setNationalityError(t('nationality_required'));
      valid = false;
    }
    if (!IdCardNumber.trim()) {
      setIdError(t('id_required'));
      valid = false;
    }
    if (!gender) {
      setGenderError(t('gender_required'));
      valid = false;
    }
    if (!age.trim()) {
      setAgeError(t('age_required'));
      valid = false;
    }
    if (!profileImage) {
      /* show image error if needed */ valid = false;
    }

    if (valid) {
      navigation.navigate('SignIn');
    }
  };

  const handleSkip = () => {
    navigation.navigate('SignIn');
  };

  const nationalityOptions = [
    { label: t('pakistani'), value: 'pak' },
    { label: t('afghani'), value: 'afg' },
    { label: t('indian'), value: 'ind' },
    { label: t('chines'), value: 'ch' },
    { label: t('american'), value: 'usa' },
  ];

  const genderOptions = [
    { label: t('male'), value: 'male' },
    { label: t('female'), value: 'female' },
    { label: t('other'), value: 'other' },
  ];

  return (
    <KeyboardAvoidScrollview>
      <SafeAreaView style={{ flex: 1 }}>
        <Header2 title="" showLanguage={true} />

        <View style={styles.container}>
          <UserProfile
            profileImage={profileImage}
            onImageSelected={handleImageSelected}
          />

          <View style={styles.content}>
            <CustomText text={t('setup_profile')} />
            <Text style={styles.TextContent}>
              {t('setup_profile_details')}
            </Text>
          </View>

          <CustomTextInput
            label={t('full_name')}
            placeholder={t('enter_full_name')}
            value={fullName}
            onChangeText={setFullName}
            errorMessage={nameError}
          />

          <CustomTextInput
            label={t('email_address')}
            placeholder={t('enter_email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            errorMessage={emailError}
          />

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

          <CustomDropdown
            label={t('nationality')}
            placeholder={t('select_nationality')}
            value={nationality}
            onValueChange={setNationality}
            errorMessage={nationalityError} // Add
            options={nationalityOptions}
          />

          <CustomTextInput
            label={t('national_id')}
            placeholder={t('national_id_placeholder')}
            value={IdCardNumber}
            onChangeText={setIdCardNumber}
            keyboardType="numeric"
            errorMessage={idError}
          />

          <CustomDropdown
            label={t('gender')}
            placeholder={t('select_gender')}
            value={gender}
            onValueChange={setGender}
            options={genderOptions}
            errorMessage={genderError}
          />

          <CustomTextInput
            label={t('age')}
            placeholder={t('enter_age')}
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            errorMessage={ageError}
          />
        </View>
        <View style={styles.buttonContainer}>
          <CustomButton
            title={t('skip')}
            onPress={handleSkip}
            style={{
              width: '48%',
              backgroundColor: colors.white,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            textStyle={{ color: colors.text }}
          />
          <CustomButton
            title={t('confirm')}
            onPress={handleConfirm}
            style={{ width: '48%' }}
          />
        </View>
      </SafeAreaView>
    </KeyboardAvoidScrollview>
  );
};
