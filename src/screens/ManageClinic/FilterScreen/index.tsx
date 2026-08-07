import { FilterSection, CheckboxItem, StarRating } from '@components/atoms';
import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { BackSvg } from '@assets/icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './style';
import { useTranslation } from 'react-i18next';
import { apiClient } from '@services/api/api-client';
import { API } from '@services/api/api-endpoint';
import { Toast } from 'toastify-react-native';
import citiesData from '@utils/cities-data.json';

interface ClinicType {
  id: string;
  name: string;
}

interface Group {
  id: number;
  name: string;
}

interface Service {
  id: number;
  name: string;
}

interface FilterState {
  clinicTypes: string | null; // Only one clinic type can be selected
  serviceGroups: { [key: number]: boolean }; // Changed to use group IDs
  serviceNames: { [key: number]: boolean }; // Changed to use service IDs
  cities: { [key: string]: boolean };
  ratings: { [key: number]: boolean };
}

// Cache for API responses
let clinicTypesCache: ClinicType[] | null = null;
const groupsCache: { [clinicType: string]: Group[] } = {};
const servicesCache: { [groupIdsKey: string]: Service[] } = {};

export const FilterScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');
  const [clinicTypes, setClinicTypes] = useState<ClinicType[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  
  // Initialize filters with current filters from route params or default
  const currentFilters = route.params?.currentFilters || null;
  const [filters, setFilters] = useState<FilterState>(() => {
    if (currentFilters) {
      return {
        clinicTypes: currentFilters.clinicTypes || null,
        serviceGroups: currentFilters.serviceGroups || {},
        serviceNames: currentFilters.serviceNames || {},
        cities: currentFilters.cities || {},
        ratings: currentFilters.ratings || {
          5: false,
          4: false,
          3: false,
          2: false,
          1: false,
        },
      };
    }
    return {
      clinicTypes: null,
      serviceGroups: {},
      serviceNames: {},
      cities: {},
      ratings: {
      5: false,
      4: false,
      3: false,
      2: false,
      1: false,
    },
    };
  });

  useEffect(() => {
    fetchClinicTypes();
    
    // Load groups and services if filters are already set (from previous filter application)
    if (filters.clinicTypes) {
      fetchGroups(filters.clinicTypes, true);
      
      const selectedGroupIds = Object.keys(filters.serviceGroups)
        .filter(key => filters.serviceGroups[Number(key)])
        .map(key => Number(key));
      
      if (selectedGroupIds.length > 0) {
        fetchServices(selectedGroupIds, true);
      }
    }
  }, []);

  // Fetch groups when clinic type is selected (but skip if already loaded from initial state)
  useEffect(() => {
    if (!filters.clinicTypes) {
      // Clear groups and services when no clinic type is selected
      setGroups([]);
      setServices([]);
      setFilters(prev => ({
        ...prev,
        serviceGroups: {},
        serviceNames: {},
      }));
      return;
    }

    // Always show groups for the current clinic type (cache or fetch)
    const cachedGroups = groupsCache[filters.clinicTypes];
    if (cachedGroups && cachedGroups.length > 0) {
      setGroups(cachedGroups);
    } else {
      fetchGroups(filters.clinicTypes, false);
    }
  }, [filters.clinicTypes]);

  // Fetch services when group IDs are selected (but skip if already loaded from initial state)
  useEffect(() => {
    const selectedGroupIds = Object.keys(filters.serviceGroups)
      .filter(key => filters.serviceGroups[Number(key)])
      .map(key => Number(key));

    if (selectedGroupIds.length === 0) {
      // Clear services when no groups are selected
      setServices([]);
      setFilters(prev => ({
        ...prev,
        serviceNames: {},
      }));
      return;
    }

    // Only fetch if services are not already cached for these group IDs
    const cacheKey = selectedGroupIds.sort().join(',');
    const cachedServices = servicesCache[cacheKey];
    if (cachedServices && cachedServices.length > 0) {
      // Use cached services if available
      if (services.length === 0) {
        setServices(cachedServices);
      }
    } else {
      // Fetch if not cached
      fetchServices(selectedGroupIds, false);
    }
  }, [filters.serviceGroups]);

  const fetchClinicTypes = async () => {
    // Use cache if available
    if (clinicTypesCache && clinicTypesCache.length > 0) {
      setClinicTypes(clinicTypesCache);
      return;
    }

    try {
      const response = await apiClient.get(API.CLINIC.GET_CLINIC_TYPES);
      if (response.data.success && response.data.data) {
        const data = response.data.data;
        // Cache the data
        clinicTypesCache = data;
        setClinicTypes(data);
      }
    } catch (error: any) {
      console.error('Error fetching clinic types:', error);
      Toast.error(error.message || 'Failed to fetch clinic types');
    }
  };

  const fetchGroups = async (clinicType: string, preserveSelection: boolean = false) => {
    // Use cache if available
    if (groupsCache[clinicType] && groupsCache[clinicType].length > 0) {
      setGroups(groupsCache[clinicType]);
      return;
    }

    try {
      setLoadingGroups(true);
      console.log('clinicType', clinicType);
      const response = await apiClient.get(API.CLINIC.GET_GROUPS, {
        params: {
          clinicType: clinicType,
        },
      });
      if (response.data.success && response.data.data) {
        console.log('response', response.data.data);
        const data = response.data.data;
        // Cache the data
        groupsCache[clinicType] = data;
        setGroups(data);
        
        // Only reset selections if not preserving (i.e., when clinic type changes)
        if (!preserveSelection) {
          setFilters(prev => ({
            ...prev,
            serviceGroups: {},
            serviceNames: {},
          }));
        }
      }
    } catch (error: any) {
      console.error('Error fetching groups:', error);
      Toast.error(error.message || 'Failed to fetch groups');
    } finally {
      setLoadingGroups(false);
    }
  };

  const fetchServices = async (groupIds: number[], preserveSelection: boolean = false) => {
    // Create cache key from sorted group IDs
    const cacheKey = groupIds.sort().join(',');
    
    // Use cache if available
    if (servicesCache[cacheKey] && servicesCache[cacheKey].length > 0) {
      setServices(servicesCache[cacheKey]);
      return;
    }

    try {
      setLoadingServices(true);
      // Build params with array format for groupIDs[]
      const params: any = {};
      groupIds.forEach(id => {
        if (!params['groupIDs[]']) {
          params['groupIDs[]'] = [];
        }
        params['groupIDs[]'].push(id);
      });
      
      const response = await apiClient.get(API.CLINIC.GET_SERVICES, {
        params: params,
      });
      if (response.data.success && response.data.data) {
        const data = response.data.data;
        // Cache the data
        servicesCache[cacheKey] = data;
        setServices(data);
        
        // Only reset selections if not preserving
        if (!preserveSelection) {
          setFilters(prev => ({
            ...prev,
            serviceNames: {},
          }));
        }
      }
    } catch (error: any) {
      console.error('Error fetching services:', error);
      Toast.error(error.message || 'Failed to fetch services');
    } finally {
      setLoadingServices(false);
    }
  };

  // Same source as profile creation/update: the value stays the canonical
  // English name (backend contract), only the label is localized.
  const cityOptions = useMemo(
    () =>
      (citiesData as { id: number; name: string; name_ar?: string }[]).map(c => ({
        label: isArabic ? c.name_ar || c.name : c.name,
        value: c.name,
      })),
    [isArabic],
  );

  // Calculate selected filters count dynamically
  const selectedFiltersCount = useMemo(() => {
    let count = 0;

    // Count clinic types (only one can be selected)
    if (filters.clinicTypes !== null) {
      count += 1;
    }

    // Count service groups
    count += Object.values(filters.serviceGroups).filter(Boolean).length;

    // Count service names
    count += Object.values(filters.serviceNames).filter(Boolean).length;

    // Count cities
    count += Object.values(filters.cities).filter(Boolean).length;

    // Count ratings - use Object.keys to properly handle number keys
    count += Object.keys(filters.ratings).filter(
      key => filters.ratings[Number(key)],
    ).length;

    return count;
  }, [filters]);

  const handleClinicTypeToggle = (typeId: string) => {
    // Only one clinic type can be selected - toggle or switch to the other
    const isSelectingDifferent = filters.clinicTypes !== typeId;
    setFilters({
      ...filters,
      clinicTypes: filters.clinicTypes === typeId ? null : typeId,
      // When switching to a different clinic type, clear groups and services so values update
      ...(isSelectingDifferent && filters.clinicTypes !== null
        ? { serviceGroups: {}, serviceNames: {} }
        : {}),
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

  const handleCityToggle = (city: string) => {
    setFilters({
      ...filters,
      cities: {
        ...filters.cities,
        [city]: !filters.cities[city],
      },
    });
  };

  const handleRatingToggle = (rating: number) => {
    setFilters({
      ...filters,
      ratings: {
        ...filters.ratings,
        [rating]: !filters.ratings[rating],
      },
    });
  };

  const handleReset = () => {
    const resetFilters = {
      clinicTypes: null,
      serviceGroups: {},
      serviceNames: {},
      cities: {},
      ratings: {
        5: false,
        4: false,
        3: false,
        2: false,
        1: false,
      },
    };
    setFilters(resetFilters);
    // Navigate back with null filters to clear them in ClinicScreen
    navigation.navigate('ClinicScreen', { filters: null });
  };

  const handleApply = () => {
    // Apply filters and navigate back with filter params
    console.log('Applying filters:', filters);
    console.log('Selected filters count:', selectedFiltersCount);
    navigation.navigate('ClinicScreen', { filters: filters });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            // Keep current filters when going back without applying
            navigation.goBack();
          }}
          style={styles.backButton}
        >
          <BackSvg />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {t('filters')} ({selectedFiltersCount})
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Clinic Type */}
        <FilterSection title={t('clinic_type')}>
          {clinicTypes.map((clinicType) => (
          <CheckboxItem
              key={clinicType.id}
              label={clinicType.name}
              checked={filters.clinicTypes === clinicType.id}
              onPress={() => handleClinicTypeToggle(clinicType.id)}
          />
          ))}
        </FilterSection>

        {/* Service Group */}
        <FilterSection title={t('service_group')}>
          {loadingGroups ? (
            <Text style={styles.loadingText}>Loading groups...</Text>
          ) : groups.length > 0 ? (
            groups.map((group) => (
          <CheckboxItem
                key={group.id}
                label={group.name}
                checked={filters.serviceGroups[group.id] || false}
                onPress={() => handleServiceGroupToggle(group.id)}
          />
            ))
          ) : filters.clinicTypes ? (
            <Text style={styles.emptyText}>No groups available</Text>
          ) : (
            <Text style={styles.emptyText}>Select a clinic type first</Text>
          )}
        </FilterSection>

        {/* Service Name */}
        <FilterSection title={t('service_name')}>
          {loadingServices ? (
            <Text style={styles.loadingText}>Loading services...</Text>
          ) : services.length > 0 ? (
            services.map((service) => (
          <CheckboxItem
                key={service.id}
                label={service.name}
                checked={filters.serviceNames[service.id] || false}
                onPress={() => handleServiceNameToggle(service.id)}
          />
            ))
          ) : Object.keys(filters.serviceGroups).some(key => filters.serviceGroups[Number(key)]) ? (
            <Text style={styles.emptyText}>No services available</Text>
          ) : (
            <Text style={styles.emptyText}>Select service groups first</Text>
          )}
        </FilterSection>

        {/* City */}
        <FilterSection title={t('city')} defaultExpanded={false}>
          {cityOptions.map(city => (
            <CheckboxItem
              key={city.value}
              label={city.label}
              checked={filters.cities[city.value] || false}
              onPress={() => handleCityToggle(city.value)}
            />
          ))}
        </FilterSection>

        {/* Rating */}
        <FilterSection title={t('rating')}>
          <View style={styles.ratingList}>
            {[5, 4, 3, 2, 1].map(rating => (
              <TouchableOpacity
                key={rating}
                style={styles.ratingRow}
                onPress={() => handleRatingToggle(rating)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    filters.ratings[rating] && styles.checkboxChecked,
                  ]}
                >
                  {filters.ratings[rating] && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
                <StarRating
                  rating={rating}
                  disabled
                  size={18}
                  onPress={() => handleRatingToggle(rating)}
                />
              </TouchableOpacity>
            ))}
          </View>
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
          <Text style={styles.applyText}>{t('apply')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
