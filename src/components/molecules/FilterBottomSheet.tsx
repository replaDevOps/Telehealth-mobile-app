import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../../styles/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { apiClient } from '@services/api/api-client';
import { API } from '@services/api/api-endpoint';
import { Toast } from 'toastify-react-native';

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

interface ClinicType {
  id: string;
  name: string;
}

interface ServiceGroup {
  id: number;
  name: string;
}

interface ServiceFilter {
  id: number;
  name: string;
}

interface FilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterState) => void;
  clinicID?: number;
  initialFilters?: FilterState | null;
}

interface FilterState {
  clinicTypes: { [key: string]: boolean }; // Using clinic type IDs as keys
  serviceGroups: { [key: number]: boolean }; // Using group IDs as keys
  serviceNames: { [key: number]: boolean }; // Using service IDs as keys
}

export const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  visible,
  onClose,
  onApplyFilters,
  clinicID,
  initialFilters,
}) => {
  const { t } = useTranslation();
  const [clinicTypes, setClinicTypes] = useState<ClinicType[]>([]);
  const [serviceGroups, setServiceGroups] = useState<ServiceGroup[]>([]);
  const [serviceFilters, setServiceFilters] = useState<ServiceFilter[]>([]);
  const [loadingClinicTypes, setLoadingClinicTypes] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    clinicTypes: {},
    serviceGroups: {},
    serviceNames: {},
  });

  // Initialize filters with previously applied filters when visible
  useEffect(() => {
    if (visible && initialFilters) {
      setFilters(initialFilters);
      // Fetch service groups if clinic types are selected
      const selectedClinicTypes = Object.keys(initialFilters.clinicTypes || {})
        .filter(key => initialFilters.clinicTypes[key])
        .map(key => key);
      if (selectedClinicTypes.length > 0) {
        // Use a flag to preserve filters when fetching groups
        // We'll fetch groups but preserve the service names from initialFilters
        fetchServiceGroups(selectedClinicTypes[0], true);
      }
    } else if (visible && !initialFilters) {
      // Reset filters if no initial filters provided
      setFilters({
        clinicTypes: {},
        serviceGroups: {},
        serviceNames: {},
      });
    }
  }, [visible, initialFilters]);

  // Fetch clinic types and service filters when component mounts or becomes visible
  useEffect(() => {
    if (visible) {
      fetchClinicTypes();
      if (clinicID) {
        fetchServiceFilters();
      }
    }
  }, [visible, clinicID]);

  // Fetch service groups when clinic types are selected (but not when initializing from initialFilters)
  useEffect(() => {
    // Skip if we're initializing from initialFilters (handled in the other useEffect)
    if (!visible) return;
    
    const selectedClinicTypes = Object.keys(filters.clinicTypes)
      .filter(key => filters.clinicTypes[key])
      .map(key => key);
    
    if (selectedClinicTypes.length > 0) {
      // Only fetch if we don't have groups already (to avoid refetching on initial load)
      if (serviceGroups.length === 0) {
        fetchServiceGroups(selectedClinicTypes[0], false);
      }
    } else {
      setServiceGroups([]);
      setFilters(prev => ({
        ...prev,
        serviceGroups: {},
        // Only clear service names if we're not preserving initial filters
        serviceNames: initialFilters?.serviceNames || {},
      }));
    }
  }, [filters.clinicTypes, visible]);

  const fetchClinicTypes = async () => {
    try {
      setLoadingClinicTypes(true);
      const response = await apiClient.get(API.CLINIC.GET_CLINIC_TYPES);
      if (response.data.success && response.data.data) {
        setClinicTypes(response.data.data);
        // Initialize filter state with clinic types, preserving existing selections
        setFilters(prev => {
          const initialClinicTypes: { [key: string]: boolean } = {};
          response.data.data.forEach((type: ClinicType) => {
            // Preserve existing selection if available, otherwise set to false
            initialClinicTypes[type.id] = prev.clinicTypes[type.id] ?? false;
          });
          return {
            ...prev,
            clinicTypes: initialClinicTypes,
          };
        });
      }
    } catch (error: any) {
      console.error('Error fetching clinic types:', error);
      Toast.error(error.message || 'Failed to fetch clinic types');
    } finally {
      setLoadingClinicTypes(false);
    }
  };

  const fetchServiceGroups = async (clinicType: string, preserveFilters: boolean = false) => {
    try {
      setLoadingGroups(true);
      const response = await apiClient.get(API.CLINIC.GET_GROUPS, {
        params: {
          clinicType: clinicType,
        },
      });
      if (response.data.success && response.data.data) {
        setServiceGroups(response.data.data);
        // Initialize filter state with service groups, preserving existing selections
        setFilters(prev => {
          const initialGroups: { [key: number]: boolean } = {};
          response.data.data.forEach((group: ServiceGroup) => {
            // Preserve existing selection if available, otherwise set to false
            initialGroups[group.id] = prev.serviceGroups[group.id] ?? false;
          });
          return {
            ...prev,
            serviceGroups: initialGroups,
            // Preserve service names if preserveFilters is true, otherwise clear them
            serviceNames: preserveFilters ? prev.serviceNames : {},
          };
        });
      }
    } catch (error: any) {
      console.error('Error fetching service groups:', error);
      Toast.error(error.message || 'Failed to fetch service groups');
    } finally {
      setLoadingGroups(false);
    }
  };

  const fetchServiceFilters = async () => {
    if (!clinicID) return;

    try {
      setLoadingServices(true);
      const response = await apiClient.get(API.CLINIC.GET_SERVICES_FILTER, {
        params: {
          clinicID: clinicID.toString(),
        },
      });

      if (response.data.success && response.data.data) {
        setServiceFilters(response.data.data);
        // Initialize filter state with service filters, preserving existing selections
        setFilters(prev => {
          const initialServices: { [key: number]: boolean } = {};
          response.data.data.forEach((service: ServiceFilter) => {
            // Preserve existing selection if available, otherwise set to false
            initialServices[service.id] = prev.serviceNames[service.id] ?? false;
          });
          return {
            ...prev,
            serviceNames: initialServices,
          };
        });
      }
    } catch (error: any) {
      console.error('Error fetching service filters:', error);
      Toast.error(error.message || 'Failed to fetch service filters');
    } finally {
      setLoadingServices(false);
    }
  };

  // Calculate selected filters count
  const selectedFiltersCount = useMemo(() => {
    let count = 0;
    count += Object.values(filters.clinicTypes).filter(Boolean).length;
    count += Object.values(filters.serviceGroups).filter(Boolean).length;
    count += Object.values(filters.serviceNames).filter(Boolean).length;
    return count;
  }, [filters]);

  const handleClinicTypeToggle = (typeId: string) => {
    setFilters({
      ...filters,
      clinicTypes: {
        ...filters.clinicTypes,
        [typeId]: !filters.clinicTypes[typeId],
      },
    });
  };

  const handleServiceGroupToggle = (groupId: number) => {
    setFilters({
      ...filters,
      serviceGroups: {
        ...filters.serviceGroups,
        [groupId]: !filters.serviceGroups[groupId],
      },
    });
  };

  const handleServiceNameToggle = (serviceId: number) => {
    setFilters({
      ...filters,
      serviceNames: {
        ...filters.serviceNames,
        [serviceId]: !filters.serviceNames[serviceId],
      },
    });
  };

  const handleReset = () => {
    const resetClinicTypes: { [key: string]: boolean } = {};
    clinicTypes.forEach(type => {
      resetClinicTypes[type.id] = false;
    });
    setFilters({
      clinicTypes: resetClinicTypes,
      serviceGroups: {},
      serviceNames: {},
    });
    setServiceGroups([]);
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
              {t('filters')} ({selectedFiltersCount})
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
            <FilterSection title={t('clinic_type')}>
              {loadingClinicTypes ? (
                <ActivityIndicator size="small" color={colors.primary} style={styles.loadingIndicator} />
              ) : clinicTypes.length > 0 ? (
                clinicTypes.map((clinicType) => (
                  <CheckboxItem
                    key={clinicType.id}
                    label={clinicType.name}
                    checked={filters.clinicTypes[clinicType.id] || false}
                    onPress={() => handleClinicTypeToggle(clinicType.id)}
                  />
                ))
              ) : (
                <Text style={styles.emptyMessage}>{t('no_clinic_types_found') || 'No clinic types found'}</Text>
              )}
            </FilterSection>

            {/* Service Group */}
            <FilterSection title={t('service_group')}>
              {loadingGroups ? (
                <ActivityIndicator size="small" color={colors.primary} style={styles.loadingIndicator} />
              ) : Object.keys(filters.clinicTypes).filter(key => filters.clinicTypes[key]).length > 0 && serviceGroups.length > 0 ? (
                serviceGroups.map((group) => (
                  <CheckboxItem
                    key={group.id}
                    label={group.name}
                    checked={filters.serviceGroups[group.id] || false}
                    onPress={() => handleServiceGroupToggle(group.id)}
                  />
                ))
              ) : (
                <Text style={styles.emptyMessage}>
                  {Object.keys(filters.clinicTypes).filter(key => filters.clinicTypes[key]).length > 0
                    ? t('no_service_groups_found') || 'No service groups found'
                    : t('select_clinic_type_first') || 'Select a clinic type first'}
                </Text>
              )}
            </FilterSection>

            {/* Service Name */}
            <FilterSection title={t('service_name')}>
              {loadingServices ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              ) : serviceFilters.length > 0 ? (
                serviceFilters.map((service) => (
                  <CheckboxItem
                    key={service.id}
                    label={service.name}
                    checked={filters.serviceNames[service.id] || false}
                    onPress={() => handleServiceNameToggle(service.id)}
                  />
                ))
              ) : (
                <Text style={styles.emptyMessage}>
                  {t('no_services_found') || 'No services found'}
                </Text>
              )}
            </FilterSection>
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleReset}
              activeOpacity={0.7}
            >
              <Text style={styles.resetText}>{t('reset')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApply}
              activeOpacity={0.7}
            >
              <Text style={styles.applyText}>{t('apply_filter')}</Text>
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
  loadingIndicator: {
    marginTop: 10,
    marginBottom: 10,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyMessage: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
    marginTop: 10,
    paddingVertical: 10,
  },
});

export default FilterBottomSheet;
