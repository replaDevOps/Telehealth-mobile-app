import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { colors } from '../../styles/colors';
import { mvs } from '../../config/metrices';

interface Option {
  label: string;
  value: string;
}

interface CustomDropdownProps {
  label?: string;
  containerStyle?: ViewStyle;
  value: string;
  onValueChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  errorMessage?: string; // ← ADD
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  containerStyle,
  value,
  onValueChange,
  options,
  placeholder = 'Select an option',
  errorMessage, // ← ADD
}) => {
  const hasError = !!errorMessage;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <Dropdown
        style={[
          styles.dropdown,
          hasError && styles.dropdownError, // ← Red border
        ]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        itemTextStyle={styles.itemTextStyle}
        data={options}
        labelField="label"
        valueField="value"
        placeholder={placeholder}
        value={value}
        onChange={item => onValueChange(item.value)}
        maxHeight={250}
        activeColor={colors.gray}
      />

      {hasError && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: mvs(16),
  },
  label: {
    fontSize: mvs(13),
    marginBottom: mvs(6),
  },
  dropdown: {
    height: mvs(40),
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: mvs(10),
    paddingHorizontal: mvs(8),
    backgroundColor: colors.gray,
    justifyContent: 'center',
  },
  placeholderStyle: {
    fontSize: mvs(14),
    color: colors.secondaryText,
  },
  selectedTextStyle: {
    fontSize: mvs(14),
    color: colors.black,
  },
  itemTextStyle: {
    fontSize: mvs(14),
    color: colors.black,
  },
  dropdownError: {
    borderColor: 'red',
    borderWidth: 1,
  },
  errorText: {
    color: 'red',
    fontSize: mvs(12),
    marginTop: mvs(4),
  },
});

export { CustomDropdown };
