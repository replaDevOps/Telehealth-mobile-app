import React, { useEffect, useReducer, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Switch,
  Modal,
  Pressable,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { KeyboardAvoidScrollview } from '../../../components/common/keyboard-avoid-scrollview';
import { CustomTextInput } from '../../../components/common/CustomTextInput';
import { CustomDropdown } from '../../../components/common/CustomDropdwon';
import { CustomButton } from '../../../components/common/CustomButton';
import { Header2 } from '../../../components/common/Header2';
import PhoneNumberInput from '../../../components/common/PhoneTextInput';
import { colors } from '../../../styles/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { styles } from './style';
import { mvs } from '@config/metrices';
import { useTranslation } from 'react-i18next';
import { tryCatch } from '@utils';
import { API } from '@services/api/api-endpoint';
import { apiClient } from '@services/api/api-client';
import { Toast } from 'toastify-react-native';
import { useAuthStore, useProfileStore } from '@store';
import { RouteProp } from '@react-navigation/native';

const { height } = Dimensions.get('window');

type State = {
  fullName: string;
  email: string;
  gender: string;
  age: string;
  phone: string;
  countryCode: string;
  phoneError: string;
  errorMessage: string;
  isPhoneValid: boolean;
  language: string;
  notificationEnabled: boolean;
  deleteModalVisible: boolean;
};

const initialState: State = {
  fullName: '',
  email: '',
  gender: '',
  age: '',
  phone: '',
  countryCode: '',
  phoneError: '',
  errorMessage: '',
  isPhoneValid: true,
  language: 'English',
  notificationEnabled: false,
  deleteModalVisible: false,
};

// Field mapping configuration: API field -> State field with optional transformer
const fieldMapping: Record<string, { stateKey: keyof State; transformer?: (value: any) => any }> = {
  name: { stateKey: 'fullName' },
  phoneNo: { stateKey: 'phone' },
  email: { stateKey: 'email' },
  age: { stateKey: 'age', transformer: (val) => String(val ?? '') },
  gender: { 
    stateKey: 'gender', 
    transformer: (val) => {
      if (!val) return '';
      // Capitalize first letter to match dropdown values (Male, Female, Other)
      return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
    }
  },
  notificationStatus: { stateKey: 'notificationEnabled', transformer: (val) => !!val },
  language: { stateKey: 'language', transformer: (val) => val ?? 'English' },
};

// Helper function to map API data to state
const mapProfileDataToState = (data: any): Partial<State> => {
  const mappedData: Partial<State> = {};
  
  Object.keys(fieldMapping).forEach((apiKey) => {
    const mapping = fieldMapping[apiKey];
    const apiValue = data[apiKey];
    
    if (mapping.transformer) {
      mappedData[mapping.stateKey] = mapping.transformer(apiValue);
    } else {
      mappedData[mapping.stateKey] = apiValue ?? '';
    }
  });

  return mappedData;
};

export const ProfileSetting = ({ navigation, route }: { navigation: any; route?: RouteProp<any, 'ProfileSetting'> }) => {
  const { t } = useTranslation();
  const {isAuthenticated}=useAuthStore()
  const { logout } = useAuthStore();
  console.log("🚀 ~ ProfileSetting ~ isAuthenticated:", isAuthenticated)
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [state, dispatch] = useReducer(
    (state: State, action: Partial<State>) => ({ ...state, ...action }),
    initialState,
  );

  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    // Check if profile data was passed from SettingScreen
    const passedProfileData = route?.params?.profileData;
    
    if (passedProfileData) {
      // Use passed data instead of fetching
      const mappedData = mapProfileDataToState(passedProfileData);
      dispatch(mappedData);
      setLoadingData(false);
    } else {
      // Fetch profile data if not passed
    fetchProfile();
    }
  }, [route?.params?.profileData]);

  const fetchProfile = async () => {
    setLoadingData(true);
    const [res, err] = await tryCatch(
      apiClient.get(API.SETTINGS.VIEW_PROFILE),
    );
    console.log("🚀 ~ fetchProfile ~ res:", res)
    if (err) {
      Toast.error((err as Error).message);
      setLoadingData(false);
      return;
    }

    // Handle both res.data.data and res.data structures
    const data = res.data?.data || res.data || res;
    
    // Automatically map API response to state
    const mappedData = mapProfileDataToState(data);

    dispatch(mappedData);
    setLoadingData(false);
  };

  const updateProfile = async () => {
    console.log("🚀 ~ updateProfile ~ validateForm:", validateForm())
    setLoading(true);
    if (!validateForm()) {
      console.log("🚀 ~ updateProfile ~ validateForm:", validateForm())
      setLoading(false);
      return;
    }

    // Prepare payload matching API requirements
    // Gender should be lowercase (API expects "male", "female", "other")
    const payload = {
      name: state.fullName.trim(),
      phoneNo: state.phone.trim(),
      email: state.email.trim(),
      age: state.age.trim(),
      gender: state.gender.toLowerCase(), // Convert to lowercase for API
      notificationStatus: state.notificationEnabled,
      language: state.language,
    };

    const [res, err] = await tryCatch(
      apiClient.post(API.SETTINGS.UPDATE_PROFILE, payload),
    );
    console.log("🚀 ~ updateProfile ~ res:", res)
    if (err) {
      Toast.error((err as Error).message || 'Failed to update profile');
      setLoading(false);
      return;
    }

    // Show success message
    const successMessage = res.data?.message || res.data?.data?.message || 'Profile updated successfully';
    Toast.success(successMessage);
    
    // Refresh profile data in store after successful update
    useProfileStore.getState().refreshProfile();
    
    // Also refresh local profile data
    await fetchProfile();
    
    setLoading(false);
    navigation.goBack();
  };


  const validateForm = (): boolean => {
    if (!state.fullName.trim()) {
      Alert.alert('Error', t('please_enter_full_name'));
      return false;
    }

    if (!state.phone.trim() && !state.email.trim()) {
      Alert.alert('Error', t('please_enter_phone_email'));
      return false;
    }

    if (!state.gender) {
      Alert.alert('Error', t('please_select_gender'));
      return false;
    }

    if (!state.age.trim()) {
      Alert.alert('Error', t('please_enter_age'));
      return false;
    }

    return true;
  };


  const openDeleteModal = () => {
    dispatch({ deleteModalVisible: true });
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeDeleteModal = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 250,
      useNativeDriver: true,
    }).start(() => dispatch({ deleteModalVisible: false }));
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    
    try {
      // Call delete account API
      const response = await apiClient.delete(API.SETTINGS.DELETE_USER_ACCOUNT);

      // Check for success: false in response
      if (response.data?.success === false) {
        const errorMessage = response.data?.message || 'Failed to delete account';
        Toast.error(errorMessage);
        setDeletingAccount(false);
        closeDeleteModal();
        return;
      }

      // Success - show success message
      const successMessage = response.data?.message || 'Account deleted successfully';
      Toast.success(successMessage);
      
      // Close modal
      closeDeleteModal();
      
      // Logout and navigate to login
      setTimeout(() => {
        logout();
        navigation.replace('Auth', { screen: 'SignIn' });
      }, 1000);
    } catch (error: any) {
      console.error('Delete account error:', error);
      const errorMessage = 
        error?.response?.data?.message || 
        error?.data?.message ||
        error?.message || 
        'Failed to delete account. Please try again.';
      Toast.error(errorMessage);
      setDeletingAccount(false);
    closeDeleteModal();
    }
  };

  return (
    <KeyboardAvoidScrollview>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
        <Header2
          title={t('profile_settings')}
          useSave={true}
          handleSave={updateProfile}
          loading={loading}
        />

        {loadingData ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>{t('loading') || 'Loading...'}</Text>
          </View>
        ) : (
        <View style={styles.container}>
          {/* === All your existing fields (Personal Info, Password, Language, Mode) === */}
          {/* ... (unchanged code omitted for brevity) ... */}

          {/* Personal Information Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('personal_information')}</Text>
          </View>

          <CustomTextInput
            label={t('full_name')}
            placeholder={t('enter_full_name')}
            value={state.fullName}
            onChangeText={(text) => dispatch({ fullName: text })}
          />

          <Text style={styles.label}>{t('phone_number_label')}</Text>
          <PhoneNumberInput
            phone={state.phone}
            setPhone={(text) => dispatch({ phone: text })}
            countryCode={state.countryCode}
            setCountryCode={(text) => dispatch({ countryCode: text })}
            phoneError={state.phoneError}
            errorMessage={state.errorMessage}
            onValidationChange={(valid) => dispatch({ isPhoneValid: valid })}
            CustomStyle={{ backgroundColor: colors.gray }}
          />

          <CustomTextInput
            label={t('email_address_label')}
            placeholder={t('enter_email')}
            value={state.email}
            onChangeText={(text) => dispatch({ email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <CustomDropdown
            label={t('gender_label')}
            placeholder={t('select_gender')}
            value={state.gender}
            onValueChange={(text) => dispatch({ gender: text })}
            options={[
              { label: t('male'), value: 'Male' },
              { label: t('female'), value: 'Female' },
              { label: t('other'), value: 'Other' },
            ]}
          />

          <CustomTextInput
            label={t('age_label')}
            placeholder={t('enter_age')}
            value={state.age}
            onChangeText={(text) => dispatch({ age: text })}
            keyboardType="numeric"
          />

          {/* Password Manager */}
          <View style={[styles.sectionHeader, { marginTop: mvs(20) }]}>
            <Text style={styles.sectionTitle}>{t('password_manager')}</Text>
          </View>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('ChangePassword')}
            activeOpacity={0.7}
          >
            <Text style={styles.menuItemText}>{t('password_label')}</Text>
            <AntDesign name="right" size={20} color={colors.black} />
          </TouchableOpacity>

          {/* Multi-Language */}
          <View style={[styles.sectionHeader, { marginTop: mvs(30) }]}>
            <Text style={styles.sectionTitle}>{t('multi_language')}</Text>
          </View>
          <CustomDropdown
            label={t('language_label')}
            placeholder={t('select_language')}
            value={state.language}
            onValueChange={(text) => dispatch({ language: text })}
            options={[
              { label: t('english'), value: 'English' },
              { label: t('urdu'), value: 'Urdu' },
              { label: t('arabic'), value: 'Arabic' },
            ]}
          />

          {/* Mode */}
          <View style={[styles.sectionHeader, { marginTop: mvs(30) }]}>
            <Text style={styles.sectionTitle}>{t('mode')}</Text>
          </View>
          <View style={styles.switchItem}>
            <Text style={styles.switchLabel}>{t('notification')}</Text>
            <Switch
              value={state.notificationEnabled}
              onValueChange={(value) => dispatch({ notificationEnabled: value })}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          {/* Account */}
          <View style={[styles.sectionHeader, { marginTop: mvs(30) }]}>
            <Text style={styles.sectionTitle}>{t('account')}</Text>
          </View>

          <CustomButton
            title={t('delete_account')}
            onPress={openDeleteModal} // <-- Trigger bottom sheet
            style={styles.deleteButton}
            textStyle={styles.deleteButtonText}
          />
        </View>
        )}

        {/* ================== DELETE ACCOUNT BOTTOM SHEET MODAL ================== */}
        <Modal
          visible={state.deleteModalVisible}
          transparent
          animationType="none"
          onRequestClose={closeDeleteModal}
        >
          <Pressable style={styles.modalOverlay} onPress={closeDeleteModal}>
            <Animated.View
              style={[
                styles.bottomSheet,
                {
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Pressable onPress={() => {}}>
                {/* Prevent tap from closing */}
                {/* Grabber */}
                <View style={styles.grabber} />
                {/* Header */}
                <Text style={styles.modalTitle}>{t('delete_account')}</Text>
                {/* Warning text */}
                <Text style={styles.modalDescription}>
                  {t('are_you_sure_delete_account')}
                </Text>
                {/* Delete button */}
                <TouchableOpacity
                  style={[styles.modalDeleteButton, deletingAccount && { opacity: 0.6 }]}
                  onPress={handleDeleteAccount}
                  disabled={deletingAccount}
                >
                  {deletingAccount ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                  <Text style={styles.modalDeleteButtonText}>
                    {t('delete_account')}
                  </Text>
                  )}
                </TouchableOpacity>
                {/* Cancel */}
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={closeDeleteModal}
                >
                  <Text style={styles.modalCancelText}>{t('cancel')}</Text>
                </TouchableOpacity>
              </Pressable>
            </Animated.View>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </KeyboardAvoidScrollview>
  );
};
