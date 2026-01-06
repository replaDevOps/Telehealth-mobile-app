import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { AudioSvg, ChatSvg, VedioSvg } from '@assets/icons';
import { CustomDropdown } from '@components/common/CustomDropdwon';
import { colors } from '../../styles/colors';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { CustomButton } from '@components/common/CustomButton';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { apiClient } from '@services/api/api-client';
import { API } from '@services/api/api-endpoint';
import { Toast } from 'toastify-react-native';

type RootStackParamList = {
  ConsultationPayment: {
    consultationType: string;
    consultationTypeId: 'chat' | 'audio' | 'video';
    duration: string;
    price: string;
    serviceType: string;
    serviceGroup: string;
    service: string;
    doctors?: any; // Optional doctors data from API
    consultationPrice?: number; // Consultation price from API
    servicePrice?: number; // Service price from API
    serviceID?: number; // Service ID from API
    message?: string; // Message from API (e.g., "2 doctors are available for this consultation")
  };
};

interface ServiceType {
  id: string | number;
  name: string;
}

interface ServiceGroup {
  id: string | number;
  name: string;
}

interface Service {
  id: string | number;
  name: string;
}

interface ConsultationTypesData {
  id: number;
  chatConsultation: boolean;
  chatConsultationPrice: string;
  videoConsultation: boolean;
  videoConsultationPrice: string;
  voiceConsultation: boolean;
  voiceConsultationPrice: string;
}

interface ConsultationTypeCard {
  id: 'chat' | 'video' | 'voice';
  name: string;
  price: string;
  Icon: any;
}

