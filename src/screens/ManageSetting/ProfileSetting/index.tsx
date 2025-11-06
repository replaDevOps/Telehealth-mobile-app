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

const { height } = Dimensions.get('window');

export const ProfileSetting = ({ navigation }: { navigation: any }) => {
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
      'Account Deleted',
      'Your account has been permanently deleted.',
    );
    // navigation.replace('Login') or whatever you need
  };

  const handleSaveAndContinue = () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }
    if (!phone.trim() && !email.trim()) {
      Alert.alert('Error', 'Please enter either phone number or email address');
      return;
    }
    if (!gender) {
      Alert.alert('Error', 'Please select your gender');
      return;
    }
    if (!age.trim()) {
      Alert.alert('Error', 'Please enter your age');
      return;
    }

    Alert.alert('Success', 'Profile updated successfully!', [
      {
        text: 'OK',
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
          title="Profile Setting"
          useSave={true}
          handleSave={handleSave}
        />

        <View style={styles.container}>
          {/* === All your existing fields (Personal Info, Password, Language, Mode) === */}
          {/* ... (unchanged code omitted for brevity) ... */}

          {/* Personal Information Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
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
            CustomStyle={{ backgroundColor: colors.gray }}
          />

          <CustomTextInput
            label="Email Address"
            placeholder="Enter email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <CustomDropdown
            label="Gender"
            placeholder="Select Gender"
            value={gender}
            onValueChange={setGender}
            options={[
              { label: 'Male', value: 'Male' },
              { label: 'Female', value: 'Female' },
              { label: 'Other', value: 'Other' },
            ]}
          />

          <CustomTextInput
            label="Age"
            placeholder="Enter your age"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
          />

          {/* Password Manager */}
          <View style={[styles.sectionHeader, { marginTop: mvs(20) }]}>
            <Text style={styles.sectionTitle}>Password Manager</Text>
          </View>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('ChangePassword')}
            activeOpacity={0.7}
          >
            <Text style={styles.menuItemText}>Password</Text>
            <AntDesign name="right" size={20} color={colors.black} />
          </TouchableOpacity>

          {/* Multi-Language */}
          <View style={[styles.sectionHeader, { marginTop: mvs(30) }]}>
            <Text style={styles.sectionTitle}>Multi-Language</Text>
          </View>
          <CustomDropdown
            label="Language"
            placeholder="Select Language"
            value={language}
            onValueChange={setLanguage}
            options={[
              { label: 'English', value: 'English' },
              { label: 'Urdu', value: 'Urdu' },
              { label: 'Arabic', value: 'Arabic' },
            ]}
          />

          {/* Mode */}
          <View style={[styles.sectionHeader, { marginTop: mvs(30) }]}>
            <Text style={styles.sectionTitle}>Mode</Text>
          </View>
          <View style={styles.switchItem}>
            <Text style={styles.switchLabel}>Notification</Text>
            <Switch
              value={notificationEnabled}
              onValueChange={setNotificationEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          {/* Account */}
          <View style={[styles.sectionHeader, { marginTop: mvs(30) }]}>
            <Text style={styles.sectionTitle}>Account</Text>
          </View>

          <CustomButton
            title="Delete account"
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
                <Text style={styles.modalTitle}>Delete Account</Text>
                {/* Warning text */}
                <Text style={styles.modalDescription}>
                  Are you sure you want to delete your account?
                  {'\n'}
                  This account will be deleted permanently.
                </Text>
                {/* Delete button */}
                <TouchableOpacity
                  style={styles.modalDeleteButton}
                  onPress={handleDeleteAccount}
                >
                  <Text style={styles.modalDeleteButtonText}>
                    Delete account
                  </Text>
                </TouchableOpacity>
                {/* Cancel */}
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={closeDeleteModal}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
              </Pressable>
            </Animated.View>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </KeyboardAvoidScrollview>
  );
};
