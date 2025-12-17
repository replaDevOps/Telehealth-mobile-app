import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { KeyboardAvoidScrollview } from '../../../components/common/keyboard-avoid-scrollview';
import { LogoSvg } from '../../../assets/icons';
import { Header2 } from '../../../components/common/Header2';
import CustomText from '../../../components/common/CustomText';
import { CustomButton } from '../../../components/common/CustomButton';
import { CustomTextInput } from '../../../components/common/CustomTextInput';
import { AuthStackParamList } from '../../../navigation/AuthNavigator';
import { styles } from './styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { apiClient } from '@services/api/api-client';
import { API } from '@services/api/api-endpoint';
import { tryCatch } from '@utils';
import { Toast } from 'toastify-react-native';

type NavProps = StackNavigationProp<AuthStackParamList, 'CreatePassword'>;

interface Props {
  navigation: NavProps;
}

export const CreatePassword: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePassword = (value: string) => {
    const passwordRegex =
      /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
    return passwordRegex.test(value);
  };

  const handleNext = async() => {
    setError('');

    if (!password || !confirmPassword) {
      setError(t('fields_required'));
      return;
    }

    if (!validatePassword(password)) {
      setError(
        'Password must be at least 8 characters long and include a number and a special character.',
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(t('passwords_not_match'));
      return;
    }
    setLoading(true);
    const [data,err]= await tryCatch(apiClient.post(API.AUTH.CREATE_PASSWORD, {
      password,
      confirmPassword,
    }));
    if (err) {
      Toast.error((err as Error).message);
      return; 
    }
    Toast.success(data.data.message);
    setLoading(false);
    navigation.navigate('Profile');
  };

  return (
    <KeyboardAvoidScrollview>
      <SafeAreaView style={{ flex: 1 }}>
        <Header2 title="" showLanguage={true} />

        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <LogoSvg />
          </View>

          <View style={styles.content}>
            <CustomText text={t('create_password')} />
          </View>

          <View style={styles.content}>
            <Text style={styles.TextContent}>
              {t('create_strong_password')}
            </Text>
          </View>

          <View style={styles.InputContainer}>
            <CustomTextInput
              label={t('password')}
              placeholder={t('enter_password')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              errorMessage={error}
            />
            <CustomTextInput
              label={t('confirm_password')}
              placeholder={t('confirm_your_password')}
              secureTextEntry
              value={confirmPassword}
              onChangeText={text => setConfirmPassword(text)}
              errorMessage={error}
            />
          </View>

          <CustomButton
            title={loading ? t('processing') : t('next')}
            onPress={handleNext}
            loading={loading}
            disabled={loading}
          />
        </View>
      </SafeAreaView>
    </KeyboardAvoidScrollview>
  );
};
