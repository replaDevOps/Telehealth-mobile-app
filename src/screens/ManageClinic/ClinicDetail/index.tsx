import SearchServicesBar from '@components/common/SearchInput';
import {
  ClinicHeader,
  // FilterBottomSheet,
  ServiceCard,
  TabBar,
} from '@components/molecules';
import { ClinicInfo } from '@components/molecules/ClinicInfo';
import { colors } from '../../../styles/colors';
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import { ClinicProfile, PipsImage, RecommandImage } from '@assets/images';

const ClinicDetailScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Services');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);

  // Sample data - replace with actual data from route.params or API
  const clinicData = {
    backgroundImage: RecommandImage,
    logo: ClinicProfile,
    category: 'Derma & Dental',
    name: 'Eden Medical Center',
    location: 'Makkah, Saudi Arabia',
    distance: '2.2km',
    rating: 4.5,
  };

  const services = [
    {
      id: '1',
      image: PipsImage,
      type: 'Type',
      serviceGroup: 'Service Group',
      serviceName: 'Service Name',
      price: '200 SAR',
      duration: '40 min',
    },
    {
      id: '2',
      image: PipsImage,
      type: 'Type',
      serviceGroup: 'Service Group',
      serviceName: 'Service Name',
      price: '200 SAR',
      duration: '40 min',
    },
    {
      id: '3',
      image: PipsImage,
      type: 'Type',
      serviceGroup: 'Service Group',
      serviceName: 'Service Name',
      price: '200 SAR',
      duration: '40 min',
    },
    {
      id: '4',
      image: PipsImage,
      type: 'Type',
      serviceGroup: 'Service Group',
      serviceName: 'Service Name',
      price: '200 SAR',
      duration: '40 min',
    },
    {
      id: '5',
      image: PipsImage,
      type: 'Type',
      serviceGroup: 'Service Group',
      serviceName: 'Service Name',
      price: '200 SAR',
      duration: '40 min',
    },
  ];

  const handleApplyFilters = filters => {
    console.log('Applied filters:', filters);
    // Apply filters to your services list
  };

  const handleConsultPress = () => {
    console.log('Consult now pressed');
    // Navigate to consultation screen
  };

  const handleFilterPress = () => {
    setFilterVisible(true);
  };

  const handleServicePress = service => {
    console.log('Service pressed:', service);
    // Navigate to service detail or booking screen
  };

  const handleChatPress = () => {
    console.log('Chat with Vena AI pressed');
    // Navigate to AI chat screen
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with background image and logo */}
        <ClinicHeader
          backgroundImage={clinicData.backgroundImage}
          logo={clinicData.logo}
          onBackPress={() => navigation.goBack()}
          onSharePress={() => console.log('Share pressed')}
          onNotificationPress={() => navigation.navigate('Notifications')}
          notificationCount={3}
        />

        {/* Clinic Information */}
        <ClinicInfo
          category={clinicData.category}
          name={clinicData.name}
          location={clinicData.location}
          distance={clinicData.distance}
          rating={clinicData.rating}
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
              placeholder="Search Services"
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
                  onPress={() => handleServicePress(service)}
                />
              ))}
            </View>
          </View>
        )}

        {activeTab === 'Reviews' && (
          <View style={styles.tabContent}>
            <Text style={styles.placeholderText}>Reviews content here</Text>
          </View>
        )}

        {activeTab === 'About' && (
          <View style={styles.tabContent}>
            <Text style={styles.placeholderText}>About content here</Text>
          </View>
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
      {/* <FilterBottomSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApplyFilters={handleApplyFilters}
      /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  servicesContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  servicesList: {
    marginTop: 16,
  },
  tabContent: {
    padding: 16,
    minHeight: 200,
  },
  placeholderText: {
    fontSize: 16,
    color: colors.secondaryText,
    textAlign: 'center',
    marginTop: 40,
  },
  chatButtonContainer: {
    backgroundColor: colors.white,
    padding: 20,
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
    width: '100%',
  },
  chatButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  chatButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ClinicDetailScreen;
