import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { colors } from '../../styles/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Import checkbox and section components
interface CheckboxItemProps {
  label: string;
  checked: boolean;
  onPress: () => void;
}

const CheckboxItem: React.FC<CheckboxItemProps> = ({
  label,
  checked,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.checkboxContainer}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </TouchableOpacity>
  );
};

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  children,
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <Text style={styles.sectionTitle}>{title}</Text>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#666"
        />
      </TouchableOpacity>
      {isExpanded && <View style={styles.sectionContent}>{children}</View>}
    </View>
  );
};

interface FilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterState) => void;
}

interface FilterState {
  clinicTypes: { [key: string]: boolean };
  serviceGroups: { [key: string]: boolean };
  serviceNames: { [key: string]: boolean };
}

export const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  visible,
  onClose,
  onApplyFilters,
}) => {
  const [filters, setFilters] = useState<FilterState>({
    clinicTypes: {
      Dentistry: false,
      Dermatology: false,
    },
    serviceGroups: {
      Diagnostics: false,
      'Oral Surgery': false,
      Prosthodontics: false,
      Periodontics: false,
      Restorative: false,
      Pedodontics: false,
      Implant: false,
    },
    serviceNames: {
      'Oral Examination': false,
      'Oral Exam - Home Visit': false,
      'Implant Consultation 2001': false,
    },
  });

  // Calculate selected filters count
  const selectedFiltersCount = useMemo(() => {
    let count = 0;
    count += Object.values(filters.clinicTypes).filter(Boolean).length;
    count += Object.values(filters.serviceGroups).filter(Boolean).length;
    count += Object.values(filters.serviceNames).filter(Boolean).length;
    return count;
  }, [filters]);

  const handleClinicTypeToggle = (type: string) => {
    setFilters({
      ...filters,
      clinicTypes: {
        ...filters.clinicTypes,
        [type]: !filters.clinicTypes[type],
      },
    });
  };

  const handleServiceGroupToggle = (service: string) => {
    setFilters({
      ...filters,
      serviceGroups: {
        ...filters.serviceGroups,
        [service]: !filters.serviceGroups[service],
      },
    });
  };

  const handleServiceNameToggle = (service: string) => {
    setFilters({
      ...filters,
      serviceNames: {
        ...filters.serviceNames,
        [service]: !filters.serviceNames[service],
      },
    });
  };

  const handleReset = () => {
    setFilters({
      clinicTypes: {
        Dentistry: false,
        Dermatology: false,
      },
      serviceGroups: {
        Diagnostics: false,
        'Oral Surgery': false,
        Prosthodontics: false,
        Periodontics: false,
        Restorative: false,
        Pedodontics: false,
        Implant: false,
      },
      serviceNames: {
        'Oral Examination': false,
        'Oral Exam - Home Visit': false,
        'Implant Consultation 2001': false,
      },
    });
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.bottomSheetContainer}>
          {/* Handle Bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              Filters ({selectedFiltersCount})
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Clinic Type */}
            <FilterSection title="Clinic Type">
              <CheckboxItem
                label="Dentistry"
                checked={filters.clinicTypes.Dentistry}
                onPress={() => handleClinicTypeToggle('Dentistry')}
              />
              <CheckboxItem
                label="Dermatology"
                checked={filters.clinicTypes.Dermatology}
                onPress={() => handleClinicTypeToggle('Dermatology')}
              />
            </FilterSection>

            {/* Service Group */}
            <FilterSection title="Service Group">
              {Object.keys(filters.serviceGroups).map(service => (
                <CheckboxItem
                  key={service}
                  label={service}
                  checked={filters.serviceGroups[service]}
                  onPress={() => handleServiceGroupToggle(service)}
                />
              ))}
            </FilterSection>

            {/* Service Name */}
            <FilterSection title="Service Name">
              {Object.keys(filters.serviceNames).map(service => (
                <CheckboxItem
                  key={service}
                  label={service}
                  checked={filters.serviceNames[service]}
                  onPress={() => handleServiceNameToggle(service)}
                />
              ))}
            </FilterSection>
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleReset}
              activeOpacity={0.7}
            >
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApply}
              activeOpacity={0.7}
            >
              <Text style={styles.applyText}>Apply Filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    flex: 1,
  },
  bottomSheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '85%',
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  sectionContent: {
    paddingTop: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#DDD',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#1A1A1A',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  resetButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  applyButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default FilterBottomSheet;
