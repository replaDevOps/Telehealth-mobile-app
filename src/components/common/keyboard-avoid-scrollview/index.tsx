import React from 'react';
import { StyleProp, StyleSheet, ViewStyle, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { mvs } from '../../../config/metrices';
import { colors } from '../../../styles/colors';
type props = {
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  contentContainerStyle?: StyleProp<ViewStyle>;
  children?: JSX.Element | JSX.Element[];
};
export const KeyboardAvoidScrollview = (props: props) => {
  const {
    children,
    contentContainerStyle,
    keyboardShouldPersistTaps = 'never',
  } = props;
  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      enableOnAndroid={true}
      extraScrollHeight={Platform.OS === 'android' ? mvs(100) : mvs(30)}
      keyboardOpeningTime={0}
      contentContainerStyle={[
        styles.contentContainerStyle,
        contentContainerStyle,
      ]}
    >
      {children}
    </KeyboardAwareScrollView>
  );
};
const styles = StyleSheet.create({
  contentContainerStyle: {
    flexGrow: 1,
    paddingHorizontal: mvs(20),
    backgroundColor: colors.white,
  },
});
