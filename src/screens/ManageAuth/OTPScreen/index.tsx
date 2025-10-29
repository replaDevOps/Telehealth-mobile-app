import React, {
  useEffect,
  useRef,
  useState,
  createRef,
  RefObject,
} from 'react';
import { TextInput, TouchableOpacity, View, Text } from 'react-native';
import { useIsFocused, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import styles from './style';
import { KeyboardAvoidScrollview } from '../../../components/common/keyboard-avoid-scrollview';
import { LogoSvg } from '../../../assets/icons';
import { Header2 } from '../../../components/common/Header2';
import CustomText from '../../../components/common/CustomText';
import { CustomButton } from '../../../components/common/CustomButton';

import { AuthStackParamList } from '../../../navigation/AuthNavigator';

type NavProps = StackNavigationProp<AuthStackParamList, 'OTPScreen'>;
type RouteProps = RouteProp<AuthStackParamList, 'OTPScreen'>;

interface Props {
  navigation: NavProps;
  route: RouteProps;
}

export const NumberVerification: React.FC<Props> = ({ navigation, route }) => {
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(false);
  const [inputValues, setInputValues] = useState<string[]>(Array(5).fill(''));

  const inputRefs = useRef<RefObject<TextInput | null>[]>([]);

  useEffect(() => {
    inputRefs.current = Array(5)
      .fill(null)
      .map(() => createRef<TextInput>());
  }, []);

  const handleChangeText = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '');
    const newValues = [...inputValues];
    newValues[index] = digit;
    setInputValues(newValues);

    if (digit && index < 4) {
      inputRefs.current[index + 1]?.current?.focus();
    }

    const filled = newValues.every(v => v.length === 1);
    setLoading(filled);
  };

  const handleNext = () => {
    const otp = inputValues.join('');
    console.log('OTP submitted:', otp);
    navigation.navigate('CreatePassword');
  };

  return (
    <KeyboardAvoidScrollview>
      <Header2 title="" showLanguage={true} />

      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <LogoSvg />
        </View>

        <View style={styles.title}>
          <CustomText text="OTP Code" />
        </View>

        <View style={styles.content}>
          <Text style={styles.TextContent}>
            Enter the 5 digit OTP code sent to your email{' '}
            {route.params?.email ?? '+91****4@gmail.com'}.
          </Text>
        </View>

        <View style={styles.inputContainer}>
          {Array.from({ length: 5 }).map((_, idx) => (
            <TextInput
              key={idx}
              ref={inputRefs.current[idx] ?? undefined}
              style={styles.inputBox}
              maxLength={1}
              keyboardType="numeric"
              onChangeText={t => handleChangeText(t, idx)}
              value={inputValues[idx]}
              autoFocus={idx === 0 && isFocused}
            />
          ))}
        </View>

        <CustomButton
          title={loading ? 'Verifying…' : 'Confirm'}
          onPress={handleNext}
          // disabled={!loading}
        />

        <View style={styles.signinRow}>
          <Text style={styles.TextContent}>Didn’t receive code? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
            <Text style={styles.signinLink}>Resend Code</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidScrollview>
  );
};
