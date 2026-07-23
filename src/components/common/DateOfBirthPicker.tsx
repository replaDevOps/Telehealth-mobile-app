import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { useTranslation } from 'react-i18next';
import { colors } from '../../styles/colors';
import { mvs } from '../../config/metrices';

export interface DobValue {
  day: string;
  month: string; // 1-12 as string
  year: string;
}

interface Props {
  label?: string;
  value: DobValue;
  onChange: (value: DobValue) => void;
  errorMessage?: string;
}

const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MONTHS_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

/**
 * Computes age in whole years from a date of birth. Returns null if the
 * date is incomplete or invalid.
 */
export const computeAge = (value: DobValue): number | null => {
  const day = parseInt(value.day, 10);
  const month = parseInt(value.month, 10);
  const year = parseInt(value.year, 10);
  if (!day || !month || !year) return null;

  const dob = new Date(year, month - 1, day);
  // Guard against invalid combinations (e.g. 31 Feb rolls over).
  if (
    dob.getFullYear() !== year ||
    dob.getMonth() !== month - 1 ||
    dob.getDate() !== day
  ) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - year;
  const monthDiff = today.getMonth() - (month - 1);
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < day)) {
    age -= 1;
  }
  return age >= 0 ? age : null;
};

export const isDobComplete = (value: DobValue): boolean =>
  !!value.day && !!value.month && !!value.year && computeAge(value) !== null;

const DateOfBirthPicker: React.FC<Props> = ({ label, value, onChange, errorMessage }) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');
  const hasError = !!errorMessage;

  const monthNames = isArabic ? MONTHS_AR : MONTHS_EN;

  const dayOptions = useMemo(() => {
    const days = 31;
    return Array.from({ length: days }, (_, i) => ({
      label: String(i + 1),
      value: String(i + 1),
    }));
  }, []);

  const monthOptions = useMemo(
    () => monthNames.map((name, i) => ({ label: name, value: String(i + 1) })),
    [monthNames],
  );

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years: { label: string; value: string }[] = [];
    // Allow ages roughly 1 to 100.
    for (let y = currentYear - 1; y >= currentYear - 100; y--) {
      years.push({ label: String(y), value: String(y) });
    }
    return years;
  }, []);

  const dropdownStyle = [styles.dropdown, hasError && styles.dropdownError];

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.row}>
        <Dropdown
          style={[dropdownStyle, styles.dayField]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          itemTextStyle={styles.itemTextStyle}
          data={dayOptions}
          labelField="label"
          valueField="value"
          placeholder={t('day')}
          value={value.day}
          onChange={item => onChange({ ...value, day: item.value })}
          maxHeight={250}
          activeColor={colors.gray}
        />
        <Dropdown
          style={[dropdownStyle, styles.monthField]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          itemTextStyle={styles.itemTextStyle}
          data={monthOptions}
          labelField="label"
          valueField="value"
          placeholder={t('month')}
          value={value.month}
          onChange={item => onChange({ ...value, month: item.value })}
          maxHeight={250}
          activeColor={colors.gray}
        />
        <Dropdown
          style={[dropdownStyle, styles.yearField]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          itemTextStyle={styles.itemTextStyle}
          data={yearOptions}
          labelField="label"
          valueField="value"
          placeholder={t('year')}
          value={value.year}
          onChange={item => onChange({ ...value, year: item.value })}
          maxHeight={250}
          activeColor={colors.gray}
        />
      </View>

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
    color: colors.black,
    marginBottom: mvs(6),
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    gap: mvs(8),
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
  dayField: {
    flex: 1,
  },
  monthField: {
    flex: 1.4,
  },
  yearField: {
    flex: 1.2,
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
  },
  errorText: {
    color: 'red',
    fontSize: mvs(12),
    marginTop: mvs(4),
  },
});

export default DateOfBirthPicker;
