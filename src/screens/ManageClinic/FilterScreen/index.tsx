import { FilterSection, CheckboxItem, StarRating } from '@components/atoms';
import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { BackSvg } from '@assets/icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './style';

interface FilterState {
  clinicTypes: { [key: string]: boolean };
  serviceGroups: { [key: string]: boolean };
  serviceNames: { [key: string]: boolean };
  cities: { [key: string]: boolean };
  ratings: { [key: number]: boolean };
}

export const FilterScreen = ({ navigation }) => {
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
        <Text style={styles.headerTitle}>Filters ({selectedFiltersCount})</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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

        {/* City */}
        <FilterSection title="City">
          {Object.keys(filters.cities).map(city => (
            <CheckboxItem
              key={city}
              label={city}
              checked={filters.cities[city]}
              onPress={() => handleCityToggle(city)}
            />
          ))}
        </FilterSection>

        {/* Rating */}
        <FilterSection title="Rating">
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
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={handleApply}
          activeOpacity={0.7}
        >
          <Text style={styles.applyText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