export default function ConsultDoctorBottomSheet({
  visible,
  onClose,
  clinicID,
  hasAudioPermission = false,
  hasVideoPermission = false,
}: {
  visible: boolean;
  onClose: () => void;
  clinicID?: number | string;
  hasAudioPermission?: boolean;
  hasVideoPermission?: boolean;
}) {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [isLoading, setIsLoading] = useState(false);

  // Dropdown states
  const [serviceType, setServiceType] = useState('');
  const [serviceGroup, setServiceGroup] = useState('');
  const [service, setService] = useState('');
  const [selectedConsultation, setSelectedConsultation] = useState<string>('');

  // API data states
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [serviceGroups, setServiceGroups] = useState<ServiceGroup[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [consultationTypeCards, setConsultationTypeCards] = useState<ConsultationTypeCard[]>([]);

  // Loading states
  const [loadingServiceTypes, setLoadingServiceTypes] = useState(false);
  const [loadingServiceGroups, setLoadingServiceGroups] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingConsultationTypes, setLoadingConsultationTypes] = useState(false);

  // Map consultation types data to cards
  const mapConsultationTypesToCards = (data: ConsultationTypesData | null): ConsultationTypeCard[] => {
    if (!data) return [];

    const cards: ConsultationTypeCard[] = [];

    if (data.chatConsultation) {
      cards.push({
        id: 'chat',
        name: t('chat_consultation'),
        price: `${data.chatConsultationPrice} SAR`,
      Icon: ChatSvg,
      });
    }

    if (data.videoConsultation) {
      cards.push({
        id: 'video',
        name: t('video_consultation'),
        price: `${data.videoConsultationPrice} SAR`,
        Icon: VedioSvg,
      });
    }

    if (data.voiceConsultation) {
      cards.push({
        id: 'voice',
        name: t('audio_consultation'),
        price: `${data.voiceConsultationPrice} SAR`,
      Icon: AudioSvg,
      });
    }

    return cards;
  };

  // Fetch service types
  const fetchServiceTypes = async () => {
    if (!clinicID) return;

    setLoadingServiceTypes(true);
    try {
      const response = await apiClient.get(API.CONSULTATIONS.GET_SERVICE_TYPES, {
        params: { clinicID },
      });

      const data = response.data?.data || response.data || [];
      setServiceTypes(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error fetching service types:', error);
      Toast.error(error?.message || 'Failed to load service types');
    } finally {
      setLoadingServiceTypes(false);
    }
  };

  // Fetch service groups
  const fetchServiceGroups = async (selectedServiceType: string) => {
    if (!clinicID || !selectedServiceType) {
      setServiceGroups([]);
      setService('');
      setServices([]);
      return;
    }

    setLoadingServiceGroups(true);
    try {
      const response = await apiClient.get(API.CONSULTATIONS.GET_GROUPS, {
        params: { clinicID, serviceType: selectedServiceType },
      });

      const data = response.data?.data || response.data || [];
      setServiceGroups(Array.isArray(data) ? data : []);
      // Reset dependent dropdowns
      setService('');
      setServices([]);
    } catch (error: any) {
      console.error('Error fetching service groups:', error);
      Toast.error(error?.message || 'Failed to load service groups');
      setServiceGroups([]);
    } finally {
      setLoadingServiceGroups(false);
    }
  };

  // Fetch services
  const fetchServices = async (selectedGroupID: string | number) => {
    if (!clinicID || !selectedGroupID) {
      setServices([]);
      setService('');
      return;
    }

    setLoadingServices(true);
    try {
      const response = await apiClient.get(API.CONSULTATIONS.GET_SERVICES, {
        params: { clinicID, groupID: selectedGroupID },
      });

      const data = response.data?.data || response.data || [];
      setServices(Array.isArray(data) ? data : []);
      setService('');
    } catch (error: any) {
      console.error('Error fetching services:', error);
      Toast.error(error?.message || 'Failed to load services');
      setServices([]);
    } finally {
      setLoadingServices(false);
    }
  };

  // Fetch consultation types
  const fetchConsultationTypes = async () => {
    if (!clinicID) return;

    setLoadingConsultationTypes(true);
    try {
      const response = await apiClient.get(API.CONSULTATIONS.GET_CONSULTATION_TYPES, {
        params: { clinicID },
      });
      console.log('Consultation types response:', response.data);

      const data = response.data?.data || response.data;
      if (data) {
        const cards = mapConsultationTypesToCards(data);
        setConsultationTypeCards(cards);
        // Auto-select first consultation type if available
        if (cards.length > 0 && !selectedConsultation) {
          setSelectedConsultation(cards[0].id);
        }
      } else {
        setConsultationTypeCards([]);
      }
    } catch (error: any) {
      console.error('Error fetching consultation types:', error);
      Toast.error(error?.message || 'Failed to load consultation types');
      setConsultationTypeCards([]);
    } finally {
      setLoadingConsultationTypes(false);
    }
  };

  // Fetch data when bottom sheet opens
  useEffect(() => {
    if (visible && clinicID) {
      fetchServiceTypes();
      fetchConsultationTypes();
      // Reset selections
      setServiceType('');
      setServiceGroup('');
      setService('');
      setSelectedConsultation('');
    }
  }, [visible, clinicID]);

  // Fetch groups when service type changes
  useEffect(() => {
    if (serviceType) {
      fetchServiceGroups(serviceType);
    } else {
      setServiceGroups([]);
      setService('');
      setServices([]);
    }
  }, [serviceType]);

  // Fetch services when group changes
  useEffect(() => {
    if (serviceGroup) {
      // Find the group ID from the selected value
      const selectedGroup = serviceGroups.find(
        g => String(g.id) === serviceGroup || g.name === serviceGroup
      );
      if (selectedGroup) {
        fetchServices(selectedGroup.id);
      }
    } else {
      setServices([]);
      setService('');
    }
  }, [serviceGroup]);

  // Convert API data to dropdown format
  const serviceTypeOptions = serviceTypes.map(item => ({
    label: item.name || String(item.id),
    value: item.name || String(item.id),
  }));

  const serviceGroupOptions = serviceGroups.map(item => ({
    label: item.name || String(item.id),
    value: String(item.id),
  }));

  const serviceOptions = services.map(item => ({
    label: item.name || String(item.id),
    value: String(item.id),
  }));

  const handleFindDoctor = async () => {
    // Validate required fields
    if (!selectedConsultation) {
      Toast.error('Please select a consultation type');
      return;
    }

    if (!service) {
      Toast.error('Please select a service');
      return;
    }

    if (!serviceGroup) {
      Toast.error('Please select a service group');
      return;
    }

    if (!serviceType) {
      Toast.error('Please select a service type');
      return;
    }

    const selectedCard = consultationTypeCards.find(
      card => card.id === selectedConsultation
    );

    if (!selectedCard) {
      Toast.error('Please select a consultation type');
      return;
    }

    // Get the selected service ID
    const selectedService = services.find(s => String(s.id) === service);
    if (!selectedService) {
      Toast.error('Invalid service selected');
      return;
    }

    // Get the selected group ID
    const selectedGroup = serviceGroups.find(g => String(g.id) === serviceGroup);
    if (!selectedGroup) {
      Toast.error('Invalid service group selected');
      return;
    }

    // Map consultation type to API format (Chat, Video, Voice)
    const consultationTypeMap: Record<string, string> = {
      chat: 'Chat',
      video: 'Video',
      voice: 'Audio',
    };
    const consultationType = consultationTypeMap[selectedCard.id] || 'Chat';

    // Show loading state
    setIsLoading(true);

    try {
      // Prepare payload
      const payload = {
        serviceID: Number(selectedService.id),
        type: consultationType,
        groupID: Number(selectedGroup.id),
        serviceType: serviceType,
      };

      console.log('Finding doctors with payload:', payload);

      // Call findDoctors API
      const response = await apiClient.post(API.CONSULTATIONS.FIND_DOCTORS, payload);
      console.log('Find doctors response:', response.data);
      // Check for success: false in response
      if (response.data?.success === false) {
        const errorMessage = response.data?.message || 'Failed to find doctors';
        Toast.error(errorMessage);
        setIsLoading(false);
        return;
      }

      // Success - navigate to ConsultationPayment with response data
      // Handle both nested and flat response structures
      const apiData = response.data?.data || response.data;
      console.log('Extracted API data:', apiData);
      setIsLoading(false);
      
      // Map API response to navigation params
      // API response structure:
      // {
      //   consultationPrice: 100,
      //   consultationType: "Chat",
      //   duration: 76,
      //   message: "2 doctors are available for this consultation",
      //   serviceGroup: "Dedodeodldoe",
      //   serviceID: 13,
      //   serviceName: "lays service updated",
      //   servicePrice: 234,
      //   serviceType: "Dermatology",
      //   totalPrice: 334
      // }
      
      // Map consultation type from API to consultationTypeId
      const consultationTypeMap: Record<string, 'chat' | 'audio' | 'video'> = {
        'Chat': 'chat',
        'Video': 'video',
        'Voice': 'audio',
      };
      
      const consultationTypeId = consultationTypeMap[apiData?.consultationType] || 
        (selectedCard.id === 'voice' ? 'audio' : selectedCard.id);
      
      // Format duration (convert number to string with "min")
      const duration = apiData?.duration 
        ? `${apiData.duration} min` 
        : '30 min';
      
      // Format total price (from API) - this is the final price to pay
      const totalPrice = apiData?.totalPrice 
        ? `${apiData.totalPrice} SAR` 
        : apiData?.consultationPrice 
        ? `${apiData.consultationPrice} SAR`
        : selectedCard.price;
      
      // Prepare navigation params with proper mapping
      const navigationParams = {
        consultationType: apiData?.consultationType || selectedCard.name,
        consultationTypeId: consultationTypeId,
        duration: duration,
        price: totalPrice, // Use totalPrice from API
        serviceType: apiData?.serviceType || serviceType,
        serviceGroup: apiData?.serviceGroup || selectedGroup.name || serviceGroup,
        service: apiData?.serviceName || selectedService.name || service,
        message: apiData?.message, // Message from API (e.g., "2 doctors are available for this consultation")
        doctors: apiData, // Pass full API response data
        // Additional API data for reference
        consultationPrice: apiData?.consultationPrice,
        servicePrice: apiData?.servicePrice,
        serviceID: apiData?.serviceID,
      };
      
      console.log('Navigation params:', navigationParams);
      
      navigation.navigate('ConsultationPayment', navigationParams);
      onClose();
    } catch (error: any) {
      console.error('Error finding doctors:', error);
      const errorMessage = 
        error?.response?.data?.message || 
        error?.data?.message ||
        error?.message || 
        'Failed to find doctors';
      Toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Full Screen Loading Modal */}
      <Modal
        visible={isLoading}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.white} />
        </View>
      </Modal>

      {/* Main Bottom Sheet Modal */}
      <Modal
        visible={visible && !isLoading}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.overlayTouchable}
            activeOpacity={1}
            onPress={onClose}
          />
          <View style={styles.bottomSheet}>
            <View style={styles.handleBar} />
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeIcon}>×</Text>
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.header}>
                <Text style={styles.title}>{t('consult_with_a_doctor')}</Text>
                <Text style={styles.subtitle}>
                  {t('choose_how_to_connect')}
                </Text>
              </View>

              {/* Service Type Dropdown - Only show if data is available */}
              {loadingServiceTypes ? (
                <View style={styles.dropdownContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              ) : serviceTypeOptions.length > 0 ? (
                <View style={styles.dropdownContainer}>
                  <CustomDropdown
                    label={t('service_type')}
                    value={serviceType}
                    onValueChange={setServiceType}
                    options={serviceTypeOptions}
                    placeholder={t('select_type')}
                  />
                </View>
              ) : null}

              {/* Service Group Dropdown - Only show if service type is selected and data is available */}
              {serviceType && (
                loadingServiceGroups ? (
                  <View style={styles.dropdownContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                  </View>
                ) : serviceGroupOptions.length > 0 ? (
                  <View style={styles.dropdownContainer}>
                    <CustomDropdown
                      label={t('service_group')}
                      value={serviceGroup}
                      onValueChange={setServiceGroup}
                      options={serviceGroupOptions}
                      placeholder={t('select_group')}
                    />
                  </View>
                ) : null
              )}

              {/* Service Dropdown - Only show if service group is selected and data is available */}
              {serviceGroup && (
                loadingServices ? (
                  <View style={styles.dropdownContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                  </View>
                ) : serviceOptions.length > 0 ? (
                  <View style={styles.dropdownContainer}>
                    <CustomDropdown
                      label={t('service')}
                      value={service}
                      onValueChange={setService}
                      options={serviceOptions}
                      placeholder={t('select_service')}
                    />
                  </View>
                ) : null
              )}

              {/* Consultation Type */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('consultation_type')}</Text>
                {loadingConsultationTypes ? (
                  <ActivityIndicator size="small" color={colors.primary} style={styles.loadingIndicator} />
                ) : consultationTypeCards.length === 0 ? (
                  <Text style={styles.emptyText}>
                    {t('no_consultation_types_found') || 'No consultation types available'}
                  </Text>
                ) : (
                  consultationTypeCards.map(card => {
                    const isSelected = selectedConsultation === card.id;
                    const Icon = card.Icon;
                    
                    // Disable audio/video options if permissions not granted
                    const isDisabled = 
                      (card.id === 'voice' && !hasAudioPermission) ||
                      (card.id === 'video' && !hasVideoPermission);

                  return (
                    <TouchableOpacity
                        key={card.id}
                      style={[
                        styles.consultationCard,
                        isSelected && styles.consultationCardSelected,
                        isDisabled && styles.consultationCardDisabled,
                      ]}
                      onPress={() => {
                        if (isDisabled) {
                          Toast.error(
                            card.id === 'voice'
                              ? t('microphone_permission_required') || 'Microphone permission required for audio consultation'
                              : t('camera_microphone_permission_required') || 'Camera and microphone permissions required for video consultation'
                          );
                        } else {
                          setSelectedConsultation(card.id);
                        }
                      }}
                      disabled={isDisabled}
                    >
                      <View style={styles.consultationLeft}>
                        <View style={[styles.iconContainer, isDisabled && styles.iconContainerDisabled]}>
                          <Icon width={24} height={24} />
                        </View>

                        <View style={styles.consultationInfo}>
                          <Text style={[styles.consultationTitle, isDisabled && styles.consultationTitleDisabled]}>
                              {card.name}
                          </Text>
                          <View style={styles.durationContainer}>
                            <Ionicons name="time-outline" size={20} color={isDisabled ? '#ccc' : colors.text} />
                              <Text style={[styles.duration, isDisabled && styles.durationDisabled]}>
                                30 min
                              </Text>
                          </View>
                        </View>
                      </View>

                      <Text style={[styles.consultationPrice, isDisabled && styles.consultationPriceDisabled]}>
                          {card.price}
                      </Text>
                    </TouchableOpacity>
                  );
                  })
                )}
              </View>

              <CustomButton
                onPress={handleFindDoctor}
                title={isLoading ? t('finding') : t('find_doctor')}
                disabled={isLoading || !selectedConsultation}
              />

              <View style={styles.bottomSpacing} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1 },
  overlayTouchable: { flex: 1 },
  bottomSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: '90%',
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeIcon: { fontSize: 25, color: colors.text, fontWeight: '300' },
  header: { alignItems: 'center', marginTop: 8, marginBottom: 24 },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: { fontSize: 14, color: colors.secondaryText },
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  dropdownContainer: {
    marginBottom: 20,
  },
  loadingIndicator: {
    marginVertical: 10,
  },
  emptyText: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
    paddingVertical: 20,
  },
  consultationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.gray,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  consultationCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#f5f3ff',
  },
  consultationLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: {
    width: 44,
    height: 44,
    backgroundColor: colors.white,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  consultationInfo: { flex: 1 },
  consultationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  durationContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  clockIcon: { fontSize: 11 },
  duration: { fontSize: 12, color: colors.secondaryText },
  consultationPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  // Disabled styles
  consultationCardDisabled: {
    opacity: 0.5,
    backgroundColor: '#f5f5f5',
  },
  iconContainerDisabled: {
    opacity: 0.5,
  },
  consultationTitleDisabled: {
    color: '#999',
  },
  durationDisabled: {
    color: '#ccc',
  },
  consultationPriceDisabled: {
    color: '#999',
  },
  bottomSpacing: { height: 20 },
  loadingOverlay: {
    flex: 1,
    backgroundColor: '#15002E80',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
