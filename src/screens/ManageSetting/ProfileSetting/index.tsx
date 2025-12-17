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
import { useAuthStore } from '@store';

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

export const ProfileSetting = ({ navigation }: { navigation: any }) => {
  const { t } = useTranslation();
  const {isAuthenticated}=useAuthStore()
  console.log("🚀 ~ ProfileSetting ~ isAuthenticated:", isAuthenticated)
  const [loading, setLoading] = useState(false);
  const [state, dispatch] = useReducer(
    (state: State, action: Partial<State>) => ({ ...state, ...action }),
    initialState,
  );

  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    fetchProfile();
  }, []);


  const fetchProfile = async () => {
    const [res, err] = await tryCatch(
      apiClient.get(API.SETTINGS.VIEW_PROFILE),
    );

    if (err) {
      Toast.error((err as Error).message);
      return;
    }

    const data = res.data;

    dispatch({
      fullName: data.name ?? '',
      phone: data.phoneNo ?? '',
      email: data.email ?? '',
      age: String(data.age ?? ''),
      gender: data.gender ?? '',
      notificationEnabled: !!data.notificationStatus,
      language: data.language ?? 'English',
    });
  };

  const updateProfile = async () => {
    setLoading(true);
    if (!validateForm()) {
      setLoading(false);
      return;
    }
    const payload = {
      name: state.fullName,
      phoneNo: state.phone,
      email: state.email,
      age: state.age,
      gender: state.gender,
      notificationStatus: state.notificationEnabled,
      language: state.language,
    };

    const [res, err] = await tryCatch(
      apiClient.post(API.SETTINGS.UPDATE_PROFILE, payload),
    );

    if (err) {
      Toast.error((err as Error).message);
      setLoading(false);
      return;
    }

    Toast.success(res.data.message);
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

  const handleDeleteAccount = () => {
    closeDeleteModal();
    Alert.alert(t('account_deleted'), t('account_permanently_deleted'));
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
                  style={styles.modalDeleteButton}
                  onPress={handleDeleteAccount}
                >
                  <Text style={styles.modalDeleteButtonText}>
                    {t('delete_account')}
                  </Text>
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
