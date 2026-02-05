import SearchServicesBar from '@components/common/SearchInput';
import {
  ClinicHeader,
  DeviceDetailBottomSheet,
  FilterBottomSheet,
  ReviewCard,
  ServiceCard,
  ServiceDetailBottomSheet,
  TabBar,
} from '@components/molecules';
import { ClinicInfo } from '@components/molecules/ClinicInfo';
import { colors } from '../../../styles/colors';
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Text, ActivityIndicator, Platform, PermissionsAndroid, RefreshControl, KeyboardAvoidingView, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RecommandImage } from '@assets/images';
import ConsultDoctorBottomSheet from '@components/molecules/ConsultDoctorBottomSheet';
import { styles } from './style';
import { useCart } from '@context/CartContext';
import { useCartCountContext } from '@context/CartCountContext';
import { useCartCount } from '../../../hooks/useCartCount';
import { useNotificationCount } from '../../../hooks/useNotificationCount';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'react-native-element-dropdown';
import Geolocation from '@react-native-community/geolocation';
import { apiClient } from '@services/api/api-client';
import { API } from '@services/api/api-endpoint';
import { ClinicDetailResponse, ClinicService, ClinicReview, ClinicDescriptionResponse, ClinicDevice, DeviceDetailResponse, ServiceFilterOption } from '../../../types/clinic.types';
import { Toast } from 'toastify-react-native';
import { translateCityToEnglish } from '../../../utils/cityTranslator';

// Define types
interface Review {
  id: string;
  author: string;
  date: string;
  rating: number;
  text: string;
}

interface SortOption {
  label: string;
  value: string;
}

