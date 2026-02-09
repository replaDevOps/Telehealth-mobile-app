import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, ScrollView, StyleSheet, StatusBar, ActivityIndicator, Text, Platform, PermissionsAndroid, RefreshControl } from 'react-native';
import HomeHeader from '../../../components/molecules/HomeHeadder';
import { colors } from '../../../styles/colors';
import { mvs } from '../../../config/metrices';
import RecommendedClinics from '../../../components/molecules/RecommendedClinics';
import NearbyClinics from '../../../components/molecules/ClinicListItem';
import { RecommandImage } from '@assets/images';
import { useTranslation } from 'react-i18next';
import { apiClient } from '@services/api/api-client';
import { API } from '@services/api/api-endpoint';
import { ClinicApiResponse } from '../../../types/clinic.types';
import { Toast } from 'toastify-react-native';
import { useCartCount } from '../../../hooks/useCartCount';
import { useNotificationCount } from '../../../hooks/useNotificationCount';
import { useLocationStore } from '@store';

interface Clinic {
  id: string;
  name: string;
  specialty: string;
  rating: number | string;
  location: string;
  image?: { uri: string } | number;
  isFeatured?: boolean;
}

export const HomeScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { cartCount } = useCartCount();
  const { notificationCount } = useNotificationCount();
  const { location, isLoading: isLocationLoading, fetchLocation } = useLocationStore();
  const [recommendedClinics, setRecommendedClinics] = useState<Clinic[]>([]);
  const [nearbyClinics, setNearbyClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [hasAudioPermission, setHasAudioPermission] = useState(false);
  const [hasVideoPermission, setHasVideoPermission] = useState(false);
  
  // Refs for pagination and preventing stale closures
  const isInitialMountRef = useRef(true);
  const isLoadingMoreRef = useRef(false);
  const currentSearchQueryRef = useRef('');
  const currentLocationRef = useRef<{ lat: number; long: number } | null>(null);
  const recordsPerPage = 10;

  // Transform API response to Clinic format
  const transformClinicsData = (apiClinics: ClinicApiResponse[]): Clinic[] => {
    return apiClinics.map((clinic): Clinic => {
      // Use clinicName (not name) for the card title
      const clinicName = clinic.clinicName || clinic.name || 'Clinic';
      const location = clinic.details?.address ||
        clinic.details?.city ||
        clinic.details?.district ||
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

  // Fetch clinics function
  const fetchClinics = useCallback(async (
    lat?: number, 
    long?: number, 
    pageNo: number = 1, 
    recordsPerPage: number = 10, 
    searchName: string = '', 
    append: boolean = false
  ) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setLoadingMore(false);
        setCurrentPage(1);
        setHasMore(true);
      }

      const params: any = {
        name: searchName || '',
        pageNo: pageNo,
        recordsPerPage: recordsPerPage,
      };
      
      // Only include lat and long if they are provided
      // if (lat !== undefined && long !== undefined) {
      //   params.lat = lat.toString();
      //   params.long = long.toString();
      // }
      
      const response = await apiClient.get(API.CLINIC.GET_CLINICS, {
        params: params,
      });
      console.log('response', response.data);
      
      if (response.data.success && response.data.data) {
        const clinics = transformClinicsData(response.data.data);

        // Check if there's more data using nextPageUrl from backend
        const returnedCount = response.data.data.length;
        const hasNextPageUrl = !!(response.data.nextPageUrl);
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

  // Request permissions and ensure location fetch is running (in background)
  useEffect(() => {
    requestPermissions();
    fetchLocation(); // Runs in background; no-op if already loading
  }, [fetchLocation]);

  // Fetch clinics when component mounts if location is available
  useEffect(() => {
    console.log('Location:', location);
    if (isInitialMountRef.current) {
      // Initialize refs
      currentSearchQueryRef.current = searchQuery;
      if (location) {
        currentLocationRef.current = { lat: location.lat, long: location.long };
        fetchClinics(location.lat, location.long, 1, recordsPerPage, searchQuery, false);
      } else {
        currentLocationRef.current = null;
        fetchClinics(undefined, undefined, 1, recordsPerPage, searchQuery, false);
      }
      isInitialMountRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Refetch when search query or location changes (with debounce)
  useEffect(() => {
    // Skip on initial mount (handled by initial fetch useEffect)
    if (isInitialMountRef.current) {
      return;
    }

    // Cancel any ongoing load more operations
    isLoadingMoreRef.current = false;

    // Update refs with latest values
    currentSearchQueryRef.current = searchQuery;
    if (location) {
      currentLocationRef.current = { lat: location.lat, long: location.long };
    } else {
      currentLocationRef.current = null;
    }

    // Clear data immediately to prevent flickering
    setRecommendedClinics([]);
    setNearbyClinics([]);
    setLoading(true);
    setCurrentPage(1);
    setHasMore(true);

    const timeoutId = setTimeout(() => {
      if (location) {
        fetchClinics(location.lat, location.long, 1, recordsPerPage, searchQuery, false);
      } else {
        fetchClinics(undefined, undefined, 1, recordsPerPage, searchQuery, false);
      }
    }, 500); // Debounce search

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, location, fetchClinics]);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const cameraGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs camera access for video consultations',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        const audioGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'This app needs microphone access for audio and video consultations',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        console.log('📱 [Permissions] Camera:', cameraGranted);
        console.log('📱 [Permissions] Audio:', audioGranted);

        setHasAudioPermission(audioGranted === PermissionsAndroid.RESULTS.GRANTED);
        setHasVideoPermission(
          cameraGranted === PermissionsAndroid.RESULTS.GRANTED &&
          audioGranted === PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (err) {
        console.warn('📱 [Permissions] Error requesting permissions:', err);
        setHasAudioPermission(false);
        setHasVideoPermission(false);
      }
    } else {
      // iOS permissions are handled at runtime by the system
      setHasAudioPermission(true);
      setHasVideoPermission(true);
    }
  };

  const handleLocationPress = () => {
    console.log('Location pressed');
    navigation.navigate('NearbyClinics');
  };

  const handleCartPress = () => {
    navigation.navigate('CartScreen');
  };

  const handleNotificationPress = () => {
    navigation.navigate('Notification');
  };

  const handleSearchPress = () => {
    // Search is handled by onChangeText with debounce
    // This can be used for submit if needed
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setRecommendedClinics([]);
    setNearbyClinics([]);
    setCurrentPage(1);
    setHasMore(true);
    
    if (location) {
      await fetchClinics(location.lat, location.long, 1, recordsPerPage, searchQuery, false);
    } else {
      await fetchClinics(undefined, undefined, 1, recordsPerPage, searchQuery, false);
    }
    
    setRefreshing(false);
  }, [location, searchQuery, fetchClinics, recordsPerPage]);

  const handleSLPress = () => {
    navigation.navigate('SelectLocation');
  };

  // Load more clinics when scrolling to end
  const loadMoreClinics = useCallback(() => {
    // Prevent duplicate calls
    if (isLoadingMoreRef.current || loading || loadingMore || !hasMore) {
      return;
    }

    // Use refs to get the latest search query and location to avoid stale closures
    const latestSearchQuery = currentSearchQueryRef.current;
    const latestLocation = currentLocationRef.current;

    isLoadingMoreRef.current = true;
    const nextPage = currentPage + 1;
    
    if (latestLocation) {
      fetchClinics(latestLocation.lat, latestLocation.long, nextPage, recordsPerPage, latestSearchQuery, true);
    } else {
      fetchClinics(undefined, undefined, nextPage, recordsPerPage, latestSearchQuery, true);
    }
  }, [loading, loadingMore, hasMore, currentPage, fetchClinics, recordsPerPage]);

  // Handle scroll to detect end
  const handleScroll = useCallback((event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;

    // Validate that we have valid dimensions
    if (!contentSize.height || !layoutMeasurement.height) {
      return;
    }

    // Calculate distance from bottom
    const paddingToBottom = 200; // Threshold for detecting when user is close to bottom
    const distanceFromBottom = contentSize.height - (layoutMeasurement.height + contentOffset.y);
    const isCloseToBottom = distanceFromBottom <= paddingToBottom;

    // Only trigger if we're close to bottom, have more data, and not already loading
    if (isCloseToBottom && hasMore && !loadingMore && !loading && !isLoadingMoreRef.current) {
      loadMoreClinics();
    }
  }, [hasMore, loadingMore, loading, loadMoreClinics]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <HomeHeader
        location={location?.locationText}
        isLocationLoading={isLocationLoading}
        onLocationPress={handleLocationPress}
        onCartPress={handleCartPress}
        onNotificationPress={handleNotificationPress}
        onSearchPress={handleSearchPress}
        onSearchChange={handleSearchChange}
        searchValue={searchQuery}
        onSLPress={handleSLPress}
        cartItemCount={cartCount}
        notificationCount={notificationCount}
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
    </View>
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
  Heading: {
    fontSize: 18,
    color: colors.black,
  },
  loadingContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: mvs(30),
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

export default HomeScreen;
