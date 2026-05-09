import { RecommandImage } from '@assets/images';
import ClinicAvatar from '@components/common/ClinicAvatar';
import { Header2 } from '@components/common/Header2';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../styles/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CustomButton } from '@components/common/CustomButton';
import { useCart } from '@context/CartContext';
import { useCartCountContext } from '@context/CartCountContext';
import { styles } from './style';
import { EmptyContentSvg } from '@assets/icons';
import { useTranslation } from 'react-i18next';
import Geolocation from '@react-native-community/geolocation';
import { apiClient } from '@services/api/api-client';
import { API } from '@services/api/api-endpoint';
import { Toast } from 'toastify-react-native';
import { coinIcon } from '@assets/images';
import { useFocusEffect } from '@react-navigation/native';

export function CartScreen({ navigation }) {
  const { t } = useTranslation();
  const { removeFromCart, addToCart } = useCart();
  const { triggerRefresh, decrementCartCount, incrementCartCount } = useCartCountContext();
  const [cartData, setCartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingCartId, setRemovingCartId] = useState<number | null>(null);
  const [addingServiceId, setAddingServiceId] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; long: number } | null>(null);
  const [grandTotalPrice, setGrandTotalPrice] = useState<number>(0);
  const [grandTotalLoyaltyPoints, setGrandTotalLoyaltyPoints] = useState<number>(0);

  // Refs for request deduplication and cancellation
  const isFetchingRef = useRef(false);
  const abortControllerRef = useRef<any>(null);
  const lastFetchParamsRef = useRef<{ lat: number; long: number } | null>(null);
  const lastFetchTimeRef = useRef<number>(0);
  const FETCH_CACHE_DURATION = 5000; // Cache fetch results for 5 seconds

  useEffect(() => {
    requestLocationAndFetchCart();
  }, []);

  // Refresh cart when screen comes into focus (with deduplication and debouncing)
  useFocusEffect(
    React.useCallback(() => {
      // Debounce focus events - only fetch if location exists and not recently fetched
      const now = Date.now();
      if (userLocation && now - lastFetchTimeRef.current > FETCH_CACHE_DURATION) {
        // Small delay to prevent race condition with initial mount
        const timer = setTimeout(() => {
          fetchCartDetails(userLocation.lat, userLocation.long, false);
        }, 300);
        return () => clearTimeout(timer);
      }
    }, [userLocation, fetchCartDetails])
  );

  const requestLocationAndFetchCart = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocationAndFetch();
        } else {
          // Use default location if permission denied
          fetchCartDetails(24.7136, 46.6753);
        }
      } else {
        Geolocation.requestAuthorization();
        getCurrentLocationAndFetch();
      }
    } catch (err) {
      console.warn('Location permission error:', err);
      fetchCartDetails(24.7136, 46.6753);
    }
  };

  const getCurrentLocationAndFetch = () => {
    // Use cached location if available (within 10 seconds)
    const cachedLocation = lastFetchParamsRef.current;
    const now = Date.now();
    if (cachedLocation && now - lastFetchTimeRef.current < 10000) {
      console.log('📍 Using cached location for faster load');
      setUserLocation({ lat: cachedLocation.lat, long: cachedLocation.long });
      fetchCartDetails(cachedLocation.lat, cachedLocation.long, true);
      return;
    }

    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        // Only update location if it's different (avoid triggering useFocusEffect unnecessarily)
        setUserLocation(prev => {
          if (prev && prev.lat === latitude && prev.long === longitude) {
            return prev; // Same location, don't update
          }
          return { lat: latitude, long: longitude };
        });
        fetchCartDetails(latitude, longitude, true);
      },
      error => {
        console.warn('Error getting location:', error);
        // Use default location (Riyadh, Saudi Arabia)
        const defaultLocation = { lat: 24.7136, long: 46.6753 };
        setUserLocation(defaultLocation);
        fetchCartDetails(defaultLocation.lat, defaultLocation.long, true);
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 } // 5s timeout, 5min cache
    );
  };

  const transformCartData = useCallback((apiData: any): any[] => {
    console.log('Transforming API data for cart UI', apiData);
    // Transform API response structure to match UI
    // API response: { data: [{ clinicID, clinicName, distance_km, totalPrice, totalLoyaltyPoints, items: [...], suggestedServices: [...] }] }
    if (Array.isArray(apiData)) {
      return apiData.map((clinicGroup: any) => ({
        clinic: {
          id: clinicGroup.clinicID,
          name: clinicGroup.clinicName,
          // Prefer explicit address from API if provided, otherwise fall back to existing location or empty string
          address: clinicGroup?.clinic?.address || clinicGroup?.address || '',
          location: clinicGroup?.clinic?.address || clinicGroup?.address || clinicGroup.clinicName || '',
          // Prefer real clinic image when the API provides one, otherwise leave
          // undefined so the card falls back to ClinicAvatar (initials).
          image: { uri: clinicGroup.logo },
          distance: clinicGroup.distance_km
            ? `${parseFloat(clinicGroup.distance_km.toString()).toFixed(1)}km`
            : null,
        },
        totalPrice: clinicGroup.totalPrice,
        totalLoyaltyPoints: clinicGroup.totalLoyaltyPoints,
        clinicLoyaltyPoints: clinicGroup.clinicLoyaltyPoints, // For displaying loyalty points at clinic level
        services: (clinicGroup.items || []).map((item: any) => ({
          id: item.serviceID,
          cartID: item.cartID, // Keep cartID for removal
          image: item.image ? { uri: item.image } : RecommandImage,
          type: item.serviceType || 'General', // Not provided in API response, using default
          serviceGroup: item.group?.groupName || 'Group',
          serviceName: item.serviceName,
          price: item.price ? `SAR ${parseFloat(item.price).toFixed(2)}` : 'SAR 0.00',
          duration: item.duration ? `${item.duration} ${t('minutes') || 'minutes'}` : '0 minutes',
          loyaltyPoints: item.loyaltyPoints,
        })),
        suggestedServices: (clinicGroup.suggestedServices || []).map((service: any) => ({
          id: service.id,
          serviceID: service.id, // Keep serviceID for adding to cart
          clinicID: service.clinicID,
          image: service.image ? { uri: service.image } : RecommandImage,
          type: service.serviceType || '',
          serviceGroup: service.group?.name || 'Group',
          serviceName: service.name,
          price: service.price ? `SAR ${parseFloat(service.price).toFixed(2)}` : 'SAR 0.00',
          duration: service.duration ? `${service.duration} ${t('minutes') || 'minutes'}` : '0 minutes',
          loyaltyPoints: service.bonusLoyalityPoints || '0',
          description: service.description,
          procedure: service.procedure,
          tags: service.tags,
        })),
      }));
    }

    return [];
  }, [t]);

  const fetchClinicLogos = useCallback(async (data: any[]) => {
    const updates = await Promise.all(
      data.map(async (group) => {
        if (group.clinic.image) return null; // already have image, skip
        try {
          const res = await apiClient.get(API.CLINIC.GET_CLINIC_DESCRIPTION, {
            params: { clinicID: group.clinic.id },
          });
          const d = res.data?.data;
          const image = d?.logo
            ? { uri: d.logo }
            : d?.coverImage
              ? { uri: d.coverImage }
              : null;
          return image ? { clinicId: group.clinic.id, image } : null;
        } catch {
          return null;
        }
      })
    );
    const imageMap: Record<string, any> = {};
    updates.forEach(u => { if (u) imageMap[u.clinicId] = u.image; });
    if (Object.keys(imageMap).length === 0) return;
    setCartData(prev =>
      prev.map(group =>
        imageMap[group.clinic.id]
          ? { ...group, clinic: { ...group.clinic, image: imageMap[group.clinic.id] } }
          : group
      )
    );
  }, []);

  const fetchCartDetails = useCallback(async (lat: number, long: number, isInitialLoad: boolean = true, forceRefresh: boolean = false) => {
    // Request deduplication - prevent multiple simultaneous calls
    if (isFetchingRef.current) {
      console.log('⚠️ fetchCartDetails already in progress, skipping duplicate call');
      return;
    }

    // Check if we're calling with the same params and recently fetched
    const now = Date.now();
    const lastParams = lastFetchParamsRef.current;
    if (!forceRefresh && lastParams && lastParams.lat === lat && lastParams.long === long) {
      const timeSinceLastFetch = now - lastFetchTimeRef.current;
      if (timeSinceLastFetch < FETCH_CACHE_DURATION) {
        console.log(`⚠️ Recent fetch with same params (${timeSinceLastFetch}ms ago), skipping duplicate call`);
        return;
      }
    }

    // Cancel any previous request if AbortController is available
    if (typeof AbortController !== 'undefined' && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request if available
    let abortController: AbortController | null = null;
    if (typeof AbortController !== 'undefined') {
      abortController = new AbortController();
      abortControllerRef.current = abortController;
    }

    isFetchingRef.current = true;
    lastFetchParamsRef.current = { lat, long };

    const startTime = Date.now();
    const requestId = `CART_${startTime}`;


    try {
      if (isInitialLoad) {
        setLoading(true);
      }

      const requestConfig: any = {
        params: {
          lat: lat.toString(),
          long: long.toString(),
        },
      };

      // Add signal only if AbortController is available
      if (abortController) {
        requestConfig.signal = abortController.signal;
      }

      const response = await apiClient.get(API.CART.VIEW_CART_DETAILS, requestConfig);
      console.log(`🛒 [${requestId}] API response received`, response.data);
     

      // Check if request was aborted
      if (abortController && abortController.signal.aborted) {
        console.log(`🛒 [${requestId}] ⚠️ Request aborted`);
        return;
      }

      if (response.data.success && response.data.data) {
        console.log(`🛒 [${requestId}] Response Data:`, response.data.data);
        // Transform API response to match UI structure
        const transformedData = transformCartData(response.data.data);
        console.log(`🛒 [${requestId}] Transformed Cart Data:`, transformedData);
        setCartData(transformedData);
        // Store grand totals from API response
        setGrandTotalPrice(response.data.grandTotalPrice || 0);
        setGrandTotalLoyaltyPoints(response.data.grandTotalLoyaltyPoints || 0);
        // Fetch clinic logos for clinics that don't have an image yet
        fetchClinicLogos(transformedData);
      } else {
        setCartData([]);
        setGrandTotalPrice(0);
        setGrandTotalLoyaltyPoints(0);
      }

      // Update last fetch time
      lastFetchTimeRef.current = Date.now();
    } catch (error: any) {
      // Ignore abort errors
      if (error.name === 'AbortError' || (abortController && abortController.signal.aborted)) {
        console.log(`🛒 [${requestId}] ⚠️ Request aborted`);
        return;
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

     

      Toast.error(error.message || 'Failed to fetch cart details');
      setCartData([]);
    } finally {
      isFetchingRef.current = false;
      abortControllerRef.current = null;
      setLoading(false);
      const totalDuration = Date.now() - startTime;
      console.log(`🛒 [${requestId}] 🏁 COMPLETE - Total time: ${totalDuration}ms`);
    }
  }, [transformCartData]);

  // Get suggested services from API response for a specific clinic
  const getSuggestedServices = (clinicId: string) => {
    const clinicGroup = cartData.find((group: any) => group.clinic.id === clinicId);
    if (clinicGroup && clinicGroup.suggestedServices) {
      return clinicGroup.suggestedServices;
    }
    return [];
  };

  // Check if a service is already in the cart
  const isServiceInCart = useCallback((serviceID: number) => {
    return cartData.some(clinicGroup =>
      clinicGroup.services.some((service: any) => service.id === serviceID)
    );
  }, [cartData]);

  // Group cart items by clinic (already grouped from API)
  const groupedByClinic = cartData.reduce((acc, group) => {
    const clinicId = group.clinic.id || 'unknown';
    acc[clinicId] = group;
    return acc;
  }, {});

  const calculateSubtotal = (clinicGroup: any) => {
    // Use totalPrice from API if available, otherwise calculate from services
    if (clinicGroup.totalPrice !== undefined) {
      return `SAR ${parseFloat(clinicGroup.totalPrice.toString()).toFixed(2)}`;
    }
    const total = clinicGroup.services.reduce((sum: number, service: any) => {
      const price = parseFloat(service.price.replace(/[^0-9.]/g, ''));
      return sum + price;
    }, 0);
    return `SAR ${total.toFixed(2)}`;
  };

  const handleRemoveService = async (service: any) => {
    // Check if cartID is available
    if (!service.cartID) {
      Toast.error('Cart ID is missing');
      return;
    }

    const cartID = service.cartID;
    setRemovingCartId(cartID);

    const startTime = Date.now();
    const requestId = `REMOVE_${startTime}`;
    const endpoint = `${API.CART.REMOVE_FROM_CART}/${cartID}`;

    try {
      // Call DELETE API to remove item from cart
      const response = await apiClient.delete(endpoint);

      const endTime = Date.now();
      const duration = endTime - startTime;


      if (response.data?.success === false) {
        const errorMessage = response.data?.message || 'Failed to remove item from cart';
        Toast.error(errorMessage);
        setRemovingCartId(null);
        return;
      }

      // Remove from local cart context (for immediate UI feedback)
      if (service.id) {
        removeFromCart(service.id.toString());
      }

      // Show success message
      const successMessage = response.data?.message || 'Item removed from cart';
      Toast.success(successMessage);

      // Optimistically decrement cart count for immediate UI update
      decrementCartCount();

      // Trigger cart count refresh to sync with API
      triggerRefresh();

      // Refresh cart from API (with flag to prevent showing loading spinner on refresh)
      if (userLocation) {
        await fetchCartDetails(userLocation.lat, userLocation.long, false, true);
      }
    } catch (error: any) {

      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to remove item from cart';
      Toast.error(errorMessage);
    } finally {
      setRemovingCartId(null);
      const totalDuration = Date.now() - startTime;
      console.log(`🗑️ [${requestId}] 🏁 COMPLETE - Total time: ${totalDuration}ms`);
    }
  };

  const handleCheckout = clinicGroup => {
    // Navigate to checkout screen with clinic data
    const checkoutServices = clinicGroup.services.map(service => ({
      service: service,
      clinic: { ...clinicGroup.clinic, clinicLoyaltyPoints: clinicGroup.clinicLoyaltyPoints },
    }));

    navigation.navigate('CheckoutScreen', {
      services: checkoutServices,
      fromCart: true,
      totalLoyaltyPoints: clinicGroup.totalLoyaltyPoints,
      clinicLoyaltyPoints: clinicGroup.clinicLoyaltyPoints,
    });
  };

  const handleAddSuggestedService = async (service: any, clinic: any) => {
    if (!service || !service.serviceID) {
      Toast.error('Invalid service');
      return;
    }

    const serviceID = service.serviceID;
    setAddingServiceId(serviceID);

    const startTime = Date.now();
    const requestId = `ADD_SUGGESTED_${startTime}`;

   

    try {
      // Call API to add service to cart
      const response = await apiClient.post(API.CART.ADD_TO_CART, {
        serviceID: serviceID,
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

    

      if (response.data?.success === false) {
        const errorMessage = response.data?.message || 'Failed to add service to cart';
        Toast.error(errorMessage);
        return;
      }

      console.log("Adding to cart",{
        service: service,
        clinic: clinic,
      })
      // Add to local cart context for immediate UI update
      addToCart({
        service: service,
        clinic: clinic,
      });
      
      // Show success message
      const successMessage = response.data?.message || response.data?.data?.message || 'Service added to cart successfully';
      Toast.success(successMessage);

      // Optimistically increment cart count for immediate UI update
      incrementCartCount();

      // Trigger cart count refresh to sync with API
      triggerRefresh();

      // Refresh cart from API to update suggested services and totals
      if (userLocation) {
        await fetchCartDetails(userLocation.lat, userLocation.long, false, true);
      } else {
        // Fallback to default location
        await fetchCartDetails(24.7136, 46.6753, false, true);
      }
    } catch (error: any) {

      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to add service to cart';
      Toast.error(errorMessage);
    } finally {
      setAddingServiceId(null);
      const totalDuration = Date.now() - startTime;
      console.log(`➕ [${requestId}] 🏁 COMPLETE - Total time: ${totalDuration}ms`);
    }
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <Header2 title={t('cart')} />
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.emptyText}>{t('loading') || 'Loading...'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Empty cart state
  if (cartData.length === 0 || Object.keys(groupedByClinic).length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <Header2 title={t('cart')} />
        <View style={styles.emptyContainer}>
          <EmptyContentSvg />
          <Text style={styles.emptyText}>{t('your_cart_is_empty')}</Text>
          <CustomButton
            title={t('browse_services')}
            onPress={() => navigation.goBack()}
            style={styles.browseButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <Header2 title={t('cart')} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {Object.values(groupedByClinic).map((clinicGroup: any) => (
          <View key={clinicGroup.clinic.id} style={styles.clinicSection}>
            {/* Clinic Info */}
            <View style={styles.clinicCard}>
              {clinicGroup.clinic.image ? (
                <Image
                  source={clinicGroup.clinic.image}
                  resizeMode="cover"
                  style={styles.clinicImage}
                />
              ) : (
                <ClinicAvatar name={clinicGroup.clinic.name} size={56} style={styles.clinicImage} />
              )}
              <View style={styles.clinicInfo}>
                <Text style={styles.clinicName} numberOfLines={1} ellipsizeMode="tail">{clinicGroup.clinic.name}</Text>
                
                <Text style={styles.clinicLocation} numberOfLines={1} ellipsizeMode="tail">
                  {clinicGroup.clinic.address || clinicGroup.clinic.location || ''}{clinicGroup.clinic.distance ? `, ${clinicGroup.clinic.distance}` : ''}
                </Text>

                <View style={styles.clinicPointsContainer}>
                  <View style={styles.coinWrapper}>
                    <Image source={coinIcon} style={styles.coinImage} />
                  </View>
                  <Text style={styles.clinicPointsText}>{Math.round(Number(clinicGroup.clinicLoyaltyPoints || 0))}</Text>
                </View>
                
              </View>
            </View>

            {/* Services in Cart */}
            {clinicGroup.services.map(service => (
              <View key={service.cartID} style={styles.serviceCard}>
                {/* Remove button - top right */}
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveService(service)}
                  disabled={removingCartId === service.cartID}
                  activeOpacity={0.7}
                >
                  <View style={styles.removeCircle}>
                    {removingCartId === service.cartID ? (
                      <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                      <Ionicons name="close" size={16} color={colors.white} />
                    )}
                  </View>
                </TouchableOpacity>

                <View style={styles.cardHeader}>
                  <View style={styles.serviceBadges}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText} numberOfLines={1} ellipsizeMode="tail">{service.type}</Text>
                    </View>
                    <View style={styles.nameBadge}>
                      <Text style={styles.nameBadgeText} numberOfLines={1} ellipsizeMode="tail">{service.serviceGroup}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <Image source={service.image} style={styles.serviceImage} />
                  <View style={styles.serviceContent}>
                    <Text style={styles.serviceName} numberOfLines={1} ellipsizeMode="tail">{service.serviceName}</Text>
                    <View style={styles.serviceFooter}>
                      <View style={styles.durationContainer}>
                        <Ionicons
                          name="time-outline"
                          size={18}
                          color={colors.secondaryText}
                        />
                        <Text style={styles.duration}>{service.duration}</Text>
                      </View>
                      <Text style={styles.servicePrice}>{service.price}</Text>
                    </View>
                    {/* Loyalty badge per service */}
                    {service.loyaltyPoints && Number(service.loyaltyPoints) > 0 && (
                      <View style={styles.loyaltyBadge}>
                        <View style={styles.coinWrapper}>
                          <Image source={coinIcon} style={styles.coinImage} />
                        </View>
                        <Text style={styles.loyaltyBadgeText}>
                          {`Earn ${Math.round(Number(service.loyaltyPoints))} loyalty points`}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}

            {/* Subtotal */}
            <View style={styles.subtotalContainer}>
              <Text style={styles.subtotalLabel}>{t('subtotal')}</Text>
              <Text style={styles.subtotalValue}>
                {calculateSubtotal(clinicGroup)}
              </Text>
            </View>
            <CustomButton
              title={t('continue_to_checkout')}
              onPress={() => handleCheckout(clinicGroup)}
            />

            <Text style={styles.taxNote}>{t('taxes_calculated_at_checkout')}</Text>

            {/* Suggested Services Section (moved below checkout) */}
            {getSuggestedServices(clinicGroup.clinic.id).length > 0 && (
              <View style={styles.suggestedSection}>
                <Text style={styles.suggestedTitle}>{t('suggested_services')}</Text>

                {getSuggestedServices(clinicGroup.clinic.id).map(service => (
                  <View key={service.id} style={styles.suggestedServiceCard}>
                    {/* Add to cart button - top right */}
                    <TouchableOpacity
                      onPress={() =>
                        handleAddSuggestedService(service, clinicGroup.clinic)
                      }
                      style={[
                        styles.addSuggestedButton,
                        isServiceInCart(service.serviceID) && styles.addSuggestedButtonDisabled
                      ]}
                      disabled={addingServiceId === service.serviceID || isServiceInCart(service.serviceID)}
                      activeOpacity={0.7}
                    >
                      {addingServiceId === service.serviceID ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                      ) : isServiceInCart(service.serviceID) ? (
                        <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                      ) : (
                        <View style={styles.cartIconContainer}>
                          <Ionicons name="cart-outline" size={20} color={colors.primary} />
                          <View style={styles.plusBadge}>
                            <Ionicons name="add" size={12} color={colors.white} />
                          </View>
                        </View>
                      )}
                    </TouchableOpacity>

                    <View style={styles.cardHeader}>
                        <View style={styles.serviceBadges}>
                          <View style={styles.categoryBadge}>
                            <Text style={[styles.categoryBadgeText]} numberOfLines={1} ellipsizeMode="tail" >{service.type}</Text>
                          </View>
                          <View style={styles.nameBadge}>
                            <Text style={styles.nameBadgeText} numberOfLines={1} ellipsizeMode="tail">{service.serviceGroup}</Text>
                          </View>
                        </View>
                    </View>

                    <View style={styles.cardBody}>
                      <Image source={service.image} style={styles.serviceImage} />
                      <View style={styles.serviceContent}>
                        <Text style={styles.serviceName} numberOfLines={1} ellipsizeMode="tail">
                          {service.serviceName}
                        </Text>
                        <View style={styles.serviceFooter}>
                          <View style={styles.durationContainer}>
                            <Ionicons
                              name="time-outline"
                              size={18}
                              color={colors.secondaryText}
                            />
                            <Text style={styles.duration}>
                              {service.duration}
                            </Text>
                          </View>
                          <View style={styles.suggestedPriceContainer}>
                            <Text style={styles.servicePrice}>
                              {service.price}
                            </Text>
                          </View>
                        </View>
                        {/* Loyalty badge for suggested service */}
                        {service.loyaltyPoints && Number(service.loyaltyPoints) > 0 && (
                          <View style={styles.loyaltyBadge}>
                            <View style={styles.coinWrapper}>
                              <Image source={coinIcon} style={styles.coinImage} />
                            </View>
                            <Text style={styles.loyaltyBadgeText}>
                              {`Earn ${Math.round(Number(service.loyaltyPoints))} loyalty points`}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        <View style={styles.bottomSpacing} />
      </ScrollView >
    </SafeAreaView >
  );
}