export const ClinicDetailScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { clinic } = route.params;
  const { addToCart, cartItems } = useCart();
  const { triggerRefresh, incrementCartCount } = useCartCountContext();
  const { cartCount } = useCartCount();
  const { notificationCount } = useNotificationCount();
  const [activeTab, setActiveTab] = useState(t('services'));
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [serviceDetailVisible, setServiceDetailVisible] = useState(false);
  const [expandedReviewId, setExpandedReviewId] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [deviceDetailVisible, setDeviceDetailVisible] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<any>(null);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [sortOption, setSortOption] = useState('by_date');
  const [sortedReviews, setSortedReviews] = useState<Review[]>([]);
  const [isFocus, setIsFocus] = useState(false);

  // API data states
  const [clinicDetail, setClinicDetail] = useState<ClinicDetailResponse | null>(null);
  const [clinicDescription, setClinicDescription] = useState<ClinicDescriptionResponse | null>(null);
  const [devices, setDevices] = useState<ClinicDevice[]>([]);
  const [services, setServices] = useState<ClinicService[]>([]);
  const [reviews, setReviews] = useState<ClinicReview[]>([]);
  const [serviceFilters, setServiceFilters] = useState<ServiceFilterOption[]>([]);
  const [servicesPage, setServicesPage] = useState<number>(1);
  const [servicesPerPage] = useState<number>(10);
  const [servicesTotal, setServicesTotal] = useState<number | null>(null);
  const [loadingServicesPage, setLoadingServicesPage] = useState(false);
  const [reviewsPage, setReviewsPage] = useState<number>(1);
  const [reviewsPerPage] = useState<number>(10);
  const [reviewsTotal, setReviewsTotal] = useState<number | null>(null);
  const [loadingReviewsPage, setLoadingReviewsPage] = useState(false);
  const [devicesPage, setDevicesPage] = useState<number>(1);
  const [devicesPerPage] = useState<number>(10);
  const [devicesTotal, setDevicesTotal] = useState<number | null>(null);
  const [devicesNextPageUrl, setDevicesNextPageUrl] = useState<string | null>(null);
  const [loadingDevicesPage, setLoadingDevicesPage] = useState(false);
  const [loading, setLoading] = useState(false); // Start with false to show UI immediately
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [loadingDescription, setLoadingDescription] = useState(false);
  const [loadingDeviceDetail, setLoadingDeviceDetail] = useState(false);
  const [loadingServiceDetail, setLoadingServiceDetail] = useState(false);
  const [loadingAddToCart, setLoadingAddToCart] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; long: number } | null>(null);
  const [hasAudioPermission, setHasAudioPermission] = useState(false);
  const [hasVideoPermission, setHasVideoPermission] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Get clinic ID from route params
  // Clinic object from ClinicScreen has id as string (clinicID.toString())
  // We need to extract the numeric clinicID for API calls
  const clinicID = route.params?.clinicID ||
    clinic?.clinicID ||
    (clinic?.id ? parseInt(clinic.id) : null);

  const sortData: SortOption[] = [
    { label: t('by_date') || 'By Date', value: 'by_date' },
    { label: t('by_rating') || 'By Rating', value: 'by_rating' },
  ];

  useEffect(() => {
    if (clinicID) {
      // Use default location immediately to start fetching data
      // Location will be updated when real location is available
      const defaultLocation = { lat: 24.7136, long: 46.6753 };
      fetchClinicDetails(defaultLocation.lat, defaultLocation.long);

      // Request location in background and update when available
      requestLocationAndFetchData();
    }

    // Check permissions on mount
    checkMediaPermissions();
  }, [clinicID]);

  useEffect(() => {
    // Only fetch when tab is active and data is not already loaded
    if (activeTab === t('services') && clinicID && !services.length && !loadingServices) {
      fetchClinicServices();
    }
    if (activeTab === t('reviews') && clinicID && !reviews.length && !loadingReviews) {
      fetchClinicReviews();
    }
  }, [activeTab, clinicID]);

  // Refetch services when search query changes (debounced)
  useEffect(() => {
    if (activeTab === t('services') && clinicID && services.length > 0) {
      // Only filter locally if we already have services loaded
      // Don't refetch on every keystroke
    }
  }, [searchQuery, activeTab]);

  // Remove client-side sorting since we're using API sorting
  // useEffect(() => {
  //   if (reviews.length > 0) {
  //     sortReviews(sortOption);
  //   }
  // }, [reviews, sortOption]);

  const fetchClinicDescription = async (pageNo: number = 1, recordsPerPage: number = 10) => {
    if (!clinicID) return;

    try {
      if (pageNo === 1) {
        setLoadingDescription(true);
      } else {
        setLoadingDevicesPage(true);
      }
      const response = await apiClient.get(API.CLINIC.GET_CLINIC_DESCRIPTION, {
        params: {
          clinicID: clinicID.toString(),
          pageNo: pageNo,
          recordsPerPage: recordsPerPage,
        },
      });

      // API response structure with pagination:
      // {
      //   success: true,
      //   totalRecords: 13,
      //   currentPage: 1,
      //   perPage: 10,
      //   nextPageUrl: "...",
      //   previousPageUrl: null,
      //   data: {...},
      //   devices: [...]
      // }
      const responseData = response.data;

      // Extract data - description might be an object, not array
      const descriptionData = responseData?.data || responseData;

      // Determine total count for devices and nextPageUrl
      const totalCount = responseData?.totalRecords || responseData?.total || responseData?.totalCount || null;
      const nextPageUrl = responseData?.nextPageUrl || null;
      console.log('fetchClinicDescription - totalCount:', responseData);
      if (totalCount !== null) {
        setDevicesTotal(Number(totalCount));
      }
      setDevicesNextPageUrl(nextPageUrl);

      if (responseData?.success !== false && descriptionData) {
        // Only update description data on first page
        if (pageNo === 1) {
          setClinicDescription({
            data: descriptionData,
            devices: responseData.devices || [],
          });
        }
      
        // Handle devices pagination - filter only active
        if (response.data.devices && Array.isArray(response.data.devices)) {
          const activeDevices = response.data.devices.filter(
            (device: ClinicDevice) => device.status === 'active'
          );

          // Append or replace based on page
          if (pageNo > 1) {
            setDevices(prev => {
              const combined = [...prev, ...activeDevices];
              // De-duplicate by id
              const uniq = Array.from(new Map(combined.map(d => [String(d.id), d])).values());
              return uniq;
            });
            setDevicesPage(pageNo);
          } else {
            setDevices(activeDevices);
            setDevicesPage(1);
          }
        } else if (pageNo === 1) {
          // No devices on first page
          setDevices([]);
          setDevicesTotal(0);
        }
      }
    } catch (error: any) {
      console.error('Error fetching clinic description:', error);
      Toast.error(error.message || 'Failed to fetch clinic description');
    } finally {
      setLoadingDescription(false);
      setLoadingDevicesPage(false);
    }
  };

  const checkMediaPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const cameraStatus = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        const audioStatus = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );


        setHasAudioPermission(audioStatus);
        setHasVideoPermission(cameraStatus && audioStatus);
      } catch (err) {
        console.warn('📱 [ClinicDetail] Error checking permissions:', err);
        setHasAudioPermission(false);
        setHasVideoPermission(false);
      }
    } else {
      // iOS permissions are handled at runtime
      setHasAudioPermission(true);
      setHasVideoPermission(true);
    }
  };

  const requestLocationAndFetchData = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocationAndFetch();
        } else {
          // Use default location if permission denied
          fetchClinicDetails(24.7136, 46.6753);
        }
      } else {
        Geolocation.requestAuthorization();
        getCurrentLocationAndFetch();
      }
    } catch (err) {
      console.warn('Location permission error:', err);
      fetchClinicDetails(24.7136, 46.6753);
    }
  };

  const getCurrentLocationAndFetch = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, long: longitude });
        // Update clinic details with real location (this is just for distance calculation)
        // Pass isLocationUpdate=true to avoid showing loading state
        fetchClinicDetails(latitude, longitude, true);
      },
      error => {
        console.warn('Error getting location:', error);
        // Keep using default location, no need to refetch
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 } // Reduced timeout and use cached location
    );
  };

  const fetchClinicDetails = async (lat: number, long: number, isLocationUpdate: boolean = false) => {
    if (!clinicID) {
      console.error('Clinic ID is missing');
      if (!isLocationUpdate) {
        setLoading(false);
      }
      return;
    }

    try {
      // Only show main loading on initial load, not on location updates
      if (!isLocationUpdate) {
        setLoading(true);
      }

      // Make API calls in parallel for better performance
      const [detailsResponse, descriptionResponse] = await Promise.all([
        apiClient.get(API.CLINIC.GET_CLINIC_DETAILS, {
          params: {
            lat: lat.toString(),
            long: long.toString(),
            clinicID: clinicID.toString(),
          },
        }),
        apiClient.get(API.CLINIC.GET_CLINIC_DESCRIPTION, {
          params: {
            clinicID: clinicID.toString(),
            pageNo: 1,
            recordsPerPage: 10,
          },
        }),
      ]);
      if (detailsResponse.data.success && detailsResponse.data.data) {
        setClinicDetail(detailsResponse.data.data);
      }

      // Extract description data (might be nested in pagination response)
      const descResponseData = descriptionResponse.data;
      const descriptionData = descResponseData?.data || descResponseData;
      const nextPageUrl = descResponseData?.nextPageUrl || null;
      setDevicesNextPageUrl(nextPageUrl);
      if (descResponseData?.success !== false && descriptionData) {
        setClinicDescription({
          data: descriptionData,
          devices: descResponseData.devices || [],
        });
        setDevices(descResponseData.devices || []);
      }

      // Only fetch services and reviews on initial load, not on location updates
      // They will be fetched when their tabs are activated
      if (!isLocationUpdate) {
        // Fetch services and reviews in parallel
        Promise.all([
          fetchClinicServices(),
          fetchClinicReviews(),
        ]).catch(err => {
          console.error('Error fetching services/reviews:', err);
        });
      }
    } catch (error: any) {
      console.error('Error fetching clinic details:', error);
      if (!isLocationUpdate) {
        Toast.error(error.message || 'Failed to fetch clinic details');
      }
    } finally {
      if (!isLocationUpdate) {
        setLoading(false);
      }
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    const location = userLocation || { lat: 24.7136, long: 46.6753 };

    // Refresh all data
    await Promise.all([
      fetchClinicDetails(location.lat, location.long, true),
      activeTab === t('services') ? fetchClinicServices() : Promise.resolve(),
      activeTab === t('reviews') ? fetchClinicReviews() : Promise.resolve(),
      fetchClinicDescription(),
    ]);

    setRefreshing(false);
  }, [clinicID, userLocation, activeTab, t]);

  const fetchServiceFilters = async (groupIDs?: number[]) => {
    // If groupIDs is provided, both clinicID and groupIDs (with at least one element) must be present
    if (!clinicID || !groupIDs || groupIDs.length === 0) {
      return;
    }

    try {
      const params: any = {
        clinicID: clinicID.toString(),
        groupIDs: groupIDs, // groupIDs is required when calling this function
      };

      // Axios will automatically format array as groupIDs[]=1&groupIDs[]=2
      const response = await apiClient.get(API.CLINIC.GET_SERVICES_FILTER, {
        params: params,
      });

      if (response.data.success && response.data.data) {
        setServiceFilters(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching service filters:', error);
    }
  };

  const fetchClinicServices = async (pageNo: number = 1, recordsPerPage: number = 10) => {
    if (!clinicID) return;

    try {
      if (pageNo === 1) {
        setLoadingServices(true);
      } else {
        setLoadingServicesPage(true);
      }
      const response = await apiClient.get(API.CLINIC.GET_CLINIC_SERVICES, {
        params: {
          name: searchQuery.trim() || '',
          clinicID: clinicID.toString(),
          serviceType: '',
          groupIDs: [],
          serviceNames: [],
          pageNo: pageNo,
          recordsPerPage: recordsPerPage,
        },
      });

      // Extract data array and pagination info
      const responseData = response.data;
      let servicesList: any[] = [];
      if (Array.isArray(responseData)) {
        servicesList = responseData;
      } else if (Array.isArray(responseData?.data)) {
        servicesList = responseData.data;
      }

      // Determine total count from common possible fields
      const totalCount = responseData?.total || responseData?.totalRecords || responseData?.totalCount || responseData?.totalItems || null;
      if (totalCount !== null) {
        setServicesTotal(Number(totalCount));
      }

      if (responseData?.success !== false && servicesList.length > 0) {
        // Filter only active services
        const activeServices = servicesList.filter(
          (service: ClinicService) => service.status === 'Active'
        );

        // Append or replace based on page
        if (pageNo > 1) {
          setServices(prev => {
            const combined = [...prev, ...activeServices];
            // De-duplicate by id
            const uniq = Array.from(new Map(combined.map(s => [String(s.id), s])).values());
            return uniq;
          });
          setServicesPage(pageNo);
        } else {
          setServices(activeServices);
          setServicesPage(1);
        }
      } else if (responseData?.success !== false && servicesList.length === 0 && pageNo === 1) {
        // No services on first page
        setServices([]);
        setServicesTotal(0);
      }
    } catch (error: any) {
      console.error('Error fetching clinic services:', error);
      Toast.error(error.message || 'Failed to fetch clinic services');
    } finally {
      setLoadingServices(false);
      setLoadingServicesPage(false);
    }
  };

  const fetchClinicReviews = async (orderBy: string = 'recent', pageNo: number = 1, recordsPerPage: number = 10) => {
    if (!clinicID) return;

    try {
      if (pageNo === 1) {
        setLoadingReviews(true);
      } else {
        setLoadingReviewsPage(true);
      }
      const response = await apiClient.get(API.CLINIC.GET_CLINIC_REVIEWS, {
        params: {
          clinicID: clinicID.toString(),
          orderBy: orderBy,
          pageNo: pageNo,
          recordsPerPage: recordsPerPage,
        },
      });

      // API response structure with pagination:
      // {
      //   success: true,
      //   total: 3,
      //   currentPage: 2,
      //   perPage: 1,
      //   nextPageUrl: "...",
      //   data: [...]
      // }
      const responseData = response.data;

      // Extract data array
      let reviewsList: any[] = [];
      if (Array.isArray(responseData)) {
        reviewsList = responseData;
      } else if (Array.isArray(responseData?.data)) {
        reviewsList = responseData.data;
      }

      // Determine total count
      const totalCount = responseData?.total || responseData?.totalRecords || responseData?.totalCount || responseData?.totalItems || null;
      if (totalCount !== null) {
        setReviewsTotal(Number(totalCount));
      }

      if (responseData?.success !== false && reviewsList.length > 0) {
        // Append or replace based on page
        if (pageNo > 1) {
          setReviews(prev => {
            const combined = [...prev, ...reviewsList];
            // De-duplicate by id
            const uniq = Array.from(new Map(combined.map(r => [String(r.id), r])).values());
            return uniq;
          });
          setReviewsPage(pageNo);
        } else {
          setReviews(reviewsList);
          setReviewsPage(1);
        }
      } else if (responseData?.success !== false && reviewsList.length === 0 && pageNo === 1) {
        // No reviews on first page
        setReviews([]);
        setReviewsTotal(0);
      }
    } catch (error: any) {
      console.error('Error fetching clinic reviews:', error);
      Toast.error(error.message || 'Failed to fetch clinic reviews');
    } finally {
      setLoadingReviews(false);
      setLoadingReviewsPage(false);
    }
  };

  const transformServices = (apiServices: ClinicService[]) => {
    return apiServices.map((service): any => {
      // Parse tags if it's a string
      let tags: string[] = [];
      try {
        tags = typeof service.tags === 'string' ? JSON.parse(service.tags) : service.tags || [];
      } catch {
        tags = [];
      }

      return {
        id: service.id.toString(),
        image: service.image ? { uri: service.image } : RecommandImage,
        type: service.serviceType && typeof service.serviceType === 'string' && service.serviceType.length
          ? service.serviceType.charAt(0).toUpperCase() + service.serviceType.slice(1)
          : 'General',
        serviceGroup: service.group?.name || 'Group',
        serviceName: service.name,
        price: `SAR ${parseFloat(service.price).toFixed(2)}`,
        duration: `${service.duration} ${t('minutes')}`,
        description: service.description || '',
        procedure: service.procedure || '',
        // Additional data for detail view
        loyality: service.loyality,
        bonusLoyalityPoints: service.bonusLoyalityPoints,
        devices: service.devices || [],
        tags: tags,
        groupID: service.groupID,
        clinicID: service.clinicID,
      };
    });
  };

  const transformReviews = (apiReviews: ClinicReview[]): Review[] => {
    return apiReviews.map((review): Review => {
      return {
        id: review.id.toString(),
        author: review.user?.name || 'Anonymous',
        date: review.date || review.created_at?.split('T')[0] || '',
        rating: parseFloat(review.rating) || 0,
        text: review.review || '',
      };
    });
  };

  const sortReviews = (option: string) => {
    const transformedReviews = transformReviews(reviews);
    let sorted = [...transformedReviews];
    switch (option) {
      case 'newest_first':
        // Sort descending - newest dates first
        sorted.sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateB - dateA;
        });
        break;
      case 'oldest_first':
        // Sort ascending - oldest dates first
        sorted.sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateA - dateB;
        });
        break;
      case 'highest_rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest_rating':
        sorted.sort((a, b) => a.rating - b.rating);
        break;
      default:
        break;
    }
    setSortedReviews(sorted);
  };

  const handleSortChange = (item: SortOption) => {
    setSortOption(item.value);
    setIsFocus(false);

    // Map dropdown value to API orderBy parameter
    // API only accepts 'recent' or 'rating'
    let orderBy = 'recent';

    switch (item.value) {
      case 'by_date':
        orderBy = 'recent';
        break;
      case 'by_rating':
        orderBy = 'rating';
        break;
      default:
        orderBy = 'recent';
    }

    // Reset reviews and fetch from first page with new sort order
    setReviews([]);
    setReviewsPage(1);
    setReviewsTotal(null);
    fetchClinicReviews(orderBy, 1, reviewsPerPage);
  };

  const handleApplyFilters = (filters: any) => {
    setAppliedFilters(filters);
    setFilterVisible(false);
    // Reset services and fetch filtered results from first page
    setServices([]);
    setServicesPage(1);
    setServicesTotal(null);
    fetchClinicServicesWithFilters(filters);
  };

  const loadMoreServices = () => {
    if (loadingServices || loadingServicesPage) return;
    // If we already know total and have all services, skip
    if (servicesTotal !== null && services.length >= servicesTotal) return;
    fetchClinicServices(servicesPage + 1, servicesPerPage);

  };

  const loadMoreReviews = () => {
    if (loadingReviews || loadingReviewsPage) return;
    // If we already know total and have all reviews, skip
    if (reviewsTotal !== null && reviews.length >= reviewsTotal) return;
    // Get current sort order
    let orderBy = 'recent';
    if (sortOption === 'by_rating') {
      orderBy = 'rating';
    }
    fetchClinicReviews(orderBy, reviewsPage + 1, reviewsPerPage);
  };

  const loadMoreDevices = () => {
    if (loadingDescription || loadingDevicesPage) return;
    // Check if there's a next page URL - if null, no more data
    if (!devicesNextPageUrl) return;
    fetchClinicDescription(devicesPage + 1, devicesPerPage);
  };

  const fetchClinicServicesWithFilters = async (filters: any) => {
    if (!clinicID) return;

    try {
      setLoadingServices(true);

      // Build params for service API
      const params: any = {
        name: searchQuery.trim() || '',
        clinicID: clinicID.toString(),
        serviceType: '',
      };

      // Add selected clinic type as serviceType (only one can be selected)
      const selectedClinicTypes = Object.keys(filters.clinicTypes || {})
        .filter(key => filters.clinicTypes[key]);
      if (selectedClinicTypes.length > 0) {
        // Since only one clinic type can be selected, use the first (and only) one
        params.serviceType = selectedClinicTypes[0];
      }

      // Add selected service groups as groupIDs array
      // Axios will automatically format array as groupIDs[]=1&groupIDs[]=2
      const selectedGroupIds = Object.keys(filters.serviceGroups || {})
        .filter(key => filters.serviceGroups[Number(key)])
        .map(key => Number(key));
      if (selectedGroupIds.length > 0) {
        params.groupIDs = selectedGroupIds;
      }

      // Add selected service IDs as serviceNames array
      // The API expects serviceNames as an array of service IDs
      const selectedServiceIds = Object.keys(filters.serviceNames || {})
        .filter(key => filters.serviceNames[Number(key)])
        .map(key => Number(key));
      if (selectedServiceIds.length > 0) {
        params.serviceNames = selectedServiceIds;
      }

      // Reset to first page when applying filters
      const pageNo = 1;
      console.log('Fetching services with filters:', params);
      const response = await apiClient.get(API.CLINIC.GET_CLINIC_SERVICES, {
        params: {
          ...params,
          pageNo: pageNo,
          recordsPerPage: servicesPerPage,
        },
      });

      // API response structure with pagination:
      // {
      //   success: true,
      //   total: 3,
      //   currentPage: 2,
      //   perPage: 1,
      //   nextPageUrl: "...",
      //   data: [...]
      // }
      console.log('Filtered services response:', response.data);
      const responseData = response.data;

      // Extract data array
      let servicesList: any[] = [];
      if (Array.isArray(responseData)) {
        servicesList = responseData;
      } else if (Array.isArray(responseData?.data)) {
        servicesList = responseData.data;
      }

      if (responseData?.success !== false) {
        // Filter only active services
        const activeServices = servicesList.filter(
          (service: ClinicService) => service.status === 'Active'
        );
        setServices(activeServices);
        setServicesPage(1);
        const totalCount = responseData?.total || responseData?.totalRecords || responseData?.totalCount || responseData?.totalItems || null;
        if (totalCount !== null) setServicesTotal(Number(totalCount));
      }
    } catch (error: any) {
      console.error('Error fetching filtered clinic services:', error);
      Toast.error(error.message || 'Failed to fetch filtered services');
    } finally {
      setLoadingServices(false);
    }
  };

  const handleConsultPress = () => {
    setShowBottomSheet(true);
  };

  const handleFilterPress = () => {
    setFilterVisible(true);
  };

  const handleServicePress = async (service: any) => {
    if (!service || !service.id) {
      setSelectedService(service);
      setServiceDetailVisible(true);
      return;
    }

    // Open bottom sheet first, then clear previous data and fetch
    setServiceDetailVisible(true);
    setLoadingServiceDetail(true);
    setSelectedService(null);

    try {
      // Fetch service details from API
      const response = await apiClient.get(`${API.CLINIC.GET_SERVICE_DETAILS}/${service.id}`);

      if (response.data.success && response.data.data) {
        const serviceDetail = response.data.data;

        // Transform API service to component format
        let tags: string[] = [];
        try {
          tags = typeof serviceDetail.tags === 'string' ? JSON.parse(serviceDetail.tags) : serviceDetail.tags || [];
        } catch {
          tags = [];
        }

        const transformedService = {
          id: serviceDetail.id.toString(),
          image: serviceDetail.image ? { uri: serviceDetail.image } : RecommandImage,
          type: serviceDetail.serviceType && typeof serviceDetail.serviceType === 'string' && serviceDetail.serviceType.length
            ? serviceDetail.serviceType.charAt(0).toUpperCase() + serviceDetail.serviceType.slice(1)
            : 'General',
          serviceGroup: serviceDetail.group?.name || 'Group',
          serviceName: serviceDetail.name,
          price: `SAR ${parseFloat(serviceDetail.price).toFixed(2)}`,
          duration: `${serviceDetail.duration} ${t('minutes')}`,
          description: serviceDetail.description || '',
          procedure: serviceDetail.procedure || '',
          loyality: serviceDetail.loyality,
          bonusLoyalityPoints: serviceDetail.bonusLoyalityPoints,
          devices: serviceDetail.devices || [],
          tags: tags,
          groupID: serviceDetail.groupID,
          clinicID: serviceDetail.clinicID,
        };

        setSelectedService(transformedService);
      } else {
        // Fallback to service from list if API fails
        setSelectedService(service);
      }
    } catch (error: any) {
      console.error('Error fetching service details:', error);
      // Fallback to service from list if API fails
      setSelectedService(service);
    } finally {
      setLoadingServiceDetail(false);
    }
  };

  const handleChatPress = () => {
    navigation.navigate('ChatOnboarding');
  };

  const handleAddToCart = async (service: any, shouldNavigate: boolean = false) => {
    if (!service || !service.id) {
      Toast.error('Invalid service');
      return;
    }

    if (shouldNavigate) {
      setLoadingCheckout(true);
    } else {
      setLoadingAddToCart(true);
    }

    // If this is a checkout action and the service is already present in the cart,
    // skip the API call and navigate directly to the cart/checkout screen.
    if (shouldNavigate) {
      const exists = cartItems.find(i => String(i.service.id) === String(service.id));
      if (exists) {
        setServiceDetailVisible(false);
        setLoadingAddToCart(false);
        setLoadingCheckout(false);
        navigation.navigate('CartScreen');
        return;
      }
    }

    const startTime = Date.now();
    const requestId = `ADD_TO_CART_${startTime}`;

    try {
      // Extract service ID - it might be a string, convert to number
      const serviceID = typeof service.id === 'string' ? parseInt(service.id, 10) : service.id;

      if (isNaN(serviceID)) {
        Toast.error('Invalid service ID');
        setLoadingAddToCart(false);
        return;
      }


      // Call API to add service to cart
      const response = await apiClient.post(API.CART.ADD_TO_CART, {
        serviceID: serviceID,
      });


      // Check if API returned success: false (even with 200 status)
      if (response.data?.success === false) {
        const errorMessage = response.data?.message || 'Failed to add service to cart';
        Toast.error(errorMessage);
        setLoadingAddToCart(false);
        return;
      }

      // Also add to local cart context for immediate UI update
      const cartItem = {
        service: service,
        clinic: {
          id: clinic.id || clinic._id || `clinic_${Date.now()}`,
          name: clinic.name,
          location: clinic.location,
          image: clinic.image,
          specialty: clinic.specialty,
          rating: clinic.rating,
        },
      };

      addToCart(cartItem);

      // Show success message
      const successMessage = response.data?.message || response.data?.data?.message || 'Service added to cart successfully';
      Toast.success(successMessage);

      // Optimistically increment cart count for immediate UI update
      incrementCartCount();

      // Trigger cart count refresh to sync with API
      triggerRefresh();

      setServiceDetailVisible(false);
      if (shouldNavigate) {
        navigation.navigate('CartScreen');
      }
    } catch (error: any) {

      const errorMessage = error?.message || error?.response?.data?.message || 'Failed to add service to cart';
      Toast.error(errorMessage);
    } finally {
        setLoadingAddToCart(false);
        setLoadingCheckout(false);
    }
  };

  const handleCheckout = (service: any) => {
    handleAddToCart(service, true);
  };

  const handleDevicePress = async (device: any) => {
    if (!device || !device.id) {
      console.warn('Device or device.id is missing:', device);
      return;
    }

    // Open bottom sheet first, then clear previous data and fetch
    setDeviceDetailVisible(true);
    setLoadingDeviceDetail(true);
    setSelectedDevice(null);

    try {
      // Get device ID - handle both string and number, and check for originalDevice
      const deviceId = device.originalDevice?.id ||
        (typeof device.id === 'string' ? parseInt(device.id) : device.id);

      if (!deviceId || isNaN(deviceId)) {
        console.warn('Invalid device ID:', deviceId);
        // Fallback to device from list if ID is invalid
        setSelectedDevice(device);
        setLoadingDeviceDetail(false);
        return;
      }

      // Fetch device details from API
      const response = await apiClient.get(`${API.CLINIC.GET_DEVICE_DETAILS}/${deviceId}`);

      if (response.data.success && response.data.data) {
        const deviceDetail = response.data.data;

        // Transform API device to component format
        // Use pre-formatted badge if available, or build from service_details
        let badge = deviceDetail.badge || {};
        if (Object.keys(badge).length === 0) {
          if (deviceDetail.service_details && deviceDetail.service_details.length > 0) {
            deviceDetail.service_details.forEach((service: any, index: number) => {
              badge[index + 1] = service.name;
            });
          } else {
            badge[1] = deviceDetail.name || deviceDetail.title || 'Device';
          }
        }

        const transformedDevice = {
          id: deviceDetail.id?.toString() || deviceId.toString(),
          image: (typeof deviceDetail.image === 'object' && deviceDetail.image && 'uri' in deviceDetail.image)
            ? deviceDetail.image
            : (deviceDetail.image ? { uri: deviceDetail.image } : RecommandImage),
          title: deviceDetail.title || deviceDetail.name || 'Device',
          note: deviceDetail.note || deviceDetail.notes || deviceDetail.purpose || 'Available for use in treatments.',
          badge: badge,
          purpose: deviceDetail.purpose || '',
        };

        setSelectedDevice(transformedDevice);
      } else {
        // Fallback to device from list if API fails
        setSelectedDevice(device);
      }
    } catch (error: any) {
      console.error('Error fetching device details:', error);
      // Fallback to device from list if API fails
      setSelectedDevice(device);
    } finally {
      setLoadingDeviceDetail(false);
    }
  };

  const handleNotificationPress = () => {
    navigation.navigate('Notification');
  };

  // Get clinic data from API or fallback to route params
  const displayClinic = clinicDetail || {
    name: clinic?.name,
    clinicName: clinic?.name,
    businessType: clinic?.specialty,
    avgRating: clinic?.rating?.toString() || '0',
    details: {
      address: clinic?.location,
      city: null,
      district: null,
    },
  };

  // Use clinic description data if available, otherwise use clinic detail
  const clinicDescriptionData = clinicDescription?.data;

  const clinicName = clinicDescriptionData?.businessName ||
    displayClinic.name ||
    displayClinic.clinicName ||
    clinic?.name ||
    'Clinic';
  const clinicSpecialty = displayClinic.businessType || clinic?.specialty || 'General';
  const clinicLocation = clinicDescriptionData?.address ||
    translateCityToEnglish(clinicDescriptionData?.city) ||
    displayClinic.details?.address ||
    translateCityToEnglish(displayClinic.details?.city) ||
    clinic?.location ||
    'Location not available';
  const clinicRating = parseFloat(displayClinic.avgRating) || parseFloat(clinic?.rating) || 0;
  const clinicDistance = (displayClinic as ClinicDetailResponse).distance
    ? `${((displayClinic as ClinicDetailResponse).distance!).toFixed(1)}km`
    : clinicDetail?.distance
      ? `${(clinicDetail.distance).toFixed(1)}km`
      : '--km';

  const clinicImage = clinicDescriptionData?.coverImage
    ? { uri: clinicDescriptionData.coverImage }
    : clinicDetail?.details?.coverImage
      ? { uri: clinicDetail.details.coverImage }
      : clinicDetail?.details?.logo
        ? { uri: clinicDetail.details.logo }
        : (typeof clinic?.image === 'string' && clinic.image ? { uri: clinic.image } : (clinic?.image || RecommandImage));

  const clinicLogo = clinicDescriptionData?.logo
    ? { uri: clinicDescriptionData.logo }
    : clinicDetail?.details?.logo
      ? { uri: clinicDetail.details.logo }
      : null;

  // Transform services for display
  const transformedServices = transformServices(services);
  const filteredServices = transformedServices.filter(service =>
    service.serviceName.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const hasMoreServices = servicesTotal !== null ? services.length < servicesTotal : false;
  const hasMoreReviews = reviewsTotal !== null ? reviews.length < reviewsTotal : false;
  const hasMoreDevices = devicesNextPageUrl !== null;
  console.log('📱 [ClinicDetail] hasMoreDevices:', hasMoreDevices, 'nextPageUrl:', devicesNextPageUrl);
  // Transform devices from API to match Abou tClinic component format 
  const transformDevices = (apiDevices: ClinicDevice[]) => {
    if (!apiDevices || !Array.isArray(apiDevices)) {
      return [];
    }

    // Filter only active devices and transform to component format
    return apiDevices
      .filter(device => device.status === 'active')
      .map(device => {
        // Create badge from service_details or use pre-formatted badge
        const badge = (device as any).badge || {};
        if (Object.keys(badge).length === 0) {
          if (device.service_details && device.service_details.length > 0) {
            device.service_details.forEach((service, index) => {
              badge[index + 1] = service.name;
            });
          } else {
            badge[1] = device.name || (device as any).title || 'Device';
          }
        }

        return {
          id: device.id.toString(),
          image: (typeof device.image === 'object' && device.image && 'uri' in device.image)
            ? device.image
            : (device.image ? { uri: device.image as string } : RecommandImage),
          title: (device as any).title || device.name || 'Device',
          note: (device as any).note || device.notes || device.purpose || 'Available for use in treatments.',
          badge: badge,
          // Store original device data for detail view
          originalDevice: device,
        };
      });
  };

  // Get about data from clinic description API
  const aboutData = {
    description: clinicDescription?.data?.about || clinicDetail?.details?.about || 'No description available.',
    devices: transformDevices(devices),
  };

  // Don't block UI with full loading screen - show content immediately with route params
  // Individual sections will show their own loading states
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#7625D7']} // primary color
          />
        }
      >
        {/* Header with background image and logo */}
        <ClinicHeader
          backgroundImage={clinicImage}
          logo={clinicLogo}
          onBackPress={() => navigation.goBack()}
          onSharePress={() => navigation.navigate('CartScreen')}
          onNotificationPress={handleNotificationPress}
          notificationCount={notificationCount}
          cartCount={cartCount}
          clinicName={clinicName}
        />

        {/* Clinic Information */}
        <ClinicInfo
          category={clinicSpecialty}
          name={clinicName}
          location={clinicLocation}
          distance={clinicDistance}
          rating={clinicRating}
          onConsultPress={handleConsultPress}
        />

        {/* Tab Bar */}
        <TabBar
          tabs={[t('services'), t('reviews'), t('about')]}
          activeTab={activeTab}
          onTabPress={setActiveTab}
        />

        {/* Content based on active tab */}
        {activeTab === t('services') && (
          <View style={styles.servicesContent}>
            {/* All Services Header */}
            <Text style={styles.sectionTitle}>{t('all_services')}</Text>

            {/* Search Bar */}
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
              style={{ width: '100%' }}
            >
              <SearchServicesBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFilterPress={handleFilterPress}
                placeholder={t('search_services')}
              />
            </KeyboardAvoidingView>

            {/* Services List */}
            {loadingServices ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7625D7" />
              </View>
            ) : filteredServices.length > 0 ? (
              <View style={styles.servicesList}>
                {filteredServices.map(service => (
                  <ServiceCard
                    key={service.id}
                    image={service.image}
                    type={service.type}
                    serviceGroup={service.serviceGroup}
                    serviceName={service.serviceName}
                    price={service.price}
                    duration={service.duration}
                    description={service.description}
                    procedure={service.procedure}
                    onPress={() => handleServicePress(service)}
                  />
                ))}

                {/* Load more control for paginated services */}
                {hasMoreServices && (
                  <View style={{ width: '100%', alignItems: 'center', paddingVertical: 12,height: 150 }}>
                    {loadingServicesPage ? (
                      <ActivityIndicator size="small" color="#7625D7" />
                    ) : (
                      <TouchableOpacity
                        onPress={loadMoreServices}
                        style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#efefef' }}
                      >
                        <Text style={{ color: '#333' }}>Load More</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{t('no_services_found')}</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === t('reviews') && (
          <View style={styles.reviewsContent}>
            {/* Reviews Header */}
            <View style={styles.reviewsHeader}>
              <Text style={styles.reviewsTitle}>
                {t('reviews')} ({reviews.length})
              </Text>
              <Dropdown
                style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={sortData}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={!isFocus ? t('sort_by') : '...'}
                value={sortOption}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={handleSortChange}
              />
            </View>

            {/* Reviews List */}
            {loadingReviews ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7625D7" />
              </View>
            ) : reviews.length > 0 ? (
              <View style={styles.reviewsList}>
                {transformReviews(reviews).map(review => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    isExpanded={expandedReviewId === review.id}
                    onPress={() =>
                      setExpandedReviewId(
                        expandedReviewId === review.id ? null : review.id,
                      )
                    }
                  />
                ))}

                {/* Load more control for paginated reviews */}
                {hasMoreReviews && (
                  <View style={{ width: '100%', alignItems: 'center', paddingVertical: 12 }}>
                    {loadingReviewsPage ? (
                      <ActivityIndicator size="small" color="#7625D7" />
                    ) : (
                      <TouchableOpacity
                        onPress={loadMoreReviews}
                        style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#efefef' }}
                      >
                        <Text style={{ color: '#333' }}>Load More</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{t('no_reviews_found')}</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === t('about') && (
          <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
            {/* Description Section */}
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 12 }}>
              {t('description')}
            </Text>
            <Text style={{ fontSize: 14, lineHeight: 22, color: colors.text, marginBottom: 8 }}>
              {aboutData.description}
            </Text>

            {/* Devices Section */}
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginTop: 24, marginBottom: 12 }}>
              {t('devices')}
            </Text>

            {loadingDescription ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7625D7" />
              </View>
            ) : aboutData.devices.length > 0 ? (
              <View style={{ flexDirection: 'column', gap: 12 }}>
                {aboutData.devices.map(device => (
                  <TouchableOpacity
                    key={device.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: '#fff',
                      borderRadius: 12,
                      padding: 10,
                      borderBottomWidth: 1,
                      borderColor: colors.border,
                    }}
                    onPress={() => handleDevicePress(device)}
                  >
                    <Image source={device.image} style={{ width: 50, height: 50, borderRadius: 8, marginRight: 10 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 4 }} numberOfLines={1}>
                        {device.title}
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.secondaryText, marginBottom: 6 }} numberOfLines={2}>
                        {device.note}
                      </Text>
                      {device.badge && Object.keys(device.badge).length > 0 && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={{ color: colors.text, fontSize: 11, fontWeight: '600', backgroundColor: colors.lightGray, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                            {Object.values(device.badge)[0]}
                          </Text>
                          {Object.keys(device.badge).length > 1 && (
                            <View style={{ backgroundColor: colors.lightGray, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 }}>
                              <Text style={{ color: colors.text, fontSize: 11, fontWeight: '600' }}>
                                +{Object.keys(device.badge).length - 1}
                              </Text>
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}

                {/* Load more control for paginated devices */}
                {hasMoreDevices && (
                  <View style={{ width: '100%', alignItems: 'center', paddingVertical: 12,height: 150 }}>
                    {loadingDevicesPage ? (
                      <ActivityIndicator size="small" color="#7625D7" />
                    ) : (
                      <TouchableOpacity
                        onPress={loadMoreDevices}
                        style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#efefef' }}
                      >
                        <Text style={{ color: '#333' }}>Load More</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            ) : (
              <Text style={{ fontSize: 14, color: colors.secondaryText, textAlign: 'center', paddingVertical: 20 }}>
                No devices available
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* Chat with Vena AI Button */}
      <View style={styles.chatButtonContainer}>
        <TouchableOpacity
          style={styles.chatButton}
          onPress={handleChatPress}
          activeOpacity={0.8}
        >
          <Text style={styles.chatButtonText}>{t('chat_with_vena_ai')}</Text>
          <Ionicons name="sparkles" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      <FilterBottomSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApplyFilters={handleApplyFilters}
        clinicID={clinicID || undefined}
        initialFilters={appliedFilters}
      />

      <ServiceDetailBottomSheet
        visible={serviceDetailVisible}
        onClose={() => setServiceDetailVisible(false)}
        service={selectedService}
        onAddToCart={handleAddToCart}
        onCheckout={handleCheckout}
        loading={loadingServiceDetail}
        loadingState={
          loadingAddToCart ? 'adding_to_cart' :
            loadingCheckout ? 'checking_out' : 'none'
        }
      />

      <DeviceDetailBottomSheet
        visible={deviceDetailVisible}
        onClose={() => setDeviceDetailVisible(false)}
        device={selectedDevice}
        loading={loadingDeviceDetail}
      />

      <ConsultDoctorBottomSheet
        visible={showBottomSheet}
        onClose={() => setShowBottomSheet(false)}
        clinicID={clinicID || undefined}
        hasAudioPermission={hasAudioPermission}
        hasVideoPermission={hasVideoPermission}
      />
    </View>
  );
};
