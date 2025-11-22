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
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ClinicProfile } from '@assets/images';
import AboutClinic from '@components/molecules/AboutCard';
import ConsultDoctorBottomSheet from '@components/molecules/ConsultDoctorBottomSheet';
import { styles } from './style';
import { useCart } from '@context/CartContext';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'react-native-element-dropdown';

import {
  SERVICES,
  CLINIC_REVIEWS,
  CLINIC_ABOUT_DATA,
} from '@constants/appData';

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
  const [selectedService, setSelectedService] = useState(null);
  const [serviceDetailVisible, setServiceDetailVisible] = useState(false);
  const [expandedReviewId, setExpandedReviewId] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deviceDetailVisible, setDeviceDetailVisible] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [sortOption, setSortOption] = useState('newest_first');
  const [sortedReviews, setSortedReviews] = useState<Review[]>([]);
  const [isFocus, setIsFocus] = useState(false);

  const services = SERVICES;
  const reviews: Review[] = CLINIC_REVIEWS;
  const aboutData = CLINIC_ABOUT_DATA;

  const sortData: SortOption[] = [
    { label: t('newest_first'), value: 'newest_first' },
    { label: t('oldest_first'), value: 'oldest_first' },
    { label: t('highest_rating'), value: 'highest_rating' },
    { label: t('lowest_rating'), value: 'lowest_rating' },
  ];

  useEffect(() => {
    sortReviews(sortOption);
  }, [reviews, sortOption]);

  const sortReviews = (option: string) => {
    let sorted = [...reviews];
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
  };

  const handleApplyFilters = (filters: any) => {
    console.log('Applied filters:', filters);
    // Apply filters to your services list
  };

  const handleConsultPress = () => {
    console.log('Consult now pressed');
    setShowBottomSheet(true);
  };

  const handleFilterPress = () => {
    setFilterVisible(true);
  };

  const handleServicePress = (service: any) => {
    setSelectedService(service);
    setServiceDetailVisible(true);
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

  const handleDevicePress = (device: any) => {
    setSelectedDevice(device);
    setDeviceDetailVisible(true);
  };

  const handleNotificationPress = () => {
    navigation.navigate('Notification');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with background image and logo */}
        <ClinicHeader
          backgroundImage={clinic.image}
          logo={ClinicProfile}
          onBackPress={() => navigation.goBack()}
          onSharePress={() => navigation.navigate('CartScreen')}
          onNotificationPress={handleNotificationPress}
          notificationCount={3}
        />

        {/* Clinic Information */}
        <ClinicInfo
          category={clinic.specialty}
          name={clinic.name}
          location={clinic.location}
          distance={'2.2km'}
          rating={clinic.rating}
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
            <View style={styles.servicesList}>
              {services.map(service => (
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
            <View style={styles.reviewsList}>
              {sortedReviews.map(review => (
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
      />

      <ServiceDetailBottomSheet
        visible={serviceDetailVisible}
        onClose={() => setServiceDetailVisible(false)}
        service={selectedService}
        onAddToCart={handleAddToCart}
        onCheckout={handleCheckout}
      />

      <DeviceDetailBottomSheet
        visible={deviceDetailVisible}
        onClose={() => setDeviceDetailVisible(false)}
        device={selectedDevice}
      />

      <ConsultDoctorBottomSheet
        visible={showBottomSheet}
        onClose={() => setShowBottomSheet(false)}
      />
    </View>
  );
};
