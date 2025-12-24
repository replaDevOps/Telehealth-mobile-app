import { RecommandImage } from '@assets/images';
import { Header2 } from '@components/common/Header2';
import React, { useState, useEffect } from 'react';
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
import { SERVICES } from '@constants/appData';
import { styles } from './style';
import { EmptyContentSvg, ShopingCartSvg } from '@assets/icons';
import { useTranslation } from 'react-i18next';
import Geolocation from '@react-native-community/geolocation';
import { apiClient } from '@services/api/api-client';
import { API } from '@services/api/api-endpoint';
import { Toast } from 'toastify-react-native';
import { useFocusEffect } from '@react-navigation/native';

export function CartScreen({ navigation }) {
  const { t } = useTranslation();
  const { removeFromCart, addToCart } = useCart();
  const { triggerRefresh, decrementCartCount } = useCartCountContext();
  const [cartData, setCartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingCartId, setRemovingCartId] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; long: number } | null>(null);
  const [grandTotalPrice, setGrandTotalPrice] = useState<number>(0);
  const [grandTotalLoyaltyPoints, setGrandTotalLoyaltyPoints] = useState<number>(0);

  useEffect(() => {
    requestLocationAndFetchCart();
  }, []);

  // Refresh cart when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (userLocation) {
        fetchCartDetails(userLocation.lat, userLocation.long);
      }
    }, [userLocation])
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
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, long: longitude });
        fetchCartDetails(latitude, longitude);
      },
      error => {
        console.warn('Error getting location:', error);
        // Use default location (Riyadh, Saudi Arabia)
        fetchCartDetails(24.7136, 46.6753);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const fetchCartDetails = async (lat: number, long: number) => {
    try {
      setLoading(true);
      const response = await apiClient.get(API.CART.VIEW_CART_DETAILS, {
        params: {
          lat: lat.toString(),
          long: long.toString(),
        },
      });

      if (response.data.success && response.data.data) {
        // Transform API response to match UI structure
        const transformedData = transformCartData(response.data.data);
        setCartData(transformedData);
        // Store grand totals from API response
        setGrandTotalPrice(response.data.grandTotalPrice || 0);
        setGrandTotalLoyaltyPoints(response.data.grandTotalLoyaltyPoints || 0);
      } else {
        setCartData([]);
        setGrandTotalPrice(0);
        setGrandTotalLoyaltyPoints(0);
      }
    } catch (error: any) {
      console.error('Error fetching cart details:', error);
      Toast.error(error.message || 'Failed to fetch cart details');
      setCartData([]);
    } finally {
      setLoading(false);
    }
  };

  const transformCartData = (apiData: any): any[] => {
    // Transform API response structure to match UI
    // API response: { data: [{ clinicID, clinicName, distance_km, totalPrice, totalLoyaltyPoints, items: [...] }] }
    if (Array.isArray(apiData)) {
      return apiData.map((clinicGroup: any) => ({
        clinic: {
          id: clinicGroup.clinicID,
          name: clinicGroup.clinicName,
          location: '', // Not provided in API response
          image: RecommandImage, // Not provided in API response
          distance: clinicGroup.distance_km 
            ? `${parseFloat(clinicGroup.distance_km.toString()).toFixed(1)}km` 
            : null,
        },
        totalPrice: clinicGroup.totalPrice,
        totalLoyaltyPoints: clinicGroup.totalLoyaltyPoints,
        services: (clinicGroup.items || []).map((item: any) => ({
          id: item.serviceID,
          cartID: item.cartID, // Keep cartID for removal
          image: item.image ? { uri: item.image } : RecommandImage,
          type: 'General', // Not provided in API response, using default
          serviceGroup: item.group?.groupName || 'Group',
          serviceName: item.serviceName,
          price: item.price ? `SAR ${parseFloat(item.price).toFixed(2)}` : 'SAR 0.00',
          duration: item.duration ? `${item.duration} ${t('minutes') || 'minutes'}` : '0 minutes',
          loyaltyPoints: item.loyaltyPoints,
        })),
      }));
    }
    
    return [];
  };

  // Get suggested services (services not in cart from same clinic)
  const getSuggestedServices = (clinicId: string) => {
    const cartServiceIds: string[] = [];
    cartData.forEach(group => {
      group.services.forEach((service: any) => {
        cartServiceIds.push(service.id);
      });
    });
    return SERVICES.filter(
      service => !cartServiceIds.includes(service.id),
    ).slice(0, 3); // Show 3 suggested services
  };

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

    try {
      // Call DELETE API to remove item from cart
      const response = await apiClient.delete(`${API.CART.REMOVE_FROM_CART}/${cartID}`);

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

      // Refresh cart from API
      if (userLocation) {
        await fetchCartDetails(userLocation.lat, userLocation.long);
      }
    } catch (error: any) {
      console.error('Error removing item from cart:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to remove item from cart';
      Toast.error(errorMessage);
    } finally {
      setRemovingCartId(null);
    }
  };

  const handleCheckout = clinicGroup => {
    // Navigate to checkout screen with clinic data
    const checkoutServices = clinicGroup.services.map(service => ({
      service: service,
      clinic: clinicGroup.clinic,
    }));

    navigation.navigate('CheckoutScreen', {
      services: checkoutServices,
      fromCart: true,
    });
  };

  const handleAddSuggestedService = (service, clinic) => {
    // Add suggested service directly to cart
    addToCart({
      service: service,
      clinic: clinic,
    });
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
              <Image
                source={clinicGroup.clinic.image || RecommandImage}
                resizeMode="cover"
                style={styles.clinicImage}
              />
              <View style={styles.clinicInfo}>
                <Text style={styles.clinicName}>{clinicGroup.clinic.name}</Text>
                <Text style={styles.clinicLocation}>
                  {clinicGroup.clinic.distance || ''}
                </Text>
              </View>
            </View>

            {/* Services in Cart */}
            {clinicGroup.services.map(service => (
              <View key={service.id} style={styles.serviceCard}>
                <Image source={service.image} style={styles.serviceImage} />
                <View style={styles.serviceContent}>
                  <View style={styles.serviceHeader}>
                    <View style={styles.serviceBadges}>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>
                          {service.type}
                        </Text>
                      </View>
                      <View style={styles.nameBadge}>
                        <Text style={styles.nameBadgeText}>
                          {service.serviceGroup}
                        </Text>
                      </View>
                    </View>
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
                        <Text style={styles.removeIcon}>×</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.serviceName}>{service.serviceName}</Text>
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
                </View>
              </View>
            ))}

            {/* Suggested Services Section */}
            {getSuggestedServices(clinicGroup.clinic.id).length > 0 && (
              <View style={styles.suggestedSection}>
                <Text style={styles.suggestedTitle}>{t('suggested_services')}</Text>

                {getSuggestedServices(clinicGroup.clinic.id).map(service => (
                  <View key={service.id} style={styles.suggestedServiceCard}>
                    <Image source={service.image} style={styles.serviceImage} />
                    <View style={styles.serviceContent}>
                      <View style={styles.serviceBadges}>
                        <View style={styles.categoryBadge}>
                          <Text style={styles.categoryBadgeText}>
                            {service.type}
                          </Text>
                        </View>
                        <View style={styles.nameBadge}>
                          <Text style={styles.nameBadgeText}>
                            {service.serviceGroup}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.serviceName}>
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
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                        handleAddSuggestedService(service, clinicGroup.clinic)
                      }
                      style={styles.addSuggestedButton}
                    >
                      <View
                        style={{
                          position: 'absolute',
                          right: -6,
                          top: -6,
                        }}
                      >
                        <Ionicons
                          name="add-circle"
                          size={18}
                          color={colors.primary}
                        />
                      </View>
                      <ShopingCartSvg width={20} height={20} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

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
          </View>
        ))}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}
