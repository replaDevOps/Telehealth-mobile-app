import { Header2 } from '@components/common/Header2';
import SearchServicesBar from '@components/common/SearchInput';
import NearbyClinics from '@components/molecules/ClinicListItem';
import RecommendedClinics from '@components/molecules/RecommendedClinics';
import { mvs } from '@config/metrices';
import { colors } from '../../../styles/colors';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, ScrollView, ActivityIndicator, View, Text, RefreshControl } from 'react-native';
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterParams, setFilterParams] = useState<FilterParams | null>(null);
  const isInitialMountRef = useRef(true);
  const isLoadingMoreRef = useRef(false);
  const recordsPerPage = 10;
  // Refs to track current filter params and search query to avoid stale closures
  const currentFilterParamsRef = useRef<FilterParams | null>(null);
  const currentSearchQueryRef = useRef<string>('');
  const lastRequestIdRef = useRef<number>(0);

  // Listen for filter params from FilterScreen
  useFocusEffect(
    React.useCallback(() => {
      const filters = route.params?.filters;
      // Handle both null (reset) and filter object (apply)
      if (filters === null) {
        // Clear filters when reset
        setFilterParams(null);
        currentFilterParamsRef.current = null;
      } else if (filters) {
        // Set filters when applied
        setFilterParams(filters);
        currentFilterParamsRef.current = filters;
      }
    }, [route.params?.filters])
  );

  // Initial fetch on mount
  useEffect(() => {
    if (isInitialMountRef.current) {
      // Initialize refs
      currentFilterParamsRef.current = filterParams;
      currentSearchQueryRef.current = searchQuery;
      fetchAllClinics(searchQuery, filterParams, 1, false);
      isInitialMountRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const fetchAllClinics = useCallback(async (
    query: string = '',
    filters: FilterParams | null = null,
    pageNo: number = 1,
    append: boolean = false,
    showCenterLoader: boolean = true
  ) => {
    const requestId = ++lastRequestIdRef.current;

    try {
      if (append) {
        setLoadingMore(true);
      } else {
        if (showCenterLoader) {
          setLoading(true);
        }
        setLoadingMore(false); // Ensure loadingMore is reset if we are doing a fresh load
        setCurrentPage(1);
        setHasMore(true);
      }

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

      console.log(`[ClinicScreen] Fetching clinics (ReqID: ${requestId}) - Page: ${pageNo}, Filters:`, filters ? 'Yes' : 'No');
      console.log(params)
      const response = await apiClient.get(API.CLINIC.GET_CLINICS, {
        params: params,
      });
      // console.log('response', response.data);
      console.log('response', response.data);
      // Check if this request is still the latest one
      if (requestId !== lastRequestIdRef.current) {
        console.log(`[ClinicScreen] Ignoring stale response (ReqID: ${requestId}, Last: ${lastRequestIdRef.current})`);
        return;
      }

      if (response.data.success && response.data.data) {
        const clinics = transformClinicsData(response.data.data);
        console.log('clinics', clinics);
        // Check if there's more data using nextPageUrl from backend
        // Also check if the current page returned fewer items than perPage, which implies end of list
        const returnedCount = response.data.data.length;
        const hasNextPageUrl = !!(response.data.nextPageUrl);
        // If we got 0 items, definitely no more data. 
        // If we got items but less than perPage, usually means end of list too.
        const hasMoreData = hasNextPageUrl && returnedCount > 0;

        setHasMore(hasMoreData);

        if (append) {
          // Append to existing clinics
          setRecommendedClinics(prev => {
            const newFeatured = clinics.filter(clinic => clinic.isFeatured === true);
            // Avoid duplicates by checking IDs
            const existingIds = new Set(prev.map(c => c.id));
            const uniqueNew = newFeatured.filter(c => !existingIds.has(c.id));
            return [...prev, ...uniqueNew];
          });
          setNearbyClinics(prev => {
            const newNearby = clinics.filter(clinic => clinic.isFeatured !== true);
            // Avoid duplicates
            const existingIds = new Set(prev.map(c => c.id));
            const uniqueNew = newNearby.filter(c => !existingIds.has(c.id));
            return [...prev, ...uniqueNew];
          });
        } else {
          // Replace existing clinics
          const featured = clinics.filter(clinic => clinic.isFeatured === true);
          const nearby = clinics.filter(clinic => clinic.isFeatured !== true);
          setRecommendedClinics(featured);
          setNearbyClinics(nearby);
        }

        // Update current page
        if (response.data.currentPage) {
          setCurrentPage(response.data.currentPage);
        } else {
          setCurrentPage(pageNo);
        }
      }
    } catch (error: any) {
      // Check if this request is still the latest one
      if (requestId !== lastRequestIdRef.current) {
        return;
      }
      console.error('Error fetching clinics:', error);
      Toast.error(error.message || 'Failed to fetch clinics');
      if (!append) {
        setRecommendedClinics([]);
        setNearbyClinics([]);
      }
    } finally {
      // Only turn off loading if this was the latest request
      if (requestId === lastRequestIdRef.current) {
        setLoading(false);
        setLoadingMore(false);
        isLoadingMoreRef.current = false;
      }
    }
  }, [recordsPerPage]);

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

      // Use cover image or logo when available; leave undefined otherwise so
      // the card falls back to ClinicAvatar (initials) instead of a dummy image.
      let image: { uri: string } | undefined;
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

  // Refetch when filter params or search query changes
  useEffect(() => {
    // Skip on initial mount (handled by initial fetch useEffect)
    if (isInitialMountRef.current) {
      return;
    }

    // Cancel any ongoing load more operations
    isLoadingMoreRef.current = false;

    // Update refs with latest values BEFORE any async operations
    currentFilterParamsRef.current = filterParams;
    currentSearchQueryRef.current = searchQuery;

    // Clear data immediately to prevent flickering
    setRecommendedClinics([]);
    setNearbyClinics([]);
    setLoading(true);
    // Reset pagination
    setCurrentPage(1);
    setHasMore(true);

    // Use a short debounce to batch rapid changes
    const timeoutId = setTimeout(() => {
      fetchAllClinics(searchQuery, filterParams, 1, false);
    }, 300);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterParams, searchQuery, fetchAllClinics]);

  // Load more clinics when scrolling to end
  const loadMoreClinics = useCallback(() => {
    // Prevent duplicate calls
    if (isLoadingMoreRef.current || loading || loadingMore || !hasMore) {
      return;
    }

    // Use refs to get the latest filter params and search query to avoid stale closures
    const latestFilterParams = currentFilterParamsRef.current;
    const latestSearchQuery = currentSearchQueryRef.current;

    isLoadingMoreRef.current = true;
    const nextPage = currentPage + 1;
    fetchAllClinics(latestSearchQuery, latestFilterParams, nextPage, true);
  }, [loading, loadingMore, hasMore, currentPage, fetchAllClinics]);

  // Handle scroll to detect end
  const handleScroll = useCallback((event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;

    // Validate that we have valid dimensions
    if (!contentSize.height || !layoutMeasurement.height) {
      return;
    }

    // Calculate distance from bottom
    const paddingToBottom = 200; // Increased threshold for better detection
    const distanceFromBottom = contentSize.height - (layoutMeasurement.height + contentOffset.y);
    const isCloseToBottom = distanceFromBottom <= paddingToBottom;

    // Only trigger if we're close to bottom, have more data, and not already loading
    if (isCloseToBottom && hasMore && !loadingMore && !loading && !isLoadingMoreRef.current) {
      loadMoreClinics();
    }
  }, [hasMore, loadingMore, loading, loadMoreClinics]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setCurrentPage(1);
    setHasMore(true);

    await fetchAllClinics(searchQuery, filterParams, 1, false, false);

    setRefreshing(false);
  }, [searchQuery, filterParams, fetchAllClinics]);

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
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.loadingContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#7625D7']}
              tintColor="#7625D7"
            />
          }
        >
          <ActivityIndicator size="large" color="#7625D7" />
        </ScrollView>
      ) : recommendedClinics.length === 0 && nearbyClinics.length === 0 ? (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#7625D7']}
              tintColor="#7625D7"
            />
          }
        >
          <Text style={styles.emptyTitle}>{t('no_clinics_found')}</Text>
          <Text style={styles.emptyMessage}>{t('no_clinics_message')}</Text>
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.content}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onMomentumScrollEnd={handleScroll}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#7625D7']}
              tintColor="#7625D7"
            />
          }
        >
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

          {/* Loading indicator for pagination */}
          {loadingMore && (
            <View style={styles.loadingMoreContainer}>
              <ActivityIndicator size="small" color="#7625D7" />
            </View>
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
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: mvs(50),
  },
  emptyContainer: {
    flexGrow: 1,
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
  loadingMoreContainer: {
    paddingVertical: mvs(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
