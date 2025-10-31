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
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import { ClinicProfile, PipsImage, RecommandImage } from '@assets/images';
import AboutClinic from '@components/molecules/AboutCard';

const ClinicDetailScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Services');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceDetailVisible, setServiceDetailVisible] = useState(false);
  const [expandedReviewId, setExpandedReviewId] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deviceDetailVisible, setDeviceDetailVisible] = useState(false);

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
      type: 'Dermatology',
      serviceGroup: 'Skin Rejuvenation',
      serviceName: 'HydraFacial Glow',
      price: '350 SAR',
      duration: '45 min',
      description:
        'A multi-step facial treatment that deeply cleanses, exfoliates, and hydrates the skin, leaving it refreshed and glowing.',
      procedure:
        'The procedure uses a patented device to cleanse and infuse serums into the skin for maximum hydration and brightness.',
    },
    {
      id: '2',
      image: PipsImage,
      type: 'Dentistry',
      serviceGroup: 'Teeth Whitening',
      serviceName: 'Laser Smile Brightening',
      price: '600 SAR',
      duration: '1 hr',
      description:
        'Advanced laser teeth whitening procedure designed to safely and effectively brighten your smile up to 8 shades.',
      procedure:
        'A hydrogen peroxide gel is applied and activated with laser light to remove deep-set stains.',
    },
    {
      id: '3',
      image: PipsImage,
      type: 'Aesthetic Medicine',
      serviceGroup: 'Injectables',
      serviceName: 'Botox for Forehead Lines',
      price: '450 SAR',
      duration: '30 min',
      description:
        'A non-surgical cosmetic treatment that relaxes facial muscles to reduce the appearance of fine lines and wrinkles.',
      procedure:
        'Small doses of botulinum toxin are injected into targeted muscles to temporarily relax them.',
    },
    {
      id: '4',
      image: PipsImage,
      type: 'Laser Treatment',
      serviceGroup: 'Hair Removal',
      serviceName: 'Full Body Laser Hair Removal',
      price: '950 SAR',
      duration: '90 min',
      description:
        'Long-term hair reduction treatment using advanced diode laser technology for smooth and hair-free skin.',
      procedure:
        'Laser energy targets hair follicles without damaging surrounding skin, preventing future hair growth.',
    },
    {
      id: '5',
      image: PipsImage,
      type: 'Wellness',
      serviceGroup: 'IV Therapy',
      serviceName: 'Vitamin Glow Drip',
      price: '400 SAR',
      duration: '45 min',
      description:
        'A nutrient-rich IV infusion designed to boost energy, improve hydration, and enhance overall wellness.',
      procedure:
        'An intravenous infusion delivers vitamins and antioxidants directly into your bloodstream for faster absorption.',
    },
  ];

  const reviews = [
    {
      id: '1',
      author: 'Sultana Khan',
      date: 'Oct 20, 2025',
      rating: 5,
      text: 'Amazing experience! The doctors were very professional and explained everything clearly. My skin feels much better after just one session!',
    },
    {
      id: '2',
      author: 'Ahmed Ali',
      date: 'Oct 18, 2025',
      rating: 4,
      text: 'Good service, but the waiting time was a bit long. Staff was friendly though.',
    },
    {
      id: '3',
      author: 'Fatima Noor',
      date: 'Oct 15, 2025',
      rating: 5,
      text: 'The HydraFacial was incredible! My face has never felt this fresh before. Highly recommended.',
    },
    {
      id: '4',
      author: 'Omar Saeed',
      date: 'Oct 12, 2025',
      rating: 3,
      text: 'The treatment worked, but I wish the clinic had better parking options.',
    },
    {
      id: '5',
      author: 'Hania Rizvi',
      date: 'Oct 8, 2025',
      rating: 5,
      text: 'Professional staff and top-quality equipment. The Botox procedure was quick and painless!',
    },
  ];

  const aboutData = {
    description:
      'At GlowCare Clinic, we believe that confidence begins with healthy skin and a beautiful smile. Our clinic specializes in dermatology, dentistry, and aesthetic care — combining advanced technology with expert medical guidance.\n' +
      'Our team of experienced doctors and skincare professionals focuses on providing personalized treatments tailored to each patient’s needs. Whether you’re looking for acne treatment, skin rejuvenation, or a brighter smile, we’re here to help you glow with confidence.',
    devices: [
      {
        id: '1',
        image: RecommandImage,
        title: 'Fractional CO₂ Laser',
        note: 'Used for skin resurfacing and scar reduction with minimal downtime.',
        badge: {
          1: 'Acne Scar Treatment',
          2: 'Wrinkle Reduction',
          3: 'Skin Tightening',
          4: 'Pigmentation Removal',
          5: 'Stretch Mark Fading',
        },
      },
      {
        id: '2',
        image: RecommandImage,
        title: 'Ultherapy Device',
        note: 'Non-invasive ultrasound lifting treatment for face and neck tightening.',
        badge: {
          1: 'Face Lifting',
          2: 'Jawline Definition',
          3: 'Skin Firming',
          4: 'Neck Contour Enhancement',
          5: 'Collagen Boost',
        },
      },
      {
        id: '3',
        image: RecommandImage,
        title: 'CoolSculpting Machine',
        note: 'Targets stubborn fat cells through controlled cooling without surgery.',
        badge: {
          1: 'Body Contouring',
          2: 'Fat Reduction',
          3: 'Tummy Sculpt',
          4: 'Thigh Slimming',
          5: 'Double Chin Removal',
        },
      },
      {
        id: '4',
        image: RecommandImage,
        title: 'PicoSure Laser',
        note: 'Advanced laser for pigmentation, tattoos, and skin texture improvement.',
        badge: {
          1: 'Tattoo Removal',
          2: 'Pigment Correction',
          3: 'Skin Brightening',
          4: 'Acne Mark Fading',
          5: 'Freckle Reduction',
        },
      },
      {
        id: '5',
        image: RecommandImage,
        title: 'Invisalign Scanner',
        note: 'Digital 3D scan for custom-made invisible dental aligners.',
        badge: {
          1: 'Teeth Alignment',
          2: 'Smile Correction',
          3: 'Jaw Adjustment',
          4: 'Gum Health Assessment',
          5: 'Digital Smile Preview',
        },
      },
    ],
  };

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
    setSelectedService(service);
    setServiceDetailVisible(true);
  };

  const handleChatPress = () => {
    console.log('Chat with Vena AI pressed');
    // Navigate to AI chat screen
  };
  const handleAddToCart = service => {
    console.log('Added to cart:', service);
    // Add to cart logic
    setServiceDetailVisible(false);
  };

  const handleCheckout = service => {
    console.log('Checkout:', service);
    // Navigate to checkout
    navigation.navigate('Checkout', { service });
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
  reviewsContent: {
    padding: 16,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 4,
  },
  sortText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  reviewsList: {
    gap: 12,
  },
  reviewCard: {
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  reviewDate: {
    fontSize: 13,
    color: colors.secondaryText,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 8,
  },
  reviewText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  readMore: {
    color: colors.primary,
    fontWeight: '500',
    marginTop: 4,
    fontSize: 14,
  },
  aboutContent: {
    padding: 16,
  },

  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.text,
    textAlign: 'left',
  },
  devicesScroll: {
    paddingRight: 16,
    gap: 12,
  },
});

export default ClinicDetailScreen;
