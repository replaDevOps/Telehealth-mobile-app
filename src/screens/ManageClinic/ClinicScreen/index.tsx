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
import { useLocationStore } from '@store';
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
  // Same source of truth the Home tab uses, so both tabs rank clinics by the
  // user's actual position rather than the server's default ordering.
  const location = useLocationStore(state => state.location);
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
  // Tracks the position the list was last fetched for, so a change can trigger
  // a refetch. Starts undefined to distinguish "never fetched" from "no fix".
  const fetchedForLocationRef = useRef<{ lat: number; long: number } | null | undefined>(undefined);

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

      // Read imperatively so this callback stays stable and always sees the
      // latest location fix.
      const coords = useLocationStore.getState().location;
      fetchedForLocationRef.current = coords ? { lat: coords.lat, long: coords.long } : null;

      // Build params object
      const params: any = {
        name: query || '',
        lat: coords ? String(coords.lat) : '',
        long: coords ? String(coords.long) : '',
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

      console.log(`[ClinicScreen] Fetching clinics - Page: ${pageNo}, Filters:`, filters ? 'Yes' : 'No');
      console.log(params);
      const response = await apiClient.get(API.CLINIC.GET_CLINICS, {
        params: params,
      });
      console.log('response', response.data);

      if (response.data.success && response.data.data) {
        const clinics = transformClinicsData(response.data.data);
        console.log('clinics', clinics);

        const returnedCount = response.data.data.length;
        const hasNextPageUrl = !!(response.data.nextPageUrl);
        const hasMoreData = hasNextPageUrl && returnedCount > 0;

        setHasMore(hasMoreData);

        if (append) {
          // Append to existing clinics
          setRecommendedClinics(prev => {
            const newFeatured = clinics.filter(clinic => clinic.isFeatured);
            // Avoid duplicates by checking IDs
            const existingIds = new Set(prev.map(c => c.id));
            const uniqueNew = newFeatured.filter(c => !existingIds.has(c.id));
            return [...prev, ...uniqueNew];
          });
          setNearbyClinics(prev => {
            const newNearby = clinics.filter(clinic => !clinic.isFeatured);
            // Avoid duplicates
            const existingIds = new Set(prev.map(c => c.id));
            const uniqueNew = newNearby.filter(c => !existingIds.has(c.id));
            return [...prev, ...uniqueNew];
          });
        } else {
          // Replace existing clinics
          const featured = clinics.filter(clinic => clinic.isFeatured);
          const nearby = clinics.filter(clinic => !clinic.isFeatured);
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
      console.error('Error fetching clinics:', error);
      Toast.error(error.message || 'Failed to fetch clinics');
      if (!append) {
        setRecommendedClinics([]);
        setNearbyClinics([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isLoadingMoreRef.current = false;
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
        isFeatured: !!clinic.is_featured,
      };
    });
  };

  // Refetch when the position changes so the list re-ranks around the user -
  // parity with the Home tab.
  useEffect(() => {
    const prev = fetchedForLocationRef.current;

    // Nothing has been fetched yet; the initial fetch will pick the fix up.
    if (prev === undefined) return;

    const next = location ? { lat: location.lat, long: location.long } : null;
    const unchanged =
      (prev === null && next === null) ||
      (prev !== null && next !== null && prev.lat === next.lat && prev.long === next.long);
    if (unchanged) return;

    fetchAllClinics(currentSearchQueryRef.current, currentFilterParamsRef.current, 1, false);
  }, [location, fetchAllClinics]);

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

    try {
      const latestSearchQuery = currentSearchQueryRef.current;
      const latestFilterParams = currentFilterParamsRef.current;
      await fetchAllClinics(latestSearchQuery, latestFilterParams, 1, false, false);
    } catch (err) {
      console.error('Error refreshing clinic screen:', err);
    } finally {
      setRefreshing(false);
    }
  }, [fetchAllClinics]);

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
