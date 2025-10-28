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

type RootStackParamList = {
  SetupProfile: undefined;
  SignIn: undefined; // Replace with actual next screen
};

type NavProps = StackNavigationProp<RootStackParamList, 'SetupProfile'>;

interface Props {
  navigation: NavProps;
}

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('');
  const [city, setCity] = useState('');
  const [age, setAge] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [phone, setPhone] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [countryCode, setCountryCode] = useState('PK');
  const [phoneError, setPhoneError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);

  const handleImageSelected = (uri: string) => {
    setProfileImage(uri);
  };

  const handleSaveAndContinue = () => {
    // if (fullName && gender && city && age && (phone||email)) {
    navigation.navigate('SignIn');
    // }
  };

  return (
    <KeyboardAvoidScrollview>
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

        <CustomTextInput
          label="Email Address"
          placeholder="Enter email address"
          value={fullName}
          onChangeText={setFullName}
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
        />

        <CustomDropdown
          label="City"
          placeholder="Select City"
          value={city}
          onValueChange={setCity}
          options={[
            { label: 'New York', value: 'new_york' },
            { label: 'London', value: 'london' },
            { label: 'Tokyo', value: 'tokyo' },
          ]}
        />

        <CustomTextInput
          label="Age"
          placeholder="Enter your age"
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
        />
      </View>
      <CustomButton title="Save & Continue" onPress={handleSaveAndContinue} />
    </KeyboardAvoidScrollview>
  );
};
export default ProfileScreen;
