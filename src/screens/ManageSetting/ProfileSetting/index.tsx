import React, { useState } from 'react';
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

const { height } = Dimensions.get('window');

export const ProfileSetting = ({ navigation }: { navigation: any }) => {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(true);
  const [language, setLanguage] = useState('English');
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  // Bottom-sheet modal states
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(height))[0];

  const openDeleteModal = () => {
    setDeleteModalVisible(true);
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
    }).start(() => setDeleteModalVisible(false));
  };

  const handleDeleteAccount = () => {
    // Put your real delete logic here (API call, etc.)
    closeDeleteModal();
    Alert.alert(
      t('account_deleted'),
      t('account_permanently_deleted'),
    );
    // navigation.replace('Login') or whatever you need
  };

  const handleSaveAndContinue = () => {
    if (!fullName.trim()) {
      Alert.alert('Error', t('please_enter_full_name'));
      return;
    }
    if (!phone.trim() && !email.trim()) {
      Alert.alert('Error', t('please_enter_phone_email'));
      return;
    }
    if (!gender) {
      Alert.alert('Error', t('please_select_gender'));
      return;
    }
    if (!age.trim()) {
      Alert.alert('Error', t('please_enter_age'));
      return;
    }

    Alert.alert(t('success'), t('profile_updated_successfully'), [
      {
        text: t('ok'),
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  const handleSave = () => {
    console.log('pressed the save button');
  };

  return (
    <KeyboardAvoidScrollview>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
        <Header2
          title={t('profile_settings')}
          useSave={true}
          handleSave={handleSave}
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
            value={fullName}
            onChangeText={setFullName}
          />

          <Text style={styles.label}>{t('phone_number_label')}</Text>
          <PhoneNumberInput
            phone={phone}
            setPhone={setPhone}
            countryCode={countryCode}
            setCountryCode={setCountryCode}
            phoneError={phoneError}
            errorMessage={errorMessage}
            onValidationChange={setIsPhoneValid}
            CustomStyle={{ backgroundColor: colors.gray }}
          />

          <CustomTextInput
            label={t('email_address_label')}
            placeholder={t('enter_email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <CustomDropdown
            label={t('gender_label')}
            placeholder={t('select_gender')}
            value={gender}
            onValueChange={setGender}
            options={[
              { label: t('male'), value: 'Male' },
              { label: t('female'), value: 'Female' },
              { label: t('other'), value: 'Other' },
            ]}
          />

          <CustomTextInput
            label={t('age_label')}
            placeholder={t('enter_age')}
            value={age}
            onChangeText={setAge}
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
            value={language}
            onValueChange={setLanguage}
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
              value={notificationEnabled}
              onValueChange={setNotificationEnabled}
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
          visible={deleteModalVisible}
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
