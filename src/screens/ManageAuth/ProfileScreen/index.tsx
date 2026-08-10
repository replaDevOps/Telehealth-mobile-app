import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Asset } from 'react-native-image-picker';
import { KeyboardAvoidScrollview } from '../../../components/common/keyboard-avoid-scrollview';

import { CustomTextInput } from '../../../components/common/CustomTextInput';
import { CustomDropdown } from '../../../components/common/CustomDropdwon';
import UserProfile from '../../../components/common/UserProfile';
import DateOfBirthPicker, {
  DobValue,
  computeAge,
  isDobComplete,
} from '../../../components/common/DateOfBirthPicker';
import { CustomButton } from '../../../components/common/CustomButton';
import { Header2 } from '../../../components/common/Header2';
import CustomText from '../../../components/common/CustomText';
import { styles } from './style';
import PhoneNumberInput from '../../../components/common/PhoneTextInput';
import { colors } from '../../../styles/colors';
import { mvs } from '../../../config/metrices';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { translateCityToArabic } from '../../../utils/cityTranslator';
import { API } from '@services/api/api-endpoint';
import { Toast } from 'toastify-react-native';
import { apiClient } from '@services/api/api-client';
import { BASE_URL } from '@constants';
import { useAuthStore } from '@store';
import { AuthStackParamList } from '../../../navigation/AuthNavigator';
import parsePhoneNumberFromString, { CountryCode } from 'libphonenumber-js';
import citiesData from '@utils/cities-data.json';

type NavProps = StackNavigationProp<AuthStackParamList, 'Profile'>;
type RouteProps = RouteProp<AuthStackParamList, 'Profile'>;

interface Props {
  navigation: NavProps;
  route: RouteProps;
}

// A valid name has at least 2 words or at least 3 characters.
const isValidName = (name: string): boolean => {
  const trimmed = name.trim();
  if (!trimmed) return false;
  const words = trimmed.split(/\s+/).filter(Boolean);
  return words.length >= 2 || trimmed.length >= 3;
};

