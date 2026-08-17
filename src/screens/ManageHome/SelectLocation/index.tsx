import { View, Text, ActivityIndicator, PermissionsAndroid, Platform, TextInput, TouchableOpacity, Modal, Image, ScrollView, Dimensions } from 'react-native';
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { Header2 } from '../../../components/common/Header2';
import { styles } from './styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Geolocation from '@react-native-community/geolocation';
import { Toast } from 'toastify-react-native';
import { reverseGeocode, searchPlaces, getPlaceDetails, PlacePrediction } from '../../../services/api/googlePlacesService';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../styles/colors';
import { apiClient } from '@services/api/api-client';
import { API } from '@services/api/api-endpoint';
import { ClinicApiResponse } from '../../../types/clinic.types';
import { ClinicProfile, Marker_Pin } from '@assets/images';
import { showLocationSettingsAlert, handleLocationError } from '../../../utils/locationUtils';
import { useLocationStore } from '@store';
import { useFocusEffect } from '@react-navigation/native';

const DEFAULT_REGION: Region = {
  latitude: Number(24.7136),
  longitude: Number(46.6753),
  latitudeDelta: Number(0.0922),
  longitudeDelta: Number(0.0421),
};

// Start with tracksViewChanges=true so the child Image is composited into the
// native marker bitmap on Android, then flip to false on load to avoid redrawing
// every frame.
const ClinicMarker = ({
  coordinates,
  isSelected,
  zIndex,
  onPress,
}: {
  coordinates: { latitude: number; longitude: number };
  isSelected: boolean;
  zIndex: number;
  onPress: () => void;
}) => {
  const [tracksChanges, setTracksChanges] = React.useState(true);

  return (
    <Marker
      coordinate={coordinates}
      tracksViewChanges={tracksChanges}
      zIndex={isSelected ? 1000 : zIndex}
      stopPropagation
      onPress={onPress}
    >
      <Image
        source={Marker_Pin}
        style={{ width: 36, height: 44 }}
        resizeMode="contain"
        onLoad={() => setTracksChanges(false)}
      />
    </Marker>
  );
};

