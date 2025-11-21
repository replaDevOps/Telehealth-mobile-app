import { FilterSection, CheckboxItem, StarRating } from '@components/atoms';
import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { BackSvg } from '@assets/icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './style';
import { useTranslation } from 'react-i18next';

interface FilterState {
  clinicTypes: { [key: string]: boolean };
  serviceGroups: { [key: string]: boolean };
  serviceNames: { [key: string]: boolean };
  cities: { [key: string]: boolean };
  ratings: { [key: number]: boolean };
}

export const FilterScreen = ({ navigation }) => {
  const { t } = useTranslation();
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
    cities: {
      Makkah: false,
      Madina: false,
      Jeddah: false,
    },
    ratings: {
      5: false,
      4: false,
      3: false,
      2: false,
      1: false,
    },
  });

  // Calculate selected filters count dynamically
  const selectedFiltersCount = useMemo(() => {
    let count = 0;

    // Count clinic types
    count += Object.values(filters.clinicTypes).filter(Boolean).length;

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
      cities: {
        Makkah: false,
        Madina: false,
        Jeddah: false,
      },
      ratings: {
        5: false,
        4: false,
        3: false,
        2: false,
        1: false,
      },
    });
  };

  const handleApply = () => {
    // Apply filters and navigate back
    console.log('Applying filters:', filters);
    console.log('Selected filters count:', selectedFiltersCount);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
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
          <CheckboxItem
            label={t('dentistry')}
            checked={filters.clinicTypes.Dentistry}
            onPress={() => handleClinicTypeToggle('Dentistry')}
          />
          <CheckboxItem
            label={t('dermatology')}
            checked={filters.clinicTypes.Dermatology}
            onPress={() => handleClinicTypeToggle('Dermatology')}
          />
        </FilterSection>

        {/* Service Group */}
        <FilterSection title={t('service_group')}>
          <CheckboxItem
            label={t('diagnostics')}
            checked={filters.serviceGroups.Diagnostics}
            onPress={() => handleServiceGroupToggle('Diagnostics')}
          />
          <CheckboxItem
            label={t('oral_surgery')}
            checked={filters.serviceGroups['Oral Surgery']}
            onPress={() => handleServiceGroupToggle('Oral Surgery')}
          />
          <CheckboxItem
            label={t('prosthodontics')}
            checked={filters.serviceGroups.Prosthodontics}
            onPress={() => handleServiceGroupToggle('Prosthodontics')}
          />
          <CheckboxItem
            label={t('periodontics')}
            checked={filters.serviceGroups.Periodontics}
            onPress={() => handleServiceGroupToggle('Periodontics')}
          />
          <CheckboxItem
            label={t('restorative')}
            checked={filters.serviceGroups.Restorative}
            onPress={() => handleServiceGroupToggle('Restorative')}
          />
          <CheckboxItem
            label={t('pedodontics')}
            checked={filters.serviceGroups.Pedodontics}
            onPress={() => handleServiceGroupToggle('Pedodontics')}
          />
          <CheckboxItem
            label={t('implant')}
            checked={filters.serviceGroups.Implant}
            onPress={() => handleServiceGroupToggle('Implant')}
          />
        </FilterSection>

        {/* Service Name */}
        <FilterSection title={t('service_name')}>
          <CheckboxItem
            label={t('oral_examination')}
            checked={filters.serviceNames['Oral Examination']}
            onPress={() => handleServiceNameToggle('Oral Examination')}
          />
          <CheckboxItem
            label={t('oral_exam_home_visit')}
            checked={filters.serviceNames['Oral Exam - Home Visit']}
            onPress={() => handleServiceNameToggle('Oral Exam - Home Visit')}
          />
          <CheckboxItem
            label={t('implant_consultation')}
            checked={filters.serviceNames['Implant Consultation 2001']}
            onPress={() => handleServiceNameToggle('Implant Consultation 2001')}
          />
        </FilterSection>

        {/* City */}
        <FilterSection title={t('city')}>
          <CheckboxItem
            label={t('makkah')}
            checked={filters.cities.Makkah}
            onPress={() => handleCityToggle('Makkah')}
          />
          <CheckboxItem
            label={t('madina')}
            checked={filters.cities.Madina}
            onPress={() => handleCityToggle('Madina')}
          />
          <CheckboxItem
            label={t('jeddah')}
            checked={filters.cities.Jeddah}
            onPress={() => handleCityToggle('Jeddah')}
          />
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