export const ProfileScreen: React.FC<Props> = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');

  // Get email/phone/name from route params
  const routeEmail = route.params?.email;
  const routePhone = route.params?.phone;
  const routeCountryCode = route.params?.countryCode || 'SA';
  const routeName = route.params?.name;

  const [fullName, setFullName] = useState(routeName || '');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState<DobValue>({ day: '', month: '', year: '' });
  const [profileImage, setProfileImage] = useState('');
  const [profileImageAsset, setProfileImageAsset] = useState<Asset | null>(null);
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState(routeCountryCode);
  const [phoneError, setPhoneError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [isSaudi, setIsSaudi] = useState<boolean | null>(null);
  const [IdCardNumber, setIdCardNumber] = useState('');
  const [city, setCity] = useState('');
  const [email, setEmail] = useState(routeEmail || '');
  
  // Auto-fill email and phone from route params
  useEffect(() => {
    if (routeEmail) setEmail(routeEmail);

    if (routePhone) {
      // Backend may send full international format (e.g. +966501234567) or national number
      const parsed = parsePhoneNumberFromString(
        routePhone.startsWith('+') ? routePhone : `+${routePhone}`,
        routeCountryCode as CountryCode
      ) ?? parsePhoneNumberFromString(routePhone, routeCountryCode as CountryCode);

      if (parsed) {
        setPhone(parsed.nationalNumber);
        setCountryCode(parsed.country || routeCountryCode);
      } else {
        setPhone(routePhone);
        setCountryCode(routeCountryCode);
      }
    }
  }, [routeEmail, routePhone, routeCountryCode]);
  const [emailError, setEmailError] = useState('');
  const [nameError, setNameError] = useState('');
  const [dobError, setDobError] = useState('');
  const [idError, setIdError] = useState('');
  const [saudiError, setSaudiError] = useState('');
  const [cityError, setCityError] = useState('');
  const [genderError, setGenderError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSkip, setLoadingSkip] = useState(false);

  const handleImageSelected = (uri: string) => {
    setProfileImage(uri);
  };

  const handleImageAssetSelected = (asset: Asset) => {
    if (asset.uri) {
      setProfileImage(asset.uri);
      setProfileImageAsset(asset);
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
    setDobError('');
    setSaudiError('');
    setCityError('');
    setGenderError('');

    if (!isValidName(fullName)) {
      setNameError(fullName.trim() ? t('name_invalid') : t('name_required'));
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
    if (isSaudi === null) {
      setSaudiError(t('saudi_status_required'));
      valid = false;
    }
    if (!city) {
      setCityError(t('city_required'));
      valid = false;
    }
    // Iqama is only required for non-Saudis. Saudis are never asked for an ID.
    if (isSaudi === false) {
      if (!IdCardNumber || !IdCardNumber.trim()) {
        setIdError(t('iqama_required_non_saudi'));
        valid = false;
      } else if (IdCardNumber.replace(/[^0-9]/g, '').length !== 10) {
        setIdError(t('iqama_length_invalid'));
        valid = false;
      }
    }
    if (!gender) {
      setGenderError(t('gender_required'));
      valid = false;
    }
    if (!isDobComplete(dob)) {
      setDobError(t('dob_required'));
      valid = false;
    }

    if (valid) {
      try {
        // Create FormData to include image file
        const formData = new FormData();
        // Add text fields
        const nationalityPayload = isSaudi ? 'saudi' : 'non_saudi';
        const computedAge = computeAge(dob);

        const parsedPhoneConfirm = parsePhoneNumberFromString(phone, countryCode as CountryCode);
        const fullPhoneConfirm = parsedPhoneConfirm ? parsedPhoneConfirm.format('E.164') : phone.trim();

        formData.append('fullName', fullName.trim());
        formData.append('email', email.trim());
        formData.append('phoneNo', fullPhoneConfirm);
        formData.append('nationality', nationalityPayload);
        // Only non-Saudis provide an Iqama number.
        if (!isSaudi && IdCardNumber.trim()) {
          formData.append('nationalID', IdCardNumber.trim());
        }
        formData.append('gender', gender);
        if (computedAge !== null) {
          formData.append('age', String(computedAge));
        }
        formData.append('city', city.trim());
        console.log('[ProfileScreen] REGISTER payload:', {
          fullName: fullName.trim(),
          email: email.trim(),
          phoneNo: fullPhoneConfirm,
          nationality: nationalityPayload,
          nationalID: !isSaudi ? IdCardNumber.trim() || undefined : undefined,
          gender,
          age: computedAge ?? undefined,
          city: city?.trim() || undefined,
        });

        // Add image — if user picked one use it, otherwise attach the
        // bundled default avatar so the backend never rejects for missing photo.
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
        console.log(formData)
        // Use fetch for FormData upload
        const response = await fetch(`${BASE_URL}${API.AUTH.REGISTER}`, {
          method: 'POST',
          body: formData,
          headers: {
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
        });
        console.log('response',response)
        const data = await response.json();
        console.log('Register API response:', data);

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

  const handleSkip = async () => {
    // Clear previous field errors
    setNameError('');
    setPhoneError('');
    setEmailError('');
    setIdError('');
    setSaudiError('');
    setCityError('');
    setGenderError('');
    setDobError('');

    // Validate all required fields at once
    let hasError = false;

    if (!isValidName(fullName)) {
      setNameError(fullName.trim() ? t('name_invalid') : t('name_required'));
      hasError = true;
    }

    if (!phone || !phone.trim()) {
      setPhoneError(t('phone_required') || 'Phone number is required');
      hasError = true;
    }

    if (!email || !email.trim() || !email.includes('@')) {
      setEmailError(t('email_required') || 'Email is required');
      hasError = true;
    }

    if (isSaudi === null) {
      setSaudiError(t('saudi_status_required'));
      hasError = true;
    }

    // Iqama is required for non-Saudis and must be 10 digits
    if (isSaudi === false) {
      if (!IdCardNumber || !IdCardNumber.trim()) {
        setIdError(t('iqama_required_non_saudi'));
        hasError = true;
      } else if (IdCardNumber.replace(/[^0-9]/g, '').length !== 10) {
        setIdError(t('iqama_length_invalid'));
        hasError = true;
      }
    }

    if (hasError) return;

    setLoadingSkip(true);
    try {
      const parsedPhoneSkip = parsePhoneNumberFromString(phone, countryCode as CountryCode);
      const fullPhoneSkip = parsedPhoneSkip ? parsedPhoneSkip.format('E.164') : phone.trim();

      // Build payload: fullName, phoneNo and email are required; include other profile fields if provided
      const payload: any = {
        fullName: fullName.trim(),
        phoneNo: fullPhoneSkip,
        email: email.trim(),
      };
      if (isSaudi !== null) {
        payload.nationality = isSaudi ? 'saudi' : 'non_saudi';
      }
      if (!isSaudi && IdCardNumber?.trim() && IdCardNumber.replace(/[^0-9]/g, '').length === 10) {
        payload.nationalID = IdCardNumber.trim();
      }
      if (gender) payload.gender = gender;
      const skipAge = computeAge(dob);
      if (skipAge !== null) payload.age = String(skipAge);
      if (city) payload.city = city;
      console.log("Skip",payload)
      const response = await apiClient.post(API.AUTH.SKIP, payload);

      // API may return success:false with message field — prefer showing field errors
      const serverMsg = response?.data?.message || '';
      if (response?.data?.success === false) {
        const lower = String(serverMsg).toLowerCase();
        if (lower.includes('name') || lower.includes('full name')) {
          setNameError(serverMsg);
        } else if (lower.includes('phone')) {
          setPhoneError(serverMsg);
        } else if (lower.includes('email')) {
          setEmailError(serverMsg);
        } else {
          Toast.error(serverMsg || 'Skip failed');
        }
        return;
      }

      if (response.status >= 200 && response.status < 300) {
        const msg = response.data?.message || 'Skipped successfully';
        Toast.success(msg);
        navigation.navigate('SignIn');
      } else {
        const errMsg = response.data?.message || 'Skip failed';
        Toast.error(errMsg);
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || 'Skip failed';
      const lower = String(errMsg).toLowerCase();
      if (lower.includes('name') || lower.includes('full name')) setNameError(errMsg);
      else if (lower.includes('phone')) setPhoneError(errMsg);
      else if (lower.includes('email')) setEmailError(errMsg);
      else Toast.error(errMsg);
    } finally {
      setLoadingSkip(false);
    }
  };

  // Determine signup method based on route params
  const isEmailSignup = !!routeEmail;
  const isPhoneSignup = !!routePhone;

  // City value stays the canonical English name (backend contract); only the
  // displayed label is localized.
  const cityOptions = citiesData.map((c: any) => ({
    label: isArabic ? (c.name_ar || translateCityToArabic(c.name)) : c.name,
    value: c.name,
  }));

  const genderOptions = [
    { label: t('male'), value: 'male' },
    { label: t('female'), value: 'female' },
    { label: t('other'), value: 'other' },
  ];

  return (
    <SafeAreaView style={{ flex: 1 }}>
      
      <KeyboardAvoidScrollview
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: mvs(30) }}
      >
        <Header2 title="" showLanguage={true} inScrollView={true} />
        <View style={styles.container}>
          {/* Profile photo is optional — a default avatar is shown until the
              user picks one. */}
          <UserProfile
            profileImage={profileImage}
            onImageSelected={handleImageSelected}
            autoUpload={false}
            onImageAssetSelected={handleImageAssetSelected}
          />

          <View style={styles.content}>
            <CustomText text={t('setup_profile')} />
            <Text style={styles.TextContent}>{t('setup_profile_details')}</Text>
          </View>

          <CustomTextInput
            label={t('full_name')}
            placeholder={t('enter_full_name')}
            value={fullName}
            onChangeText={(text) => {
              setFullName(text);
              if (nameError) setNameError('');
            }}
            errorMessage={nameError}
          />

          <CustomTextInput
            label={t('email_address')}
            placeholder={t('enter_email')}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) setEmailError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            errorMessage={emailError}
            editable={!isEmailSignup}
          />

          <Text style={[styles.label, i18n.language === 'ar' && { textAlign: 'right' }]}>{t('phone_number')}</Text>
          <PhoneNumberInput
            phone={phone}
            setPhone={(text) => {
              if (!isPhoneSignup) {
                setPhone(text);
                if (phoneError) setPhoneError('');
                if (errorMessage) setErrorMessage('');
              }
            }}
            countryCode={countryCode}
            setCountryCode={(code) => {
              if (!isPhoneSignup) {
                setCountryCode(code);
              }
            }}
            phoneError={phoneError}
            errorMessage={errorMessage}
            onValidationChange={setIsPhoneValid}
            CustomStyle={{ backgroundColor: colors.white }}
            editable={!isPhoneSignup}
          />

          {/* Saudi / non-Saudi question replaces the old nationality dropdown. */}
          <Text style={styles.label}>{t('are_you_saudi')}</Text>
          <View style={styles.saudiToggleRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.saudiOption, isSaudi === true && styles.saudiOptionActive]}
              onPress={() => {
                setIsSaudi(true);
                setIdCardNumber('');
                if (idError) setIdError('');
                if (saudiError) setSaudiError('');
              }}
            >
              <Text style={[styles.saudiOptionText, isSaudi === true && styles.saudiOptionTextActive]}>
                {t('yes')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.saudiOption, isSaudi === false && styles.saudiOptionActive]}
              onPress={() => {
                setIsSaudi(false);
                if (saudiError) setSaudiError('');
              }}
            >
              <Text style={[styles.saudiOptionText, isSaudi === false && styles.saudiOptionTextActive]}>
                {t('no')}
              </Text>
            </TouchableOpacity>
          </View>
          {saudiError ? <Text style={styles.fieldError}>{saudiError}</Text> : null}
          <Text style={styles.disclaimer}>{t('saudi_disclaimer')}</Text>

          <CustomDropdown
            label={t('city') || 'City'}
            placeholder={t('select_city') || 'Select City'}
            value={city}
            onValueChange={(value) => {
              setCity(value);
              if (cityError) setCityError('');
            }}
            errorMessage={cityError}
            options={cityOptions}
          />

          {/* Iqama number is requested only for non-Saudis. */}
          {isSaudi === false && (
            <>
              <CustomTextInput
                label={t('national_id')}
                placeholder={t('national_id_placeholder')}
                value={IdCardNumber}
                onChangeText={(text) => {
                  // Only allow numeric values and limit to 10 characters
                  const numericText = text.replace(/[^0-9]/g, '').slice(0, 10);
                  setIdCardNumber(numericText);
                  if (idError) setIdError('');
                }}
                keyboardType="numeric"
                maxLength={10}
                errorMessage={idError}
              />
              <Text style={styles.vatNote}>{t('vat_note_non_saudi')}</Text>
            </>
          )}

          <CustomDropdown
            label={t('gender')}
            placeholder={t('select_gender')}
            value={gender}
            onValueChange={(value) => {
              setGender(value);
              if (genderError) setGenderError('');
            }}
            options={genderOptions}
            errorMessage={genderError}
          />

          <DateOfBirthPicker
            label={t('date_of_birth')}
            value={dob}
            onChange={(value) => {
              setDob(value);
              if (dobError) setDobError('');
            }}
            errorMessage={dobError}
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
              loading={loadingSkip}
              disabled={loadingSkip}
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
