import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
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

export const dobToDate = (value: DobValue): Date | null => {
  const day = parseInt(value.day, 10);
  const month = parseInt(value.month, 10);
  const year = parseInt(value.year, 10);
  if (!day || !month || !year) return null;

  const d = new Date(year, month - 1, day);
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) {
    return null;
  }
  return d;
};

const dateToDob = (date: Date): DobValue => ({
  day: String(date.getDate()),
  month: String(date.getMonth() + 1),
  year: String(date.getFullYear()),
});

/**
 * Computes age in whole years from a date of birth. Returns null if the
 * date is incomplete or invalid.
 */
export const computeAge = (value: DobValue): number | null => {
  const dob = dobToDate(value);
  if (!dob) return null;

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age >= 0 ? age : null;
};

export const isDobComplete = (value: DobValue): boolean => computeAge(value) !== null;

const MAX_AGE_YEARS = 100;

const DateOfBirthPicker: React.FC<Props> = ({ label, value, onChange, errorMessage }) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');
  const hasError = !!errorMessage;
  const [open, setOpen] = useState(false);
  // iOS shows the wheel inline, so the value stays uncommitted until confirm.
  const [tempDate, setTempDate] = useState<Date | null>(null);

  const selectedDate = dobToDate(value);
  const monthNames = isArabic ? MONTHS_AR : MONTHS_EN;

  const today = new Date();
  const minimumDate = new Date(
    today.getFullYear() - MAX_AGE_YEARS,
    today.getMonth(),
    today.getDate(),
  );
  // Default the wheel to ~20 years ago so users aren't scrolling from today.
  const defaultDate = new Date(today.getFullYear() - 20, 0, 1);
  const initialDate = selectedDate ?? defaultDate;

  const openPicker = () => {
    setTempDate(initialDate);
    setOpen(true);
  };

  // Android renders the platform dialog, which reports confirm/dismiss itself.
  const handleAndroidChange = (event: DateTimePickerEvent, date?: Date) => {
    setOpen(false);
    if (event.type === 'set' && date) {
      onChange(dateToDob(date));
    }
  };

  const handleConfirm = () => {
    setOpen(false);
    onChange(dateToDob(tempDate ?? initialDate));
  };

  const displayText = selectedDate
    ? `${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`
    : t('select_date_of_birth');

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.field, hasError && styles.fieldError]}
        onPress={openPicker}
      >
        <Text style={selectedDate ? styles.valueText : styles.placeholderText}>
          {displayText}
        </Text>
      </TouchableOpacity>

      {Platform.OS === 'android' ? (
        open && (
          <DateTimePicker
            value={initialDate}
            mode="date"
            display="spinner"
            maximumDate={today}
            minimumDate={minimumDate}
            onChange={handleAndroidChange}
          />
        )
      ) : (
        <Modal
          visible={open}
          transparent
          animationType="slide"
          onRequestClose={() => setOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setOpen(false)}>
                  <Text style={styles.modalAction}>{t('cancel')}</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>{t('select_date_of_birth')}</Text>
                <TouchableOpacity onPress={handleConfirm}>
                  <Text style={[styles.modalAction, styles.modalConfirm]}>
                    {t('confirm')}
                  </Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate ?? initialDate}
                mode="date"
                display="spinner"
                maximumDate={today}
                minimumDate={minimumDate}
                locale={isArabic ? 'ar' : 'en'}
                onChange={(_event, date) => date && setTempDate(date)}
              />
            </View>
          </View>
        </Modal>
      )}

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
  field: {
    height: mvs(40),
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: mvs(10),
    paddingHorizontal: mvs(12),
    backgroundColor: colors.gray,
    justifyContent: 'center',
  },
  fieldError: {
    borderColor: 'red',
  },
  valueText: {
    fontSize: mvs(14),
    color: colors.black,
  },
  placeholderText: {
    fontSize: mvs(14),
    color: colors.secondaryText,
  },
  errorText: {
    color: 'red',
    fontSize: mvs(12),
    marginTop: mvs(4),
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: mvs(16),
    borderTopRightRadius: mvs(16),
    paddingBottom: mvs(16),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: mvs(16),
    paddingVertical: mvs(12),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: mvs(15),
    fontWeight: '600',
    color: colors.black,
  },
  modalAction: {
    fontSize: mvs(14),
    color: colors.secondaryText,
  },
  modalConfirm: {
    color: colors.primary,
    fontWeight: '600',
  },
});

export default DateOfBirthPicker;
