import { FilterSection, CheckboxItem, StarRating } from '@components/atoms';
import { colors } from '../../../styles/colors';
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { BackSvg } from '@assets/icons';
import { mvs } from '@config/metrices';

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: mvs(10),
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: mvs(50),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  ratingList: {
    gap: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkmarkText: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
    zIndex: 9999,
  },
});
