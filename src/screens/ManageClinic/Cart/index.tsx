import { PipsImage, RecommandImage } from '@assets/images';
import { Header2 } from '@components/common/Header2';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../styles/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CustomButton } from '@components/common/CustomButton';

export default function CartScreen({ navigation }) {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      clinicName: 'Eden Medical Center',
      clinicLocation: 'Makkah, Saudi Arabia, 2.2km',
      services: [
        {
          id: 1,
          name: 'Acne Treatment',
          duration: '40 min',
          price: 200,
          priceText: '200 SAR',
          category: 'Dental',
          categoryBadge: 'Enaqa Name',
          image: PipsImage,
        },
        {
          id: 2,
          name: 'Teeth Whiting',
          duration: '40 min',
          price: 200,
          priceText: '200 SAR',
          category: 'Dental',
          categoryBadge: 'Group Name',
          image: PipsImage,
        },
      ],
    },
    {
      id: 2,
      clinicName: 'Sunny Medical Center',
      clinicLocation: 'Makkah, Saudi Arabia, 2.2km',
      services: [
        {
          id: 3,
          name: 'Acne Treatment',
          duration: '40 min',
          price: 200,
          priceText: '200 SAR',
          category: 'Dental',
          categoryBadge: 'Group Name',
          image: PipsImage,
        },
      ],
    },
  ]);

  const calculateSubtotal = services => {
    const total = services.reduce((sum, service) => sum + service.price, 0);
    return `${total} SAR`;
  };

  const removeService = (clinicId, serviceId) => {
    setCartItems(prevItems => {
      return prevItems
        .map(clinic => {
          if (clinic.id === clinicId) {
            const updatedServices = clinic.services.filter(
              s => s.id !== serviceId,
            );
            return { ...clinic, services: updatedServices };
          }
          return clinic;
        })
        .filter(clinic => clinic.services.length > 0);
    });
  };

  const handleCheckout = clinic => {
    // Navigate to checkout screen with clinic data
    navigation.navigate('CheckoutScreen', {
      clinic: clinic,
      services: clinic.services,
    });
    console.log('Navigate to Checkout for:', clinic.clinicName);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <Header2 title="Cart" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {cartItems.map(clinic => (
          <View key={clinic.id} style={styles.clinicSection}>
            {/* Clinic Info */}
            <View style={styles.clinicCard}>
              <Image
                source={RecommandImage}
                resizeMode="cover"
                style={styles.clinicImage}
              />
              <View style={styles.clinicInfo}>
                <Text style={styles.clinicName}>{clinic.clinicName}</Text>
                <Text style={styles.clinicLocation}>
                  {clinic.clinicLocation}
                </Text>
              </View>
            </View>

            {/* Services */}
            {clinic.services.map(service => (
              <View key={service.id} style={styles.serviceCard}>
                <Image source={service.image} style={styles.serviceImage} />
                <View style={styles.serviceContent}>
                  <View style={styles.serviceHeader}>
                    <View style={styles.serviceBadges}>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>
                          {service.category}
                        </Text>
                      </View>
                      <View style={styles.nameBadge}>
                        <Text style={styles.nameBadgeText}>
                          {service.categoryBadge}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeService(clinic.id, service.id)}
                    >
                      <View style={styles.removeCircle}>
                        <Text style={styles.removeIcon}>×</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <View style={styles.serviceFooter}>
                    <View style={styles.durationContainer}>
                      <Ionicons
                        name="time-outline"
                        size={18}
                        color={colors.secondaryText}
                      />
                      <Text style={styles.duration}>{service.duration}</Text>
                    </View>
                    <Text style={styles.servicePrice}>{service.priceText}</Text>
                  </View>
                </View>
              </View>
            ))}

            {/* Subtotal */}
            <View style={styles.subtotalContainer}>
              <Text style={styles.subtotalLabel}>Subtotal</Text>
              <Text style={styles.subtotalValue}>
                {calculateSubtotal(clinic.services)}
              </Text>
            </View>

            <CustomButton
              title="Continue to Checkout"
              onPress={() => handleCheckout(clinic)}
            />

            <Text style={styles.taxNote}>Taxes calculated at checkout</Text>
          </View>
        ))}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 4,
  },
  backIcon: {
    fontSize: 22,
    color: '#000',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 30,
  },
  scrollView: {
    flex: 1,
  },
  clinicSection: {
    backgroundColor: '#fff',
    marginTop: 16,
    paddingTop: 16,
    marginHorizontal: 16,
    paddingBottom: 20,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  clinicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  clinicImage: {
    width: 44,
    height: 44,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  clinicEmoji: {
    fontSize: 22,
  },
  clinicInfo: {
    flex: 1,
  },
  clinicName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  clinicLocation: {
    fontSize: 12,
    color: colors.secondaryText,
  },
  serviceCard: {
    flexDirection: 'row',
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  serviceImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 12,
  },
  serviceContent: {
    flex: 1,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  serviceBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  categoryBadge: {
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '500',
  },
  nameBadge: {
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  nameBadgeText: {
    fontSize: 10,
    color: colors.text,
    fontWeight: '500',
  },
  removeButton: {
    position: 'absolute',
    top: -20,
    right: -15,
  },
  removeCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIcon: {
    fontSize: 18,
    color: colors.white,

    fontWeight: '400',
    lineHeight: 20,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clockIcon: {
    fontSize: 12,
  },
  duration: {
    fontSize: 12,
    color: '#666',
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },
  subtotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 4,
  },
  subtotalLabel: {
    fontSize: 15,
    fontWeight: '400',
    color: '#000',
  },
  subtotalValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },
  checkoutButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  taxNote: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    marginTop: 10,
  },
  bottomSpacing: {
    height: 20,
  },
});
