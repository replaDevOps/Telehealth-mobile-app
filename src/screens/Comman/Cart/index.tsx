import { RecommandImage } from '@assets/images';
import { Header2 } from '@components/common/Header2';
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../styles/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CustomButton } from '@components/common/CustomButton';
import { useCart } from '@context/CartContext';
import { SERVICES } from '@constants/appData';
import { styles } from './style';
import { EmptyContentSvg, ShopingCartSvg } from '@assets/icons';

export function CartScreen({ navigation }) {
  const { cartItems, removeFromCart, addToCart } = useCart();

  // Get suggested services (services not in cart from same clinic)
  const getSuggestedServices = (clinicId: string) => {
    const cartServiceIds = cartItems.map(item => item.service.id);
    return SERVICES.filter(
      service => !cartServiceIds.includes(service.id),
    ).slice(0, 3); // Show 3 suggested services
  };

  // Group cart items by clinic
  const groupedByClinic = cartItems.reduce((acc, item) => {
    const clinicId = item.clinic.id || 'unknown';
    if (!acc[clinicId]) {
      acc[clinicId] = {
        clinic: item.clinic,
        services: [],
      };
    }
    acc[clinicId].services.push(item.service);
    return acc;
  }, {});

  console.log('Cart Items:', cartItems.length);
  console.log('Grouped Clinics:', Object.keys(groupedByClinic).length);

  const calculateSubtotal = services => {
    const total = services.reduce((sum, service) => {
      const price = parseFloat(service.price.replace(/[^0-9.]/g, ''));
      return sum + price;
    }, 0);
    return `${total} SAR`;
  };

  const handleRemoveService = serviceId => {
    removeFromCart(serviceId);
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

  // Empty cart state
  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <Header2 title="Cart" />
        <View style={styles.emptyContainer}>
          <EmptyContentSvg />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <CustomButton
            title="Browse Services"
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
      <Header2 title="Cart" />

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
                  {clinicGroup.clinic.location}, 2.2km
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
                      onPress={() => handleRemoveService(service.id)}
                    >
                      <View style={styles.removeCircle}>
                        <Text style={styles.removeIcon}>×</Text>
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
                <Text style={styles.suggestedTitle}>Suggested Services</Text>

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
              <Text style={styles.subtotalLabel}>Subtotal</Text>
              <Text style={styles.subtotalValue}>
                {calculateSubtotal(clinicGroup.services)}
              </Text>
            </View>

            <CustomButton
              title="Continue to Checkout"
              onPress={() => handleCheckout(clinicGroup)}
            />

            <Text style={styles.taxNote}>Taxes calculated at checkout</Text>
          </View>
        ))}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}
