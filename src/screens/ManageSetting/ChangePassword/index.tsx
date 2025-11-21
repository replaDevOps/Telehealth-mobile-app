import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { KeyboardAvoidScrollview } from '../../../components/common/keyboard-avoid-scrollview';
import { LogoSvg } from '../../../assets/icons';
import { Header2 } from '../../../components/common/Header2';
import CustomText from '../../../components/common/CustomText';
import { CustomTextInput } from '../../../components/common/CustomTextInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './style';
import { useTranslation } from 'react-i18next';

export const ChangePassword = ({ navigation }) => {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');

  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePassword = (password: string) => {
    // Example: Password must be at least 8 characters, include a number and a special character
    const passwordRegex =
      /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSave = () => {
    setError('');

    if (!password || !confirmPassword) {
      setError(t('fields_required'));
      return;
    }

    // if (!validatePassword(password)) {
    //   setError(
    //     'Password must be at least 8 characters long and include a number and a special character.',
    //   );
    //   return;
    // }

    if (password !== confirmPassword) {
      setError(t('passwords_not_match'));
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      console.log('Password created:', password);
      navigation.goBack();
    }, 1000);
  };

  return (
    <KeyboardAvoidScrollview>
      <SafeAreaView style={{ flex: 1 }}>
        <Header2 title={t('password_label')} useSave={true} handleSave={handleSave} />

        <View style={styles.container}>
          <View style={styles.InputContainer}>
            <CustomTextInput
              label={t('old_password')}
              placeholder={t('enter_old_password')}
              value={oldPassword}
              onChangeText={setOldPassword}
              secureTextEntry={true}
              errorMessage={error}
            />
            <CustomTextInput
              label={t('new_password')}
              placeholder={t('enter_new_password')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              errorMessage={error}
            />
            <CustomTextInput
              label={t('retype_password')}
              placeholder={t('retype_new_password')}
              secureTextEntry
              value={confirmPassword}
              onChangeText={text => setConfirmPassword(text)}
              errorMessage={error}
            />
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidScrollview>
  );
};
