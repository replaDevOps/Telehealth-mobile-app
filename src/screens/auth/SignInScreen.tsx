import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigation } from '@react-navigation/native';
import { CustomButton } from '../../components/common/CustomButton';
import { colors } from '../../config/colors';
import { spacing } from '../../styles/spacing';
import { typography } from '../../styles/typography';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const SignInScreen = () => {
  const navigation = useNavigation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: any) => {
    Alert.alert('Form Data', JSON.stringify(data));
    navigation.navigate('Main', { screen: 'Home' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>

      <CustomButton title="Sign In" onPress={handleSubmit(onSubmit)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.lg,
    color: colors.primary,
  },
});

export default SignInScreen;
