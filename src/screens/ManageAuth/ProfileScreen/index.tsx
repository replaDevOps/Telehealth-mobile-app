import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Asset } from 'react-native-image-picker';
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
import { mvs } from '../../../config/metrices';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { API } from '@services/api/api-endpoint';
import { Toast } from 'toastify-react-native';
import { BASE_URL } from '@constants';
import { useAuthStore } from '@store';
import { AuthStackParamList } from '../../../navigation/AuthNavigator';
import parsePhoneNumberFromString, { CountryCode } from 'libphonenumber-js';

type NavProps = StackNavigationProp<AuthStackParamList, 'Profile'>;
type RouteProps = RouteProp<AuthStackParamList, 'Profile'>;

interface Props {
  navigation: NavProps;
  route: RouteProps;
}

export const ProfileScreen: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation();
  
  // Get email/phone from route params
  const routeEmail = route.params?.email;
  const routePhone = route.params?.phone;
  const routeCountryCode = route.params?.countryCode || 'SA';
  
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [profileImageAsset, setProfileImageAsset] = useState<Asset | null>(null);
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState(routeCountryCode);
  const [phoneError, setPhoneError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [nationality, setNationality] = useState('');
  const [IdCardNumber, setIdCardNumber] = useState('');
  const [email, setEmail] = useState(routeEmail || '');
  
  // Auto-fill email and phone from route params
  useEffect(() => {
    if (routeEmail) {
      setEmail(routeEmail);
    }
    
    if (routePhone && routeCountryCode) {
      // Check if phone already includes country code (starts with +)
      if (routePhone.startsWith('+')) {
        // Phone is in international format, parse it
        try {
          const phoneNumber = parsePhoneNumberFromString(routePhone);
          if (phoneNumber) {
            setPhone(phoneNumber.nationalNumber);
            setCountryCode(phoneNumber.country || routeCountryCode);
          } else {
            // If parsing fails, try with country code
            const phoneNumberWithCountry = parsePhoneNumberFromString(
              routePhone,
              routeCountryCode as CountryCode
            );
            if (phoneNumberWithCountry) {
              setPhone(phoneNumberWithCountry.nationalNumber);
              setCountryCode(routeCountryCode);
            } else {
              // Last resort: use as-is
              setPhone(routePhone.replace(/^\+?\d{1,3}/, '')); // Remove country code prefix
              setCountryCode(routeCountryCode);
            }
          }
        } catch (error) {
          // If parsing fails, remove country code prefix if present
          const nationalNumber = routePhone.replace(/^\+?\d{1,3}/, '');
          setPhone(nationalNumber);
          setCountryCode(routeCountryCode);
        }
      } else {
        // Phone is already in national format
        setPhone(routePhone);
        setCountryCode(routeCountryCode);
      }
    }
  }, [routeEmail, routePhone, routeCountryCode]);
  const [emailError, setEmailError] = useState('');
  const [nameError, setNameError] = useState('');
  const [ageError, setAgeError] = useState('');
  const [idError, setIdError] = useState('');
  const [nationalityError, setNationalityError] = useState('');
  const [genderError, setGenderError] = useState('');
  const [profileImageError, setProfileImageError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageSelected = (uri: string) => {
    setProfileImage(uri);
    setProfileImageError(''); // Clear error when image is selected
  };

  const handleImageAssetSelected = (asset: Asset) => {
    if (asset.uri) {
      setProfileImage(asset.uri);
      setProfileImageAsset(asset);
      setProfileImageError(''); // Clear error when image is selected
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    let valid = true;

    // Reset errors
    setNameError('');
    setEmailError('');
    setPhoneError('');
    setIdError('');
    setAgeError('');
    setNationalityError('');
    setGenderError('');
    setProfileImageError('');

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
      setProfileImageError(t('profile_image_required'));
      valid = false;
    }
    
    if (valid) {
      try {
        // Create FormData to include image file
        const formData = new FormData();
        
        // Add text fields
        formData.append('fullName', fullName.trim());
        formData.append('email', email.trim());
        formData.append('phoneNo', phone.trim());
        formData.append('nationality', nationality);
        formData.append('nationalID', IdCardNumber.trim());
        formData.append('gender', gender);
        formData.append('age', age.trim());

        // Add image if available
        if (profileImageAsset && profileImageAsset.uri) {
          const uriParts = profileImageAsset.uri.split('.');
          const fileExtension = uriParts[uriParts.length - 1] || 'jpg';
          const fileName = profileImageAsset.fileName || `profile_${Date.now()}.${fileExtension}`;
          
          let fileType = profileImageAsset.type || 'image/jpeg';
          if (!profileImageAsset.type) {
            const ext = fileExtension.toLowerCase();
            if (ext === 'png') fileType = 'image/png';
            else if (ext === 'jpg' || ext === 'jpeg') fileType = 'image/jpeg';
          }

          formData.append('image', {
            uri: profileImageAsset.uri,
            type: fileType,
            name: fileName,
          } as any);
        }

        // Get auth token if available
        const token = useAuthStore.getState().auth?.token;
        
        // Use fetch for FormData upload
        const response = await fetch(`${BASE_URL}${API.AUTH.REGISTER}`, {
          method: 'POST',
          body: formData,
          headers: {
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
        });

        const data = await response.json();

        if (!response.ok || data.success === false) {
          const errorMessage = data.message || data.data?.message || 'Registration failed';
          Toast.error(errorMessage);
        setLoading(false);
        return;
      }

        const successMessage = data.message || data.data?.message || 'Registration successful';
        Toast.success(successMessage);
      setLoading(false);
      navigation.navigate('SignIn');
      } catch (error: any) {
        console.error('Registration error:', error);
        Toast.error(error?.message || 'Failed to register');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigation.navigate('SignIn');
  };

  const nationalityOptions = [
    { label: t('saudi_arabian'), value: 'sau' },
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
    <SafeAreaView style={{ flex: 1 }}>
      <Header2 title="" showLanguage={true} />
      <KeyboardAvoidScrollview
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: mvs(30) }}
      >
        <View style={styles.container}>
          <UserProfile
            profileImage={profileImage}
            onImageSelected={handleImageSelected}
            autoUpload={false}
            onImageAssetSelected={handleImageAssetSelected}
          />
          {profileImageError ? (
            <Text style={styles.errorText}>{profileImageError}</Text>
          ) : null}

          <View style={styles.content}>
            <CustomText text={t('setup_profile')} />
            <Text style={styles.TextContent}>{t('setup_profile_details')}</Text>
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
            errorMessage={nationalityError}
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
              loading={loading}
              disabled={loading}
            />
          </View>
        </View>
      </KeyboardAvoidScrollview>
    </SafeAreaView>
  );
};
