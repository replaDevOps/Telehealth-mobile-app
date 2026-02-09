import { View, Text, ActivityIndicator, PermissionsAndroid, Platform, TextInput, TouchableOpacity, FlatList, Modal, Image } from 'react-native';
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { Header2 } from '../../../components/common/Header2';
import { styles } from './styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Geolocation from '@react-native-community/geolocation';
import { Toast } from 'toastify-react-native';
import { searchPlaces, getPlaceDetails, PlacePrediction, reverseGeocode } from '../../../services/api/googlePlacesService';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../styles/colors';
import { apiClient } from '@services/api/api-client';
import { API } from '@services/api/api-endpoint';
import { ClinicApiResponse } from '../../../types/clinic.types';
import { ClinicProfile } from '@assets/images';
import { showLocationSettingsAlert, handleLocationError } from '../../../utils/locationUtils';
import { useLocationStore } from '@store';
import { useFocusEffect } from '@react-navigation/native';

const DEFAULT_REGION: Region = {
  latitude: Number(24.7136),
  longitude: Number(46.6753),
  latitudeDelta: Number(0.0922),
  longitudeDelta: Number(0.0421),
};

export const SelectLocation = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { location: storeLocation, fetchLocation: fetchStoreLocation } = useLocationStore();
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
  } | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlacePrediction[]>([]);
  const [clinicSearchResults, setClinicSearchResults] = useState<ClinicApiResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // Ref to track when a place is being selected (to skip search)
  const isSelectingPlace = useRef(false);
  
  // Clinic states
  const [clinics, setClinics] = useState<ClinicApiResponse[]>([]);
  const [clinicsLoading, setClinicsLoading] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<ClinicApiResponse | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<{ x: number; y: number } | null>(null);

  const cardWidth = 260;
  const cardApproxHeight = 190;

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  // Fetch clinics when location changes
  const fetchClinics = useCallback(async (lat: number, lng: number) => {
    // Clear old clinics and selected clinic first
    setClinics([]);
    setSelectedClinic(null);
    setSelectedPoint(null);
    setClinicsLoading(true);
    
    try {
      const response = await apiClient.get(API.CLINIC.GET_CLINICS, {
        params: {
          name: '',
          lat: lat.toString(),
          long: lng.toString(),
          pageNo: 1,
          recordsPerPage: 20,
        },
      });

      if (response.data.success && response.data.data) {
        const validClinics = response.data.data.filter(
          (clinic: ClinicApiResponse) =>
            clinic.details?.lat !== null &&
            clinic.details?.lat !== undefined &&
            clinic.details?.long !== null &&
            clinic.details?.long !== undefined
        );
        setClinics(validClinics);
      }
    } catch (error: any) {
      console.error('Error fetching clinics:', error);
    } finally {
      setClinicsLoading(false);
    }
  }, []);

  // Get offset coordinates for overlapping markers
  const getOffsetCoordinates = useCallback((clinic: ClinicApiResponse) => {
    if (!clinic.details?.lat || !clinic.details?.long) return null;
    
    let lat = typeof clinic.details.lat === 'string' 
      ? parseFloat(clinic.details.lat) 
      : Number(clinic.details.lat);
    let lng = typeof clinic.details.long === 'string' 
      ? parseFloat(clinic.details.long) 
      : Number(clinic.details.long);
    
    if (isNaN(lat) || isNaN(lng)) return null;
    
    const sameLocationClinics = clinics.filter((c) => {
      if (!c.details?.lat || !c.details?.long) return false;
      const cLat = typeof c.details.lat === 'string' ? parseFloat(c.details.lat) : Number(c.details.lat);
      const cLng = typeof c.details.long === 'string' ? parseFloat(c.details.long) : Number(c.details.long);
      return Math.abs(cLat - lat) < 0.0001 && Math.abs(cLng - lng) < 0.0001;
    });
    
    if (sameLocationClinics.length > 1) {
      const myIndex = sameLocationClinics.findIndex(c => c.clinicID === clinic.clinicID);
      if (myIndex > 0) {
        const offsetAmount = 0.0003;
        const angle = (myIndex * 60) * (Math.PI / 180);
        lat += offsetAmount * Math.cos(angle);
        lng += offsetAmount * Math.sin(angle);
      }
    }
    
    return { latitude: lat, longitude: lng };
  }, [clinics]);

  // Update selected clinic point for card positioning
  const updateSelectedPoint = useCallback(
    async (clinic: ClinicApiResponse | null) => {
      if (!clinic || !mapRef.current) {
        setSelectedPoint(null);
        return;
      }
      const coords = getOffsetCoordinates(clinic);
      if (!coords) {
        setSelectedPoint(null);
        return;
      }
      try {
        const point = await mapRef.current.pointForCoordinate(coords);
        setSelectedPoint({ x: point.x, y: point.y });
      } catch {
        setSelectedPoint(null);
      }
    },
    [getOffsetCoordinates]
  );

  const handleClinicMarkerPress = (clinic: ClinicApiResponse) => {
    setSelectedClinic(clinic);
    updateSelectedPoint(clinic);
  };

  const handleCardPress = () => {
    if (selectedClinic) {
      navigation.navigate('ClinicDetail', { 
        clinic: selectedClinic, 
        clinicID: selectedClinic.clinicID 
      });
    }
  };

  const getBusinessTypeDisplay = (businessType: string | null) => {
    if (businessType?.toLowerCase() === 'both') {
      return ['Dermatology', 'Dentistry'];
    }
    return businessType ? [businessType] : [];
  };

  const cardPosition = useMemo(() => {
    if (!selectedPoint) return null;
    const left = clamp(selectedPoint.x - cardWidth / 2, 12, 9999);
    const top = clamp(selectedPoint.y - cardApproxHeight - 18, 12, 9999);
    const pointerLeft = clamp(selectedPoint.x - left - 10, 12, cardWidth - 32);
    return { left, top, pointerLeft };
  }, [selectedPoint]);

  const getCurrentLocation = useCallback(() => {
    setLocationLoading(true);
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        
        // Ensure coordinates are numbers (convert from string if needed)
        const lat = typeof latitude === 'string' ? parseFloat(latitude) : Number(latitude);
        const lng = typeof longitude === 'string' ? parseFloat(longitude) : Number(longitude);
        
        // Validate coordinates are valid numbers
        if (isNaN(lat) || isNaN(lng)) {
          console.warn('Invalid coordinates from Geolocation:', { latitude, longitude });
          setLocationLoading(false);
          Toast.error('Invalid location coordinates');
          return;
        }
        
        const newRegion = {
          latitude: Number(lat),
          longitude: Number(lng),
          latitudeDelta: Number(0.0922),
          longitudeDelta: Number(0.0421),
        };
        
        // Update region state
        setRegion(newRegion);
        
        // Animate map to current location
        if (mapRef.current) {
          mapRef.current.animateToRegion(newRegion, 1000);
        }
        
        // Update selected location
        setSelectedLocation({ 
          latitude: Number(lat), 
          longitude: Number(lng) 
        });
        
        setLocationLoading(false);
        // Fetch clinics for current location
        fetchClinics(lat, lng);
      },
      error => {
        console.warn('Error getting location:', error);
        setLocationLoading(false);
        handleLocationError(error, {
          title: 'Location Not Available',
          message: 'Please enable location services to get your location. Would you like to open settings?',
          openLocationSettings: true,
        });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }, [fetchClinics]);

  const requestLocationPermission = useCallback(async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to help you select a location.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation();
        } else {
          setLocationLoading(false);
          showLocationSettingsAlert({
            title: 'Location Permission',
            message: 'Location access is needed to help you select a location. Would you like to open settings to enable it?',
          });
        }
      } catch (err) {
        console.warn(err);
        setLocationLoading(false);
      }
    } else {
      // iOS
      Geolocation.requestAuthorization();
      getCurrentLocation();
    }
  }, [getCurrentLocation]);

  // Apply store location immediately so we don't show Riyadh when we already have user location
  const applyStoreLocationIfAvailable = useCallback(() => {
    const loc = useLocationStore.getState().location;
    if (loc && typeof loc.lat === 'number' && typeof loc.long === 'number' && !isNaN(loc.lat) && !isNaN(loc.long)) {
      const newRegion: Region = {
        latitude: loc.lat,
        longitude: loc.long,
        latitudeDelta: Number(0.0922),
        longitudeDelta: Number(0.0421),
      };
      setRegion(newRegion);
      setSelectedLocation({ latitude: loc.lat, longitude: loc.long });
      setLocationLoading(false);
      fetchClinics(loc.lat, loc.long);
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 500);
      }
      return true;
    }
    return false;
  }, [fetchClinics]);

  // On focus: use store location first, then ensure we have permission and try fresh location
  useFocusEffect(
    useCallback(() => {
      const hadStoreLocation = applyStoreLocationIfAvailable();
      const timer = setTimeout(() => {
        requestLocationPermission();
      }, hadStoreLocation ? 50 : 100);
      return () => clearTimeout(timer);
    }, [applyStoreLocationIfAvailable, requestLocationPermission])
  );

  // Trigger store fetch in background so we have location when user opens map
  useEffect(() => {
    fetchStoreLocation();
  }, [fetchStoreLocation]);

  // Handle region change - keep card anchored while panning/zooming
  const handleRegionChangeComplete = useCallback((newRegion: Region) => {
    setRegion({
      latitude: Number(newRegion.latitude),
      longitude: Number(newRegion.longitude),
      latitudeDelta: Number(newRegion.latitudeDelta),
      longitudeDelta: Number(newRegion.longitudeDelta),
    });
    // Keep card anchored while panning/zooming
    if (selectedClinic) {
      updateSelectedPoint(selectedClinic);
    }
  }, [selectedClinic, updateSelectedPoint]);

  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    
    // Ensure coordinates are numbers (convert from string if needed)
    const lat = typeof latitude === 'string' ? parseFloat(latitude) : Number(latitude);
    const lng = typeof longitude === 'string' ? parseFloat(longitude) : Number(longitude);
    
    // Validate coordinates are valid numbers
    if (isNaN(lat) || isNaN(lng)) {
      Toast.error('Invalid location coordinates');
      return;
    }
    
    // Clear selected clinic
    setSelectedClinic(null);
    
    // Reverse geocode to get address (don't block UI)
    reverseGeocode(lat, lng).then(address => {
      setSelectedLocation({ 
        latitude: Number(lat), 
        longitude: Number(lng), 
        address: address || undefined 
      });
    });
    
    // Fetch clinics for new location
    fetchClinics(lat, lng);
  };

  // Search clinics by name
  const searchClinicsByName = useCallback(async (query: string, lat: number, lng: number) => {
    try {
      const response = await apiClient.get(API.CLINIC.GET_CLINICS, {
        params: {
          name: query,
          lat: lat.toString(),
          long: lng.toString(),
          pageNo: 1,
          recordsPerPage: 10,
        },
      });

      if (response.data.success && response.data.data) {
        return response.data.data.filter(
          (clinic: ClinicApiResponse) =>
            clinic.details?.lat !== null &&
            clinic.details?.lat !== undefined &&
            clinic.details?.long !== null &&
            clinic.details?.long !== undefined
        );
      }
      return [];
    } catch (error) {
      console.error('Clinic search error:', error);
      return [];
    }
  }, []);

  // Zoom map to fit clinic markers
  const zoomToFitClinics = useCallback((clinicList: ClinicApiResponse[]) => {
    if (!mapRef.current || clinicList.length === 0) return;
    
    const coordinates = clinicList
      .filter(c => c.details?.lat && c.details?.long)
      .map(c => ({
        latitude: typeof c.details!.lat === 'string' ? parseFloat(c.details!.lat) : Number(c.details!.lat),
        longitude: typeof c.details!.long === 'string' ? parseFloat(c.details!.long) : Number(c.details!.long),
      }))
      .filter(c => !isNaN(c.latitude) && !isNaN(c.longitude));
    
    if (coordinates.length === 1) {
      // Single clinic - zoom to it
      mapRef.current.animateToRegion({
        ...coordinates[0],
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 500);
    } else if (coordinates.length > 1) {
      // Multiple clinics - fit all
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 100, right: 50, bottom: 150, left: 50 },
        animated: true,
      });
    }
  }, []);

  // Debounce search input - only depends on searchQuery to avoid unnecessary re-runs
  useEffect(() => {
    // Skip search if a place/clinic is being selected
    if (isSelectingPlace.current) {
      isSelectingPlace.current = false;
      return;
    }
    
    const timeoutId = setTimeout(async () => {
      // Handle empty query
      if (!searchQuery || searchQuery.trim().length === 0) {
        setSearchResults([]);
        setClinicSearchResults([]);
        setShowSearchResults(false);
        // Reload clinics for current location when search is cleared
        if (selectedLocation) {
          fetchClinics(selectedLocation.latitude, selectedLocation.longitude);
        }
        return;
      }

      setIsSearching(true);
      setShowSearchResults(true);

      try {
        // Capture current region value at the time of search
        const currentRegion = region;
        const location = currentRegion ? { lat: currentRegion.latitude, lng: currentRegion.longitude } : undefined;
        
        // Search both places and clinics in parallel
        const [placeResults, clinicResults] = await Promise.all([
          searchPlaces(searchQuery, location),
          searchClinicsByName(searchQuery, currentRegion.latitude, currentRegion.longitude)
        ]);
        
        // Store clinic search results for the modal
        setClinicSearchResults(clinicResults);
        
        // Update clinics on map with search results
        if (clinicResults.length > 0) {
          setClinics(clinicResults);
          setSelectedClinic(null);
          // Zoom to show all matching clinics
          setTimeout(() => zoomToFitClinics(clinicResults), 100);
        }
        
        setSearchResults(placeResults);
      } catch (error) {
        console.error('Search error:', error);
        Toast.error('Failed to search');
        setSearchResults([]);
        setClinicSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]); // Only depend on searchQuery to avoid re-running on region changes

  const handlePlaceSelect = async (place: PlacePrediction) => {
    // Set flag to skip search when updating searchQuery
    isSelectingPlace.current = true;
    
    setIsSearching(true);
    setShowSearchResults(false);
    setSearchQuery(place.description);
    setSelectedClinic(null);

    try {
      const details = await getPlaceDetails(place.place_id);
      
      if (details && details.geometry && details.geometry.location) {
        // Ensure coordinates are numbers (convert from string if needed)
        const lat = typeof details.geometry.location.lat === 'string' 
          ? parseFloat(details.geometry.location.lat) 
          : Number(details.geometry.location.lat);
        const lng = typeof details.geometry.location.lng === 'string' 
          ? parseFloat(details.geometry.location.lng) 
          : Number(details.geometry.location.lng);
        
        // Validate coordinates are valid numbers
        if (isNaN(lat) || isNaN(lng)) {
          throw new Error('Invalid coordinates');
        }
        
        const newRegion = {
          latitude: Number(lat),
          longitude: Number(lng),
          latitudeDelta: Number(0.0922),
          longitudeDelta: Number(0.0421),
        };
        
        setRegion(newRegion);
        setSelectedLocation({
          latitude: Number(lat),
          longitude: Number(lng),
          address: details.formatted_address,
        });
        
        // Fetch clinics for selected location
        fetchClinics(lat, lng);
      } else {
        Toast.error('Failed to get location details');
      }
    } catch (error) {
      console.error('Error getting place details:', error);
      Toast.error('Failed to get location details');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle clinic selection from search results
  const handleClinicSelect = (clinic: ClinicApiResponse) => {
    // Set flag to skip search when updating searchQuery
    isSelectingPlace.current = true;
    
    setShowSearchResults(false);
    setSearchQuery(clinic.clinicName || clinic.name || '');
    setSelectedClinic(null);
    setClinicSearchResults([]);
    
    // Get clinic coordinates
    if (clinic.details?.lat && clinic.details?.long) {
      const lat = typeof clinic.details.lat === 'string' 
        ? parseFloat(clinic.details.lat) 
        : Number(clinic.details.lat);
      const lng = typeof clinic.details.long === 'string' 
        ? parseFloat(clinic.details.long) 
        : Number(clinic.details.long);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        // Show only this clinic on map
        setClinics([clinic]);
        
        // Zoom to clinic
        const newRegion = {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        };
        setRegion(newRegion);
        
        if (mapRef.current) {
          mapRef.current.animateToRegion(newRegion, 500);
        }
        
        // Auto-select this clinic to show card
        setTimeout(() => {
          handleClinicMarkerPress(clinic);
        }, 600);
      }
    }
  };

  // Render clinic search result item
  const renderClinicSearchResult = ({ item }: { item: ClinicApiResponse }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => handleClinicSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.clinicResultIcon}>
        <Ionicons name="home" size={16} color="white" />
      </View>
      <View style={styles.searchResultText}>
        <Text style={styles.searchResultMainText}>
          {item.clinicName || item.details?.businessName || item.name}
        </Text>
        <Text style={styles.searchResultSecondaryText}>
          {item.businessType} • ⭐ {parseFloat(item.avgRating).toFixed(1)}
          {item.details?.city ? ` • ${item.details.city}` : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Render place search result item
  const renderSearchResult = ({ item }: { item: PlacePrediction }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => handlePlaceSelect(item)}
      activeOpacity={0.7}
    >
      <Ionicons name="location" size={20} color={colors.primary} style={styles.searchResultIcon} />
      <View style={styles.searchResultText}>
        <Text style={styles.searchResultMainText}>
          {item.structured_formatting?.main_text || item.description.split(',')[0]}
        </Text>
        {item.structured_formatting?.secondary_text && (
          <Text style={styles.searchResultSecondaryText}>
            {item.structured_formatting.secondary_text}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  // Compute marker coordinate with proper type conversion
  const markerCoordinate = useMemo(() => {
    if (!selectedLocation || selectedLocation.latitude == null || selectedLocation.longitude == null) {
      return null;
    }
    
    // Convert coordinates to numbers (defensive check)
    const lat = typeof selectedLocation.latitude === 'number' 
      ? selectedLocation.latitude 
      : parseFloat(String(selectedLocation.latitude));
    const lng = typeof selectedLocation.longitude === 'number' 
      ? selectedLocation.longitude 
      : parseFloat(String(selectedLocation.longitude));
    
    // Validate coordinates are valid numbers
    if (isNaN(lat) || isNaN(lng)) {
      return null;
    }
    
    return {
      latitude: lat,
      longitude: lng,
    };
  }, [selectedLocation]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header2 title={t('select_location')} />
      
      {/* Search Bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={22} color={colors.secondaryText} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('search_location') || 'Search location'}
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => {
              if (searchQuery.length > 0) {
                setShowSearchResults(true);
              }
            }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setSearchResults([]);
                setShowSearchResults(false);
              }}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color={colors.secondaryText} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Results Modal */}
      <Modal
        visible={showSearchResults && (searchResults.length > 0 || clinicSearchResults.length > 0 || isSearching)}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSearchResults(false)}
      >
        <TouchableOpacity
          style={styles.searchModalOverlay}
          activeOpacity={1}
          onPress={() => setShowSearchResults(false)}
        >
          <View style={styles.searchResultsContainer}>
            {/* Header */}
            <View style={styles.searchResultsHeader}>
              <Text style={styles.searchResultsTitle}>
                {t('search_results') || 'Search Results'}
              </Text>
              <TouchableOpacity onPress={() => setShowSearchResults(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {isSearching ? (
              <View style={styles.searchLoadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.searchLoadingText}>{t('searching')}</Text>
              </View>
            ) : (
              <FlatList
                data={[
                  // Clinic results first
                  ...clinicSearchResults.map(clinic => ({ type: 'clinic' as const, data: clinic })),
                  // Then place results
                  ...searchResults.map(place => ({ type: 'place' as const, data: place })),
                ]}
                renderItem={({ item }) => 
                  item.type === 'clinic' 
                    ? renderClinicSearchResult({ item: item.data as ClinicApiResponse })
                    : renderSearchResult({ item: item.data as PlacePrediction })
                }
                keyExtractor={(item) => 
                  item.type === 'clinic' 
                    ? `clinic-${(item.data as ClinicApiResponse).clinicID}` 
                    : `place-${(item.data as PlacePrediction).place_id}`
                }
                keyboardShouldPersistTaps="handled"
                ListHeaderComponent={
                  clinicSearchResults.length > 0 ? (
                    <View style={styles.sectionHeader}>
                      <Ionicons name="medkit" size={16} color={colors.primary} />
                      <Text style={styles.sectionHeaderText}>{t('clinics')} ({clinicSearchResults.length})</Text>
                    </View>
                  ) : null
                }
                ListEmptyComponent={
                  <View style={styles.noResultsContainer}>
                    <Text style={styles.noResultsText}>{t('no_results_found')}</Text>
                  </View>
                }
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
      <View style={{ flex: 1 }}>
        <MapView
          ref={mapRef}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          style={styles.map}
          region={region}
          onRegionChangeComplete={handleRegionChangeComplete}
          onPress={handleMapPress}
          showsUserLocation={true}
          showsMyLocationButton={true}
          toolbarEnabled={false}
        >
          {/* Selected location marker (red pin) */}
          {markerCoordinate && (
            <Marker
              coordinate={markerCoordinate}
              title={t('selected_location')}
              description={selectedLocation?.address || `Lat: ${markerCoordinate.latitude.toFixed(6)}, Lng: ${markerCoordinate.longitude.toFixed(6)}`}
              pinColor="#E53935"
              zIndex={500}
            />
          )}
          
          {/* Clinic markers (purple pins) */}
          {clinics.map((clinic, index) => {
            const coordinates = getOffsetCoordinates(clinic);
            if (!coordinates) return null;
            
            const isSelected = selectedClinic?.clinicID === clinic.clinicID;
            
            return (
              <Marker
                key={`clinic-${clinic.clinicID}-${index}`}
                coordinate={coordinates}
                onPress={(e) => {
                  e.stopPropagation();
                  handleClinicMarkerPress(clinic);
                }}
                tracksViewChanges={false}
                zIndex={isSelected ? 1000 : index}
              >
                <TouchableOpacity 
                  activeOpacity={0.8}
                  onPress={() => handleClinicMarkerPress(clinic)}
                  style={styles.markerTouchable}
                >
                  <View style={styles.markerContainer}>
                    <View style={[
                      styles.markerPin,
                      isSelected && styles.markerPinSelected
                    ]}>
                      <Ionicons name="home" size={18} color="white" />
                    </View>
                    <View style={[
                      styles.markerTriangle,
                      isSelected && styles.markerTriangleSelected
                    ]} />
                  </View>
                </TouchableOpacity>
              </Marker>
            );
          })}
        </MapView>

        {/* Small loading indicator overlay */}
        {(locationLoading || clinicsLoading) && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color="#7625D7" />
            <Text style={styles.loadingOverlayText}>
              {locationLoading ? 'Getting location...' : 'Loading clinics...'}
            </Text>
          </View>
        )}

        {/* Clinic Info Card */}
        {selectedClinic && cardPosition && (
          <TouchableOpacity 
            style={[styles.clinicCard, { left: cardPosition.left, top: cardPosition.top, width: cardWidth }]}
            activeOpacity={0.9}
            onPress={handleCardPress}
          >
            <View style={styles.cardContent}>
              <View style={styles.imageContainer}>
                <Image
                  source={
                    selectedClinic.details?.coverImage 
                      ? { uri: selectedClinic.details.coverImage }
                      : selectedClinic.details?.logo
                      ? { uri: selectedClinic.details.logo }
                      : ClinicProfile
                  }
                  style={styles.clinicImage}
                  resizeMode="cover"
                />
                {selectedClinic.is_featured && (
                  <View style={styles.featuredBadgeOnImage}>
                    <Ionicons name="pricetag" size={10} color="#E8A317" />
                    <Text style={styles.featuredTextOnImage}>Featured</Text>
                  </View>
                )}
              </View>

              <View style={styles.clinicInfo}>
                <View style={styles.typeRatingRow}>
                  <View style={styles.businessTypeContainer}>
                    {getBusinessTypeDisplay(selectedClinic.businessType).map((type, idx) => (
                      <View key={idx} style={styles.businessTypeChip}>
                        <Text style={styles.businessTypeText}>{type}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.ratingText}>
                      {parseFloat(selectedClinic.avgRating).toFixed(1)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.clinicName} numberOfLines={2}>
                  {selectedClinic.clinicName || selectedClinic.details?.businessName || selectedClinic.name}
                </Text>
              </View>
            </View>
            <View style={[styles.cardPointer, { left: cardPosition.pointerLeft }]} />
          </TouchableOpacity>
        )}
      </View>

      {/* Bottom Section: Selected Location Info and Action Buttons */}
      {selectedLocation && (
        <View style={styles.bottomContainer}>
          {/* Selected Location Display */}
          <View style={styles.locationInfo}>
            <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
            <View style={styles.locationInfoTextContainer}>
              <Text style={styles.locationInfoText}>
                {t('selected_location')}: {Number(selectedLocation.latitude).toFixed(6)}, {Number(selectedLocation.longitude).toFixed(6)}
              </Text>
            </View>
          </View>
          
          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Text style={styles.doneButtonText}>{t('done')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.currentLocationButton}
              onPress={getCurrentLocation}
              activeOpacity={0.8}
            >
              <Text style={styles.currentLocationButtonText}>{t('my_current_location')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default SelectLocation;
