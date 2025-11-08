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
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import { ClinicProfile } from '@assets/images';
import AboutClinic from '@components/molecules/AboutCard';
import ConsultDoctorBottomSheet from '@components/molecules/ConsultDoctorBottomSheet';
import { styles } from './style';

import {
  SERVICES,
  CLINIC_REVIEWS,
  CLINIC_ABOUT_DATA,
} from '@constants/appData';
export const ClinicDetailScreen = ({ navigation, route }) => {
  const { clinic } = route.params;
  const [activeTab, setActiveTab] = useState('Services');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceDetailVisible, setServiceDetailVisible] = useState(false);
  const [expandedReviewId, setExpandedReviewId] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deviceDetailVisible, setDeviceDetailVisible] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  const services = SERVICES;
  const reviews = CLINIC_REVIEWS;
  const aboutData = CLINIC_ABOUT_DATA;

  const handleApplyFilters = filters => {
    console.log('Applied filters:', filters);
    // Apply filters to your services list
  };

  const handleConsultPress = () => {
    console.log('Consult now pressed');
    setShowBottomSheet(true);
    // Navigate to consultation screen
  };

  const handleFilterPress = () => {
    setFilterVisible(true);
  };

  const handleServicePress = service => {
    setSelectedService(service);
    setServiceDetailVisible(true);
  };

  const handleChatPress = () => {
    console.log('Chat with Vena AI pressed');
    navigation.navigate('ChatOnboarding');
  };
  const handleAddToCart = service => {
    console.log('Added to cart:', service);
    // Add to cart logic
    setServiceDetailVisible(false);
    navigation.navigate('CartScreen');
  };

  const handleCheckout = service => {
    console.log('Checkout:', service);
    // Navigate to checkout
    navigation.navigate('CheckoutScreen', { service });
  };
  const handleDevicePress = device => {
    setSelectedDevice(device);
    setDeviceDetailVisible(true);
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
          onSharePress={() => console.log('Share pressed')}
          onNotificationPress={() => navigation.navigate('Notifications')}
          notificationCount={3}
        />

        {/* Clinic Information */}
        <ClinicInfo
          category={clinic.specialty}
          name={clinic.name}
          location={clinic.location}
          distance={'2.2km'} // This seems to be missing from the clinic object
          rating={clinic.rating}
          onConsultPress={handleConsultPress}
        />

        {/* Tab Bar */}
        <TabBar
          tabs={['Services', 'Reviews', 'About']}
          activeTab={activeTab}
          onTabPress={setActiveTab}
        />

        {/* Content based on active tab */}
        {activeTab === 'Services' && (
          <View style={styles.servicesContent}>
            {/* All Services Header */}
            <Text style={styles.sectionTitle}>All Services</Text>

            {/* Search Bar */}
            <SearchServicesBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFilterPress={handleFilterPress}
              placeholder="Search Clinics"
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

        {activeTab === 'Reviews' && (
          <View style={styles.reviewsContent}>
            {/* Reviews Header */}
            <View style={styles.reviewsHeader}>
              <Text style={styles.reviewsTitle}>
                Reviews ({reviews.length})
              </Text>
              <TouchableOpacity style={styles.sortButton}>
                <Text style={styles.sortText}>Sort by</Text>
                <Ionicons
                  name="chevron-down"
                  size={16}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>

            {/* Reviews List */}
            <View style={styles.reviewsList}>
              {reviews.map(review => (
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

        {activeTab === 'About' && (
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
          <Text style={styles.chatButtonText}>Chat with Vena AI</Text>
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
