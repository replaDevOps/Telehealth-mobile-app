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
import { View, ScrollView, TouchableOpacity, Text, ActivityIndicator, Platform, PermissionsAndroid } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ClinicProfile, RecommandImage } from '@assets/images';
import AboutClinic from '@components/molecules/AboutCard';
import ConsultDoctorBottomSheet from '@components/molecules/ConsultDoctorBottomSheet';
import { styles } from './style';
import { useCart } from '@context/CartContext';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'react-native-element-dropdown';
import Geolocation from '@react-native-community/geolocation';
import { apiClient } from '@services/api/api-client';
import { API } from '@services/api/api-endpoint';
import { ClinicDetailResponse, ClinicService, ClinicReview, ClinicDescriptionResponse, ClinicDevice, DeviceDetailResponse, ServiceFilterOption } from '../../../types/clinic.types';
import { Toast } from 'toastify-react-native';

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
  const { addToCart } = useCart();
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
  const [loading, setLoading] = useState(true);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [loadingDescription, setLoadingDescription] = useState(false);
  const [loadingDeviceDetail, setLoadingDeviceDetail] = useState(false);
  const [loadingServiceDetail, setLoadingServiceDetail] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; long: number } | null>(null);
  
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
      fetchClinicDescription();
      requestLocationAndFetchData();
    }
  }, [clinicID]);

  useEffect(() => {
    if (activeTab === t('services') && clinicID) {
      if (!services.length) {
        fetchClinicServices();
      }
      if (!serviceFilters.length) {
        fetchServiceFilters();
      }
    }
    if (activeTab === t('reviews') && clinicID) {
      if (!reviews.length) {
        fetchClinicReviews();
      }
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

  const fetchClinicDescription = async () => {
    if (!clinicID) return;

    try {
      setLoadingDescription(true);
      const response = await apiClient.get(API.CLINIC.GET_CLINIC_DESCRIPTION, {
        params: {
          clinicID: clinicID.toString(),
        },
      });

      if (response.data.success) {
        setClinicDescription({
          data: response.data.data,
          devices: response.data.devices || [],
        });
        // Set devices from description response (filter only active)
        if (response.data.devices && Array.isArray(response.data.devices)) {
          const activeDevices = response.data.devices.filter(
            (device: ClinicDevice) => device.status === 'active'
          );
          setDevices(activeDevices);
        }
      }
    } catch (error: any) {
      console.error('Error fetching clinic description:', error);
      Toast.error(error.message || 'Failed to fetch clinic description');
    } finally {
      setLoadingDescription(false);
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
        fetchClinicDetails(latitude, longitude);
      },
      error => {
        console.warn('Error getting location:', error);
        // Use default location (Riyadh, Saudi Arabia)
        fetchClinicDetails(24.7136, 46.6753);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const fetchClinicDetails = async (lat: number, long: number) => {
    if (!clinicID) {
      console.error('Clinic ID is missing');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Fetch clinic details with location for distance calculation
      const detailsResponse = await apiClient.get(API.CLINIC.GET_CLINIC_DETAILS, {
        params: {
          lat: lat.toString(),
          long: long.toString(),
          clinicID: clinicID.toString(),
        },
      });

      // Fetch clinic description and devices
      const descriptionResponse = await apiClient.get(API.CLINIC.GET_CLINIC_DESCRIPTION, {
        params: {
          clinicID: clinicID.toString(),
        },
      });

      if (detailsResponse.data.success && detailsResponse.data.data) {
        setClinicDetail(detailsResponse.data.data);
      }

      if (descriptionResponse.data.success && descriptionResponse.data.data) {
        setClinicDescription({
          data: descriptionResponse.data.data,
          devices: descriptionResponse.data.devices || [],
        });
        setDevices(descriptionResponse.data.devices || []);
      }

      // Fetch services, reviews, and service filters after getting clinic details
      fetchClinicServices();
      fetchClinicReviews();
      fetchServiceFilters();
    } catch (error: any) {
      console.error('Error fetching clinic details:', error);
      Toast.error(error.message || 'Failed to fetch clinic details');
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceFilters = async () => {
    if (!clinicID) return;

    try {
      const response = await apiClient.get(API.CLINIC.GET_SERVICES_FILTER, {
        params: {
          clinicID: clinicID.toString(),
        },
      });

      if (response.data.success && response.data.data) {
        setServiceFilters(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching service filters:', error);
    }
  };

  const fetchClinicServices = async () => {
    if (!clinicID) return;

    try {
      setLoadingServices(true);
      const response = await apiClient.get(API.CLINIC.GET_CLINIC_SERVICES, {
        params: {
          name: searchQuery || '',
          clinicID: clinicID.toString(),
          serviceType: '',
          groupIDs: [],
          serviceNames: [],
        },
      });

      if (response.data.success && response.data.data) {
        // Filter only active services
        const activeServices = response.data.data.filter(
          (service: ClinicService) => service.status === 'Active'
        );
        setServices(activeServices);
      }
    } catch (error: any) {
      console.error('Error fetching clinic services:', error);
      Toast.error(error.message || 'Failed to fetch clinic services');
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchClinicReviews = async (orderBy: string = 'recent') => {
    if (!clinicID) return;

    try {
      setLoadingReviews(true);
      const response = await apiClient.get(API.CLINIC.GET_CLINIC_REVIEWS, {
        params: {
          clinicID: clinicID.toString(),
          orderBy: orderBy,
        },
      });

      if (response.data.success && response.data.data) {
        setReviews(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching clinic reviews:', error);
      Toast.error(error.message || 'Failed to fetch clinic reviews');
    } finally {
      setLoadingReviews(false);
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
        type: service.serviceType || 'General',
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
    
    // Fetch reviews with new sort order from API
    fetchClinicReviews(orderBy);
  };

  const handleApplyFilters = (filters: any) => {
    console.log('Applied filters:', filters);
    setAppliedFilters(filters);
    setFilterVisible(false);
    // Apply filters to services - refetch services with the filter parameters
    fetchClinicServicesWithFilters(filters);
  };

  const fetchClinicServicesWithFilters = async (filters: any) => {
    if (!clinicID) return;

    try {
      setLoadingServices(true);
      
      // Build params for service API
      const params: any = {
        name: searchQuery || '',
        clinicID: clinicID.toString(),
        serviceType: '',
      };

      // Add selected clinic types as serviceType (if only one selected)
      const selectedClinicTypes = Object.keys(filters.clinicTypes || {})
        .filter(key => filters.clinicTypes[key]);
      if (selectedClinicTypes.length === 1) {
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

      const response = await apiClient.get(API.CLINIC.GET_CLINIC_SERVICES, {
        params: params,
      });

      if (response.data.success && response.data.data) {
        // Filter only active services
        const activeServices = response.data.data.filter(
          (service: ClinicService) => service.status === 'Active'
        );
        setServices(activeServices);
      }
    } catch (error: any) {
      console.error('Error fetching filtered clinic services:', error);
      Toast.error(error.message || 'Failed to fetch filtered services');
    } finally {
      setLoadingServices(false);
    }
  };

  const handleConsultPress = () => {
    console.log('Consult now pressed');
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
          type: serviceDetail.serviceType || 'General',
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
    console.log('Chat with Vena AI pressed');
    navigation.navigate('ChatOnboarding');
  };

  const handleAddToCart = (service: any) => {
    // Add service with clinic details to cart
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

    console.log('Service added to cart:', cartItem);

    setServiceDetailVisible(false);
    navigation.navigate('CartScreen');
  };

  const handleCheckout = (service: any) => {
    // Navigate to checkout with single service
    navigation.navigate('CheckoutScreen', {
      services: [
        {
          service: service,
          clinic: {
            id: clinic.id,
            name: clinic.name,
            location: clinic.location,
            image: clinic.image,
            specialty: clinic.specialty,
            rating: clinic.rating,
          },
        },
      ],
      fromCart: false,
    });
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
        const badge: { [key: number]: string } = {};
        if (deviceDetail.service_details && deviceDetail.service_details.length > 0) {
          deviceDetail.service_details.forEach((service: any, index: number) => {
            badge[index + 1] = service.name;
          });
        } else {
          badge[1] = deviceDetail.name;
        }
        
        const transformedDevice = {
          id: deviceDetail.id.toString(),
          image: deviceDetail.image ? { uri: deviceDetail.image } : RecommandImage,
          title: deviceDetail.name || 'Device',
          note: deviceDetail.notes || deviceDetail.purpose || 'Available for use in treatments.',
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
                         clinicDescriptionData?.city || 
                         displayClinic.details?.address || 
                         displayClinic.details?.city || 
                         clinic?.location || 
                         'Location not available';
  const clinicRating = parseFloat(displayClinic.avgRating) || parseFloat(clinic?.rating) || 0;
  const clinicDistance = (displayClinic as ClinicDetailResponse).distance 
    ? `${((displayClinic as ClinicDetailResponse).distance! / 1000).toFixed(1)}km` 
    : clinicDetail?.distance 
    ? `${(clinicDetail.distance / 1000).toFixed(1)}km`
    : '2.2km';
  
  const clinicImage = clinicDescriptionData?.coverImage
    ? { uri: clinicDescriptionData.coverImage }
    : clinicDetail?.details?.coverImage 
    ? { uri: clinicDetail.details.coverImage }
    : clinicDetail?.details?.logo
    ? { uri: clinicDetail.details.logo }
    : clinic?.image || RecommandImage;
  
  const clinicLogo = clinicDescriptionData?.logo
    ? { uri: clinicDescriptionData.logo }
    : clinicDetail?.details?.logo 
    ? { uri: clinicDetail.details.logo }
    : ClinicProfile;

  // Transform services for display
  const transformedServices = transformServices(services);
  const filteredServices = transformedServices.filter(service =>
    service.serviceName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Transform devices from API to match AboutClinic component format
  const transformDevices = (apiDevices: ClinicDevice[]) => {
    if (!apiDevices || !Array.isArray(apiDevices)) {
      return [];
    }
    
    // Filter only active devices and transform to component format
    return apiDevices
      .filter(device => device.status === 'active')
      .map(device => {
        // Create badge from service_details
        const badge: { [key: number]: string } = {};
        device.service_details?.forEach((service, index) => {
          badge[index + 1] = service.name;
        });

        return {
          id: device.id.toString(),
          image: device.image ? { uri: device.image } : RecommandImage,
          title: device.name || 'Device',
          note: device.notes || device.purpose || 'Available for use in treatments.',
          badge: Object.keys(badge).length > 0 ? badge : { 1: device.name || 'Device' },
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7625D7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with background image and logo */}
        <ClinicHeader
          backgroundImage={clinicImage}
          logo={clinicLogo}
          onBackPress={() => navigation.goBack()}
          onSharePress={() => navigation.navigate('CartScreen')}
          onNotificationPress={handleNotificationPress}
          notificationCount={3}
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
            <SearchServicesBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFilterPress={handleFilterPress}
              placeholder={t('search_services')}
            />

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
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{t('no_reviews_found')}</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === t('about') && (
          <AboutClinic
            description={aboutData.description}
            devices={aboutData.devices}
            onDevicePress={handleDevicePress}
          />
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
      />
    </View>
  );
};
