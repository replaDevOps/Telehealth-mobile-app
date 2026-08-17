import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { AudioSvg, ChatSvg, VedioSvg } from '@assets/icons';
import { CustomDropdown } from '@components/common/CustomDropdwon';
import { colors } from '../../styles/colors';
import { useNavigation } from '@react-navigation/native';
import { CustomButton } from '@components/common/CustomButton';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { Toast } from 'toastify-react-native';
import { checkProfile } from '@utils/checkProfile';
import { formatCurrency, getMappedErrorMessage } from '@utils';
import { apiClient } from '@services/api/api-client';
import { API } from '@services/api/api-endpoint';
import useAuthStore from '@store/useAuthStore';
import { navigateToProfileSetting } from '@navigation/navigation-service';
import { SheetToast } from './SheetToast';

// navigation typing is intentionally kept loose here because this component
// needs to navigate across nested navigators (tabs -> setting stack).

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

/**
 * Android has no `onDismiss` on Modal, so the pending navigation is flushed on
 * a timer there instead. iOS drives it off the real dismiss callback.
 */
const SHEET_DISMISS_MS = 400;

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
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [isLoading, setIsLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(false);
  // Every message this sheet raises - validation, load failures, API errors.
  // Rendered by SheetToast rather than the app's ToastManager; see
  // handleFindDoctor for why.
  const [sheetError, setSheetError] = useState('');

  // Work that must not run until this Modal's native window is really gone.
  //
  // Two iOS problems, one cause. Pushing a native-stack screen while the modal
  // window is still up strands that window above the app, where it swallows
  // every touch - the pushed screen renders but nothing is tappable. And a
  // toast fired from in here is drawn *behind* the sheet, because toasts
  // render inline in the React root (ToastManager useModal={false}) and zIndex
  // cannot lift a view across native windows.
  //
  // One queue serves every destination. Flushing nulls the ref first, so a
  // double flush is a no-op.
  const pendingActionRef = useRef<(() => void) | null>(null);

  const flushPendingNavigation = useCallback(() => {
    const action = pendingActionRef.current;
    if (!action) return;
    pendingActionRef.current = null;
    action();
  }, []);

  /** Closes the sheet, then runs `action` once it is off screen. */
  const closeThen = useCallback(
    (action: () => void) => {
      pendingActionRef.current = action;
      onClose();
      if (Platform.OS !== 'ios') {
        setTimeout(flushPendingNavigation, SHEET_DISMISS_MS);
      }
    },
    [onClose, flushPendingNavigation],
  );

  const signedOut = !useAuthStore(state => state.auth?.token);

  // Sends the guest to sign in once the sheet is gone. Returns true when it
  // took over, so the caller stops.
  const gateGuest = useCallback((): boolean => {
    if (!signedOut) return false;
    closeThen(() => navigation.navigate('Auth' as never, { screen: 'SignIn' } as never));
    return true;
  }, [signedOut, closeThen, navigation]);

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
        price: formatCurrency(data.chatConsultationPrice, isArabic),
        Icon: ChatSvg,
      });
    }



    // if (data.voiceConsultation) {
    //   cards.push({
    //     id: 'voice',
    //     name: t('audio_consultation'),
    //     price: `${data.voiceConsultationPrice} SAR`,
    //   Icon: AudioSvg,
    //   });
    // }

    //  if (data.videoConsultation) {
    //   cards.push({
    //     id: 'video',
    //     name: t('video_consultation'),
    //     price: `${data.videoConsultationPrice} SAR`,
    //     Icon: VedioSvg,
    //   });
    // }

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
      setSheetError(error?.message || 'Failed to load service types');
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
      setSheetError(error?.message || 'Failed to load service groups');
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
      setSheetError(error?.message || 'Failed to load services');
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
      setSheetError(error?.message || 'Failed to load consultation types');
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

  // Any change to the selections clears the message, so it never lingers after
  // the user has already fixed what it was complaining about.
  useEffect(() => {
    setSheetError('');
  }, [serviceType, serviceGroup, service, selectedConsultation]);

  const handleFindDoctor = async () => {
    // Validation reports inline rather than through Toast.
    //
    // Toasts render inline in the React root (ToastManager useModal={false},
    // which is what stopped them freezing the app). This sheet is a native
    // Modal - a separate window above that root - and zIndex cannot lift a
    // view across native windows, so on iOS every one of these messages was
    // drawn underneath the sheet and the user saw nothing at all.
    setSheetError('');

    if (!selectedConsultation) {
      setSheetError(t('please_select_consultation_type') || 'Please select a consultation type');
      return;
    }

    if (!service) {
      setSheetError(t('please_select_service') || 'Please select a service');
      return;
    }

    if (!serviceGroup) {
      setSheetError(t('please_select_service_group') || 'Please select a service group');
      return;
    }

    if (!serviceType) {
      setSheetError(t('please_select_service_type') || 'Please select a service type');
      return;
    }

    const selectedCard = consultationTypeCards.find(
      card => card.id === selectedConsultation
    );

    if (!selectedCard) {
      setSheetError(t('please_select_consultation_type') || 'Please select a consultation type');
      return;
    }

    // Get the selected service ID
    const selectedService = services.find(s => String(s.id) === service);
    if (!selectedService) {
      setSheetError(t('please_select_service') || 'Invalid service selected');
      return;
    }

    // Get the selected group ID
    const selectedGroup = serviceGroups.find(g => String(g.id) === serviceGroup);
    if (!selectedGroup) {
      setSheetError(t('please_select_service_group') || 'Invalid service group selected');
      return;
    }

    // Map consultation type to API format (Chat, Video, Voice)
    const consultationTypeMap: Record<string, string> = {
      chat: 'Chat',
      video: 'Video',
      voice: 'Audio',
    };
    const consultationType = consultationTypeMap[selectedCard.id] || 'Chat';

    // Backstop for the guest case. ClinicDetail gates before opening this
    // sheet, so reaching here signed out means the session expired mid-flow.
    // Must come before checkProfile, which hits an authenticated endpoint and
    // would answer a guest with the backend's "Unauthenticated" toast and a
    // push to ProfileSetting.
    if (gateGuest()) return;

    // Before searching for doctors, ensure profile is complete
    try {
      setCheckingProfile(true);
      const result = await checkProfile();
      console.log('Check profile result:', result);
      if (!result.ok) {
        const msg = result.message || t('please_complete_profile') || 'Please complete your profile before finding customer support';
        // Deferred past dismissal: the toast would render behind this sheet on
        // iOS, and navigating with the window still up strands it above the app.
        closeThen(() => {
          Toast.error(msg);
          navigateToProfileSetting();
        });
        return;
      }
    } catch (e) {
      console.warn('checkProfile helper failed:', e);
    } finally {
      setCheckingProfile(false);
    }

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

      console.log('Finding customer support with payload:', payload);

      // Call findDoctors API
      const response = await apiClient.post(API.CONSULTATIONS.FIND_DOCTORS, payload);
      console.log('Find customer support response:', response.data);
      // Check for success: false in response
      if (response.data?.success === false) {
        const errorMessage = response.data?.message || 'Failed to find customer support';
        setSheetError(getMappedErrorMessage(errorMessage));
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
        ? formatCurrency(apiData.consultationPrice, isArabic)
        : apiData?.consultationPrice
          ? formatCurrency(apiData.consultationPrice, isArabic)
          : formatCurrency(selectedCard.price, isArabic);

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
        // `doctors: apiData` used to pass the whole findDoctors response
        // through navigation params. React Navigation keeps params in its
        // serializable navigation state, and pushing a large nested object in
        // there froze the JS thread - the screen rendered but no handler on
        // any screen ever ran again, so the whole app stopped responding to
        // touches. Only primitives the destination actually reads are passed
        // now; `message` above already carries the availability text.
        consultationPrice: apiData?.consultationPrice,
        servicePrice: apiData?.servicePrice,
        serviceID: apiData?.serviceID,
      };

      console.log('Navigation params:', navigationParams);

      // Queue the push and close the sheet. The navigate itself runs from the
      // Modal's onDismiss (iOS) once the native window is really gone; Android
      // has no onDismiss, so it falls back to the timer.
      closeThen(() =>
        navigation.navigate('ConsultationPayment' as never, navigationParams as never),
      );
    } catch (error: any) {
      console.error('Error finding doctors:', error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.data?.message ||
        error?.message ||
        'Failed to find doctors';
      setSheetError(getMappedErrorMessage(errorMessage));
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Exactly ONE native Modal may exist in this flow. The loading state
          used to be a second <Modal>, which meant setIsLoading(true) dismissed
          this sheet and presented that one in the same commit. On iOS,
          presenting a modal while another is dismissing strands a UIWindow
          above the app that eats every touch - that was the unresponsive
          ConsultationPayment screen. The spinner is now an overlay INSIDE this
          modal, so nothing is ever presented and dismissed at once. */}
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
        onDismiss={flushPendingNavigation}
      >
        <View style={styles.overlay}>
          {/* Looks and behaves like the app toast, but lives in this Modal's
              window so it is actually visible. See SheetToast. */}
          <SheetToast
            message={sheetError}
            onHide={() => setSheetError('')}
          />

          <TouchableOpacity
            style={styles.overlayTouchable}
            activeOpacity={1}
            onPress={onClose}
          />
          <View style={styles.bottomSheet}>
            <View style={styles.handleBar} />
            <TouchableOpacity style={styles.closeButton} onPress={onClose} hitSlop={{ top: 4, bottom: 4, left: 8, right: 8 }}>
              <Ionicons name="close" size={20} color={colors.text} />
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.header}>
                <Text style={styles.title}>{t('consult_with_support')}</Text>
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
                            setSheetError(
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

                        {/* <Text style={[styles.consultationPrice, isDisabled && styles.consultationPriceDisabled]}>
                          {card.price}
                        </Text> */}
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>

              <CustomButton
                onPress={handleFindDoctor}
                title={(isLoading || checkingProfile) ? t('searching_for_support') : t('find_support')}
                loading={isLoading || checkingProfile}
                disabled={isLoading || checkingProfile || !selectedConsultation}
              />

              <View style={styles.bottomSpacing} />
            </ScrollView>
          </View>

          {(isLoading || checkingProfile) && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.white} />
            </View>
          )}
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: { alignItems: 'center', marginTop: 14, marginBottom: 24, paddingHorizontal: 8 },
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
    marginBottom: 5,
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#15002E80',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
