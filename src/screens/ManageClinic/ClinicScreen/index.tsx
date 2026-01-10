import { Header2 } from '@components/common/Header2';
import SearchServicesBar from '@components/common/SearchInput';
import NearbyClinics from '@components/molecules/ClinicListItem';
import RecommendedClinics from '@components/molecules/RecommendedClinics';
import { mvs } from '@config/metrices';
import { RecommandImage } from '@assets/images';
import { colors } from '../../../styles/colors';

import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, ActivityIndicator, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { apiClient } from '@services/api/api-client';
import { API } from '@services/api/api-endpoint';
import { ClinicApiResponse } from '../../../types/clinic.types';
import { Toast } from 'toastify-react-native';
import { translateCityToEnglish } from '../../../utils/cityTranslator';

interface FilterParams {
  clinicTypes?: string | null;
  serviceGroups?: { [key: number]: boolean };
  serviceNames?: { [key: number]: boolean };
  cities?: { [key: string]: boolean };
  ratings?: { [key: number]: boolean };
}

interface Clinic {
  id: string;
  name: string;
  specialty: string;
  rating: number | string;
  location: string;
  image?: { uri: string } | number;
  isFeatured?: boolean;
}

export const ClinicScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendedClinics, setRecommendedClinics] = useState<Clinic[]>([]);
  const [nearbyClinics, setNearbyClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterParams, setFilterParams] = useState<FilterParams | null>(null);

  // Listen for filter params from FilterScreen
  useFocusEffect(
    React.useCallback(() => {
      const filters = route.params?.filters;
      // Handle both null (reset) and filter object (apply)
      if (filters === null) {
        // Clear filters when reset
        setFilterParams(null);
      } else if (filters) {
        // Set filters when applied
        setFilterParams(filters);
      }
    }, [route.params?.filters])
  );

  useEffect(() => {
    fetchAllClinics(searchQuery, filterParams);
  }, [filterParams]);

  const fetchAllClinics = async (query: string = '', filters: FilterParams | null = null, pageNo: number = 1, recordsPerPage: number = 10) => {
    try {
      setLoading(true);
        
      // Build params object
      const params: any = {
        name: query || '',
        lat: '',
        long: '',
        city: '',
        rating: '',
        businessType: filters?.clinicTypes || '',
        pageNo: pageNo,
        recordsPerPage: recordsPerPage,
      };

      // Add groupIDs as array
      if (filters?.serviceGroups) {
        const groupIds = Object.keys(filters.serviceGroups)
          .filter(key => filters.serviceGroups![Number(key)])
          .map(key => Number(key));
        if (groupIds.length > 0) {
          params['groupIDs[]'] = groupIds;
        }
      }

      // Add serviceIDs as array
      if (filters?.serviceNames) {
        const serviceIds = Object.keys(filters.serviceNames)
          .filter(key => filters.serviceNames![Number(key)])
          .map(key => Number(key));
        if (serviceIds.length > 0) {
          params['serviceIDs[]'] = serviceIds;
        }
      }

      // Add city filter
      if (filters?.cities) {
        const selectedCities = Object.keys(filters.cities)
          .filter(key => filters.cities![key])
          .join(',');
        if (selectedCities) {
          params.city = selectedCities;
        }
      }

      // Add rating filter (get the highest selected rating)
      if (filters?.ratings) {
        const selectedRatings = Object.keys(filters.ratings)
          .filter(key => filters.ratings![Number(key)])
          .map(key => Number(key));
        if (selectedRatings.length > 0) {
          params.rating = Math.max(...selectedRatings).toString();
        }
      }

      const response = await apiClient.get(API.CLINIC.GET_CLINICS, {
        params: params,
      });
      console.log('response', response.data.data);
      if (response.data.success && response.data.data) {
        const clinics = transformClinicsData(response.data.data);
        
        // Recommended clinics are those with is_featured === true
        const featured = clinics.filter(clinic => clinic.isFeatured === true);
        // Nearby clinics are all other clinics
        const nearby = clinics.filter(clinic => clinic.isFeatured !== true);

        setRecommendedClinics(featured);
        setNearbyClinics(nearby);
      }
    } catch (error: any) {
      console.error('Error fetching clinics:', error);
      Toast.error(error.message || 'Failed to fetch clinics');
    } finally {
      setLoading(false);
    }
  };

  const transformClinicsData = (apiClinics: ClinicApiResponse[]): Clinic[] => {
    return apiClinics.map((clinic): Clinic => {
      // Use clinicName (not name) for the card title
      const clinicName = clinic.clinicName || clinic.name || 'Clinic';
      const location = clinic.details?.address || 
                      translateCityToEnglish(clinic.details?.city) || 
                      translateCityToEnglish(clinic.details?.district) || 
                      'Location not available';
      // Use businessType for the chip (specialty field)
      // Format businessType to ensure "Both" is displayed properly (case-insensitive)
      const businessType = clinic.businessType || null;
      const specialty = businessType && businessType.toString().toLowerCase() === 'both' 
        ? 'Both' 
        : (businessType || 'General');
      const rating = parseFloat(clinic.avgRating) || 0;
      
      // Use cover image, logo, or default image
      let image: { uri: string } | number = RecommandImage;
      if (clinic.details?.coverImage) {
        image = { uri: clinic.details.coverImage };
      } else if (clinic.details?.logo) {
        image = { uri: clinic.details.logo };
      }

      return {
        id: clinic.clinicID.toString(),
        name: clinicName, // This is displayed as the clinic name in the card
        specialty: specialty, // This is displayed in the chip
        rating: rating,
        location: location,
        image: image,
        isFeatured: clinic.is_featured === true,
      };
    });
  };

  // Refetch when search query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchAllClinics(searchQuery, filterParams);
    }, 500); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filterParams]);

  return (
    <SafeAreaView style={styles.container}>
      <Header2 title={t('clinic')} />
      <SearchServicesBar
        placeholder={t('search_clinics')}
        value={searchQuery}
        onChangeText={setSearchQuery}
        onFilterPress={() => navigation.navigate('FilterScreen', { currentFilters: filterParams })}
      />
      {loading ? (
        <ActivityIndicator 
          size="large" 
          color="#7625D7" 
          style={styles.loadingContainer}
        />
      ) : recommendedClinics.length === 0 && nearbyClinics.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>{t('no_clinics_found')}</Text>
          <Text style={styles.emptyMessage}>{t('no_clinics_message')}</Text>
        </View>
      ) : (
      <ScrollView style={styles.content}>
          {recommendedClinics.length > 0 && (
        <RecommendedClinics
              clinics={recommendedClinics}
          onClinicPress={clinic =>
                navigation.navigate('ClinicDetail', { clinic, clinicID: parseInt(clinic.id) })
          }
        />
          )}

          {nearbyClinics.length > 0 && (
        <NearbyClinics
              clinics={nearbyClinics}
          onClinicPress={clinic =>
                navigation.navigate('ClinicDetail', { clinic, clinicID: parseInt(clinic.id) })
          }
          onSeeAllPress={() => console.log('button is pressed')}
        />
          )}
      </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    paddingVertical: mvs(10),
    paddingHorizontal: mvs(15),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: mvs(50),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: mvs(30),
    paddingVertical: mvs(50),
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: mvs(10),
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 24,
  },
});
