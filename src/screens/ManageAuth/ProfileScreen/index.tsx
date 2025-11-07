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

type RootStackParamList = {
  SetupProfile: undefined;
  SignIn: undefined; // Replace with actual next screen
};

type NavProps = StackNavigationProp<RootStackParamList, 'SetupProfile'>;

interface Props {
  navigation: NavProps;
}

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
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

  const handleSaveAndContinue = () => {
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
      setNameError('Name is Required');
      valid = false;
    }
    if (!email.trim() || !email.includes('@')) {
      setEmailError('Valid email required');
      valid = false;
    }
    if (!phone.trim() || !isPhoneValid) {
      setPhoneError('Valid phone required');
      valid = false;
    }
    if (!nationality) {
      setNationalityError('Select nationality');
      valid = false;
    }
    if (!IdCardNumber.trim()) {
      setIdError('ID required');
      valid = false;
    }
    if (!gender) {
      setGenderError('Select gender');
      valid = false;
    }
    if (!age.trim()) {
      setAgeError('Age is required');
      valid = false;
    }
    if (!profileImage) {
      /* show image error if needed */ valid = false;
    }

    if (valid) {
      navigation.navigate('SignIn');
    }
  };

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
            <CustomText text="Setup Your Profile" />
            <Text style={styles.TextContent}>
              Setup your profile with a basic details.
            </Text>
          </View>

          <CustomTextInput
            label="Full Name"
            placeholder="Enter full name"
            value={fullName}
            onChangeText={setFullName}
            errorMessage={nameError}
          />

          <CustomTextInput
            label="Email Address"
            placeholder="Enter email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            errorMessage={emailError}
          />

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

          <CustomDropdown
            label="Nationality"
            placeholder="Select nationality"
            value={nationality}
            onValueChange={setNationality}
            errorMessage={nationalityError} // Add
            options={[
              { label: 'Pakistani', value: 'pak' },
              { label: 'Afghani', value: 'afg' },
              { label: 'Indian', value: 'ind' },
              { label: 'Chines', value: 'ch' },
              { label: 'American', value: 'usa' },
            ]}
          />

          <CustomTextInput
            label="National ID / Iqama Number"
            placeholder="XXXXXXXXX"
            value={IdCardNumber}
            onChangeText={setIdCardNumber}
            keyboardType="numeric"
            errorMessage={idError}
          />

          <CustomDropdown
            label="Gender"
            placeholder="Select Gender"
            value={gender}
            onValueChange={setGender}
            options={[
              { label: 'Male', value: 'male' },
              { label: 'Female', value: 'female' },
              { label: 'Other', value: 'other' },
            ]}
            errorMessage={genderError}
          />

          <CustomTextInput
            label="Age"
            placeholder="Enter your age"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            errorMessage={ageError}
          />
        </View>
        <CustomButton title="Save & Continue" onPress={handleSaveAndContinue} />
      </SafeAreaView>
    </KeyboardAvoidScrollview>
  );
};
