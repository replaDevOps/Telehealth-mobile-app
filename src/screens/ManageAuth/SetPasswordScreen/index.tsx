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

type NavProps = StackNavigationProp<AuthStackParamList, 'SetPassword'>;

interface Props {
  navigation: NavProps;
}

export const SetPassword: React.FC<Props> = ({ navigation }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePassword = (password: string) => {
    // Example: Password must be at least 8 characters, include a number and a special character
    const passwordRegex =
      /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleNext = () => {
    setError('');

    if (!password || !confirmPassword) {
      setError('Both fields are required.');
      return;
    }

    // if (!validatePassword(password)) {
    //   setError(
    //     'Password must be at least 8 characters long and include a number and a special character.',
    //   );
    //   return;
    // }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      console.log('Password created:', password);
      navigation.navigate('Main', { screen: 'Home' });
    }, 1000);
  };

  return (
    <KeyboardAvoidScrollview>
      <Header2 title="" showLanguage={true} />

      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <LogoSvg />
        </View>

        <View style={styles.content}>
          <CustomText text="Set a New Password" />
        </View>

        <View style={styles.content}>
          <Text style={styles.TextContent}>
            OTP verified! Set your new password.
          </Text>
        </View>

        <View style={styles.InputContainer}>
          <CustomTextInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            errorMessage={error}
          />
          <CustomTextInput
            label="Confirm Password"
            placeholder="Confirm your password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={text => setConfirmPassword(text)}
            errorMessage={error}
          />
        </View>

        <CustomButton
          title={loading ? 'Processing…' : 'Update Password'}
          onPress={handleNext}
          // disabled={loading}
        />
      </View>
    </KeyboardAvoidScrollview>
  );
};
