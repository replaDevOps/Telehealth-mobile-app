import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { KeyboardAvoidScrollview } from '../../../components/common/keyboard-avoid-scrollview';
import { colors } from '../../../styles/colors';
import { mvs } from '../../../config/metrices';
import { CustomTextInput } from '../../../components/common/CustomTextInput';
import { CustomDropdown } from '../../../components/common/CustomDropdwon';
import UserProfile from '../../../components/common/UserProfile';
import { CustomButton } from '../../../components/common/CustomButton';
import { Header2 } from '../../../components/common/Header2';

type RootStackParamList = {
  SetupProfile: undefined;
  NextScreen: undefined; // Replace with actual next screen
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

  const handleImageSelected = uri => {
    setProfileImage(uri);
    // Add logic to upload to backend if needed
  };

  const handleSaveAndContinue = () => {
    // Validate and navigate to next screen
    if (fullName && gender && city && age) {
      navigation.navigate('NextScreen'); // Replace with actual screen name
    }
  };

  return (
    <KeyboardAvoidScrollview>
      <Header2 title="" showLanguage={true} />

      <View style={styles.container}>
        <UserProfile
          profileImage={profileImage}
          onImageSelected={handleImageSelected}
        />

        <Text style={styles.title}>Setup Your Profile</Text>
        <Text style={styles.subtitle}>
          Setup your profile with a basic details.
        </Text>

        <CustomTextInput
          label="Full Name"
          placeholder="Enter full name"
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

        <CustomButton title="Save & Continue" />
      </View>
    </KeyboardAvoidScrollview>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: mvs(16),
    alignItems: 'center',
  },
  language: {
    fontSize: mvs(14),
    color: colors.black,
  },
  container: {
    padding: mvs(16),
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: mvs(20),
  },
  profileImage: {
    width: mvs(100),
    height: mvs(100),
    borderRadius: mvs(50),
    borderWidth: 2,
    borderColor: colors.primary,
  },
  editIcon: {
    position: 'absolute',
    bottom: mvs(5),
    right: mvs(5),
    backgroundColor: colors.primary,
    borderRadius: mvs(10),
    padding: mvs(4),
  },
  title: {
    fontSize: mvs(20),
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: mvs(10),
  },
  subtitle: {
    fontSize: mvs(14),
    color: colors.gray,
    textAlign: 'center',
    marginBottom: mvs(20),
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: mvs(12),
    paddingHorizontal: mvs(40),
    borderRadius: mvs(10),
    marginTop: mvs(20),
  },
  buttonText: {
    color: colors.white,
    fontSize: mvs(16),
    fontWeight: '600',
  },
});

export default ProfileScreen;