export const SelectLocation = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { fetchLocation: fetchStoreLocation } = useLocationStore();
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
  } | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [clinicSearchResults, setClinicSearchResults] = useState<ClinicApiResponse[]>([]);
  const [placeSearchResults, setPlaceSearchResults] = useState<PlacePrediction[]>([]);
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
  // Conservative starting estimate: real measured heights for clinics with
  // 2-line names land around 270–290px. Using a generous default keeps the
  // initial pan calculation from undershooting and forcing a flip-below.
  const cardApproxHeight = 290;
  const [cardHeight, setCardHeight] = useState<number>(cardApproxHeight);
  const [bottomContainerHeight, setBottomContainerHeight] = useState<number>(0);
  const [mapAreaHeight, setMapAreaHeight] = useState<number>(() => Dimensions.get('window').height);

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  // Fetch clinics when location changes
  const fetchClinics = useCallback(async (lat: number, lng: number) => {
    // Clear old clinics and selected clinic first
    setClinics([]);
    setSelectedClinic(null);
    setSelectedPoint(null);
    setClinicsLoading(true);

    try {
      console.log('Fetching clinics for coordinates:', { lat, lng }); // Debug log
      const response = await apiClient.get(API.CLINIC.GET_CLINICS, {
        params: {
          name: '',
          lat: lat.toString(),
          long: lng.toString(),
          pageNo: 1,
          recordsPerPage: 20,
          sendFrom: 'map',
        },
      });
      console.log('Clinics API response:', response.data); // Debug log

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

  const handleClinicMarkerPress = async (clinic: ClinicApiResponse) => {
    setSelectedClinic(clinic);

    const coords = getOffsetCoordinates(clinic);
    if (!coords || !mapRef.current) {
      updateSelectedPoint(clinic);
      return;
    }

    try {
      const point = await mapRef.current.pointForCoordinate(coords);
      // Minimum y where the pin can sit so the card fits above it.
      const gap = 12;
      const minPinY = cardHeight + gap + 12;
      if (point.y >= minPinY) {
        setSelectedPoint({ x: point.x, y: point.y });
        return;
      }

      // Pan the map so the pin moves down to minPinY. Increasing the camera's
      // latitude shifts the visible content south on screen, moving the pin
      // toward the bottom of the view.
      const deltaPx = minPinY - point.y;
      const latPerPx = region.latitudeDelta / mapAreaHeight;
      const newRegion: Region = {
        latitude: region.latitude + deltaPx * latPerPx,
        longitude: region.longitude,
        latitudeDelta: region.latitudeDelta,
        longitudeDelta: region.longitudeDelta,
      };
      // Hide the card while the map pans so it doesn't flash at the old position.
      setSelectedPoint(null);
      mapRef.current.animateToRegion(newRegion, 300);

      // After the pan completes, recompute the pin's screen point so the
      // card lines up with the new pin position.
      setTimeout(async () => {
        if (!mapRef.current) return;
        try {
          const next = await mapRef.current.pointForCoordinate(coords);
          setSelectedPoint({ x: next.x, y: next.y });
        } catch {
          updateSelectedPoint(clinic);
        }
      }, 320);
    } catch {
      updateSelectedPoint(clinic);
    }
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
    const gap = 12;
    // The card lives inside the map-area view. Its bottom must clear the
    // bottom panel that overlays from the screen's bottom edge.
    const maxBottom = mapAreaHeight - bottomContainerHeight - 12;
    const left = clamp(selectedPoint.x - cardWidth / 2, 12, 9999);
    // Always position above the pin. handleClinicMarkerPress pans the map
    // when needed to ensure there's room above; if for some edge case the
    // value still goes negative, the clamp keeps the card on screen.
    const top = clamp(selectedPoint.y - cardHeight - gap, 12, maxBottom - cardHeight);
    const pointerLeft = clamp(selectedPoint.x - left - 10, 12, cardWidth - 32);
    return { left, top, pointerLeft };
  }, [selectedPoint, cardHeight, mapAreaHeight, bottomContainerHeight]);

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
      // Coarse and cache-tolerant: the user drags the pin to refine, so an
      // immediate approximate centre beats a slow exact one.
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
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
      // iOS. requestAuthorization was called without callbacks and
      // getCurrentLocation ran unconditionally, so a refusal left the "Getting
      // location..." overlay up until the position read timed out - and
      // indefinitely when neither callback fired. The map itself stays usable
      // either way: this screen picks a location by tapping the map, which
      // needs no permission at all.
      Geolocation.requestAuthorization(
        () => getCurrentLocation(),
        () => {
          setLocationLoading(false);
          showLocationSettingsAlert({
            title: 'Location Permission',
            message:
              'Location access is needed to centre the map on you. You can still pick a location by tapping the map. Open settings to enable it?',
          });
        },
      );
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

  // Reaching this screen is the user deliberately choosing to update their
  // location, so this is the one path that forces a fresh read past the
  // reuse window. Every automatic caller reuses the stored position.
  useEffect(() => {
    fetchStoreLocation({ force: true });
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
          sendFrom: 'map',
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
        setClinicSearchResults([]);
        setPlaceSearchResults([]);
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

        // Search both places (addresses/locations) and clinics in parallel
        const [placeResults, clinicResults] = await Promise.all([
          searchPlaces(searchQuery, { lat: currentRegion.latitude, lng: currentRegion.longitude }),
          searchClinicsByName(searchQuery, currentRegion.latitude, currentRegion.longitude)
        ]);

        // Update place search results
        if (placeResults && placeResults.length > 0) {
          setPlaceSearchResults(placeResults);
        } else {
          setPlaceSearchResults([]);
        }

        // Update clinic search results
        if (clinicResults && clinicResults.length > 0) {
          setClinicSearchResults(clinicResults);
          // Show matching clinics on the map
          setClinics(clinicResults);
          setSelectedClinic(null);
          setTimeout(() => zoomToFitClinics(clinicResults), 100);
        } else {
          setClinicSearchResults([]);
        }
      } catch (error) {
        console.error('Search error:', error);
        Toast.error('Failed to search');
        setClinicSearchResults([]);
        setPlaceSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]); // Only depend on searchQuery to avoid re-running on region changes

  // Handle place/location selection from search results
  const handlePlaceSelect = async (place: PlacePrediction) => {
    // Set flag to skip search when updating searchQuery
    isSelectingPlace.current = true;

    setShowSearchResults(false);
    setSearchQuery(place.description);
    setSelectedClinic(null);
    setClinicSearchResults([]);
    setPlaceSearchResults([]);

    // Get place details (coordinates)
    const placeDetails = await getPlaceDetails(place.place_id);

    if (placeDetails && placeDetails.geometry?.location) {
      const lat = placeDetails.geometry.location.lat;
      const lng = placeDetails.geometry.location.lng;

      if (!isNaN(lat) && !isNaN(lng)) {
        // Update selected location
        setSelectedLocation({
          latitude: lat,
          longitude: lng,
          address: placeDetails.formatted_address,
        });

        // Update map region
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

        // Fetch clinics near this location
        fetchClinics(lat, lng);
      }
    } else {
      Toast.error('Failed to get location details');
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

  // Render place search result item
  const renderPlaceSearchResult = ({ item }: { item: PlacePrediction }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => handlePlaceSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.placeResultIcon}>
        <Ionicons name="location" size={16} color="white" />
      </View>
      <View style={styles.searchResultText}>
        <Text style={styles.searchResultMainText}>
          {item.structured_formatting?.main_text || item.description}
        </Text>
        <Text style={styles.searchResultSecondaryText}>
          {item.structured_formatting?.secondary_text || ''}
        </Text>
      </View>
    </TouchableOpacity>
  );

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
          {item.details?.businessName || item.clinicName || ''}
        </Text>
        <Text style={styles.searchResultSecondaryText}>
          {item.businessType} • ⭐ {parseFloat(item.avgRating).toFixed(1)}
          {item.details?.city ? ` • ${item.details.city}` : ''}
        </Text>
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
                setPlaceSearchResults([]);
                setClinicSearchResults([]);
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
        visible={showSearchResults && (placeSearchResults.length > 0 || clinicSearchResults.length > 0 || isSearching)}
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
              <ScrollView keyboardShouldPersistTaps="handled">
                {/* Places Section */}
                {placeSearchResults.length > 0 && (
                  <>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="location" size={16} color={colors.primary} />
                      <Text style={styles.sectionHeaderText}>{t('places') || 'Places'} ({placeSearchResults.length})</Text>
                    </View>
                    {placeSearchResults.map((place) => (
                      <View key={place.place_id}>
                        {renderPlaceSearchResult({ item: place })}
                      </View>
                    ))}
                  </>
                )}

                {/* Clinics Section */}
                {clinicSearchResults.length > 0 && (
                  <>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="medkit" size={16} color={colors.primary} />
                      <Text style={styles.sectionHeaderText}>{t('clinics') || 'Clinics'} ({clinicSearchResults.length})</Text>
                    </View>
                    {clinicSearchResults.map((clinic) => (
                      <View key={clinic.clinicID}>
                        {renderClinicSearchResult({ item: clinic })}
                      </View>
                    ))}
                  </>
                )}

                {/* No Results */}
                {placeSearchResults.length === 0 && clinicSearchResults.length === 0 && (
                  <View style={styles.noResultsContainer}>
                    <Text style={styles.noResultsText}>{t('no_results_found')}</Text>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
      <View
        style={{ flex: 1 }}
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          if (h && Math.abs(h - mapAreaHeight) > 1) setMapAreaHeight(h);
        }}
      >
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={region}
          onRegionChangeComplete={handleRegionChangeComplete}
          onPress={handleMapPress}
          showsUserLocation={true}
          showsMyLocationButton={true}
          toolbarEnabled={false}
        >
          {/* Selected location marker (red pin). Hidden while a clinic is
              selected so the native marker is fully unmounted; this avoids the
              Android react-native-maps bug where a stale pin remains after
              tapping a clinic and then choosing a new location. */}
          {markerCoordinate && !selectedClinic && (
            <Marker
              key={`selected-${markerCoordinate.latitude}-${markerCoordinate.longitude}`}
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
              <ClinicMarker
                key={`clinic-${clinic.clinicID}-${index}`}
                coordinates={coordinates}
                isSelected={isSelected}
                zIndex={index}
                onPress={() => handleClinicMarkerPress(clinic)}
              />
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
            onLayout={(e) => {
              const h = e.nativeEvent.layout.height;
              // Only grow — shrinking can race with a just-completed pan and
              // make the card briefly look like it doesn't fit above the pin.
              if (h && h > cardHeight + 1) setCardHeight(h);
            }}
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
                  {selectedClinic.details?.businessName || selectedClinic.clinicName || ''}
                </Text>
              </View>
            </View>
            <View style={[styles.cardPointer, { left: cardPosition.pointerLeft }]} />
          </TouchableOpacity>
        )}
      </View>

      {/* Bottom Section: Selected Location Info and Action Buttons */}
      {selectedLocation && (
        <View
          style={styles.bottomContainer}
          onLayout={(e) => {
            const h = e.nativeEvent.layout.height;
            if (h && Math.abs(h - bottomContainerHeight) > 1) setBottomContainerHeight(h);
          }}
        >
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
