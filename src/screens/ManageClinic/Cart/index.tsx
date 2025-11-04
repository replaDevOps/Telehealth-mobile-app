import { PipsImage, RecommandImage } from '@assets/images';
import { Header2 } from '@components/common/Header2';
import React, { useState } from 'react';
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

export function CartScreen({ navigation }) {
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

import { styles } from './style';
