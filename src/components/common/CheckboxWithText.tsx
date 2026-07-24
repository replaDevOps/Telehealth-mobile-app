import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../styles/colors';

interface CheckboxWithTextProps {
  isChecked: boolean;
  error?: boolean;
  onToggle: () => void;
  children: React.ReactNode; // <-- any text or JSX
}

export const CheckboxWithText: React.FC<CheckboxWithTextProps> = ({
  isChecked,
  error = false,
  onToggle,
  children,
}) => {
  return (
    <View style={styles.row}>
      <TouchableOpacity
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isChecked }}
      >
        <Ionicons
          name={isChecked ? 'checkbox' : 'square-outline'}
          size={22}
          color={error ? 'red' : isChecked ? colors.primary : colors.borderDark}
        />
      </TouchableOpacity>

      <View style={styles.textContainer}>
        {typeof children === 'string' ? (
          <Text style={styles.text}>{children}</Text>
        ) : (
          children
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  text: {
    color: '#595959',
  },
});
