import {
  View,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header2 } from '@components/common/Header2';
import ClinicAvatar from '@components/common/ClinicAvatar';
import { useRoute, useNavigation, CommonActions, StackActions } from '@react-navigation/native';
import { styles } from './style';
import { colors } from '../../../styles/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CustomButton } from '@components/common/CustomButton';
import { SuccessMessageModal } from '@components/molecules';
import { useTranslation } from 'react-i18next';
import { apiClient } from '@services/api/api-client';
import { API } from '@services/api/api-endpoint';
import { Toast } from 'toastify-react-native';

export function RefundRequest() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const navigation = useNavigation<any>();
  const params = route.params as any;

  const [reason, setReason] = useState('');
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const toggleService = (serviceId: number) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId],
    );
  };
  const handleVisit = () => {
    const businessInfo = (params && params.businessInfo) || {};
    const clinicId = businessInfo.clinicID || businessInfo.id || undefined;

    navigation.navigate('ClinicDetail', {
      clinic: {
        id: clinicId || params.clinicID || params.clinicID || `clinic_${Date.now()}`,
        name: params.clinicName || businessInfo.businessName || '',
        location: params.clinicLocation || businessInfo.address || '',
        image: params.image || undefined,
        specialty: businessInfo.specialization || 'General',
        rating: businessInfo.rating || 0,
      },
      clinicID: clinicId, // also pass clinicID separately when available
    });
  };

  const handleSubmit = async () => {
    if (selectedServices.length === 0) {
      Alert.alert(t('error') || 'Error', t('select_at_least_one_service') || 'Please select at least one service');
      return;
    }
    if (!reason.trim()) {
      Alert.alert(t('error') || 'Error', t('provide_reason_for_refund') || 'Please provide a reason for refund');
      return;
    }

    setSubmitting(true);
    try {
      // Get appointmentServiceIDs from selected services
      // For appointments, we need to use appointmentServiceID (the ID from appointment_services array)
      // This is the ID that the cancellation API expects
      const appointmentServiceIDs = params.services
        ?.filter((s: any) => selectedServices.includes(s.id))
        .map((s: any) => {
          // Priority: appointmentServiceID > serviceID > id
          return s.appointmentServiceID || s.serviceID || s.id;
        })
        .filter((id: any) => id !== undefined && id !== null) || [];

      if (appointmentServiceIDs.length === 0) {
        Alert.alert(t('error') || 'Error', t('select_at_least_one_service') || 'Please select at least one service');
        setSubmitting(false);
        return;
      }

      console.log('Submitting refund request with appointmentServiceIDs:', appointmentServiceIDs);
      console.log('Business info:', params.businessInfo);
      console.log('Appointment ID:', params.appointmentID);

      const response = await apiClient.post(API.REFUND.SEND_REFUND_REQUEST, {
        appointmentServiceIDs: appointmentServiceIDs,
        reason: reason.trim(),
      });
      console.log("🚀 ~ handleSubmit ~ response:", response);

      // API response structure: { data: { status: true, message: "..." } }
      const responseData = response.data?.data || response.data;

      if (responseData?.status === true) {
        console.log('Refund request submitted successfully:', responseData);
        // Set success message from API response
        setSuccessMessage( t('refund_request_sent_successfully') || 'Refund request sent successfully');
        setShowSuccessModal(true);
      } else {
        throw new Error(responseData?.message || response.data?.message || t('failed_to_submit_refund') || 'Failed to submit refund request');
      }
    } catch (error: any) {
      console.error('Error submitting refund request:', error);
      Toast.error(error?.response?.data?.message || error?.message || t('failed_to_submit_refund') || 'Failed to submit refund request');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: any): string => {
    const str = String(price ?? '').trim();
    if (!str) return 'SAR 0.00';
    if (/^SAR\s/i.test(str)) return str;
    const num = parseFloat(str.replace(/[^0-9.-]+/g, ''));
    return isNaN(num) ? `SAR ${str}` : `SAR ${num.toFixed(2)}`;
  };

  const totalRefund =
    params.services
      ?.filter((s: any) => selectedServices.includes(s.id))
      .reduce(
        (sum: number, s: any) =>
          sum + parseFloat(s.price.replace(/[^0-9.-]+/g, '')),
        0,
      )
      .toFixed(2) || '0.00';

  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <StatusBar barStyle="dark-content" />
        <Header2 title={t('refund_request') } />

        {/* Fixed Clinic Info */}
        <View style={styles.clinicInfo}>
          <View style={styles.clinicLeft}>
            {params.image ? (
              <Image
                source={params.image}
                style={styles.clinicImage}
                resizeMode="cover"
              />
            ) : (
              <ClinicAvatar name={params.clinicName} size={56} style={styles.clinicImage} />
            )}
            <View>
              <Text style={styles.clinicName}>{params.clinicName}</Text>
              <Text style={styles.clinicLocation}>
                {params.clinicLocation}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={{
              ...styles.consultButton,
              backgroundColor: (params && (params.appointmentID || params.businessInfo)) ? colors.gray : colors.black,
            }}
            onPress={handleVisit}
          >
            <Text
              style={{
                ...styles.consultButtonText,
                color: (params && (params.appointmentID || params.businessInfo)) ? colors.text : colors.white,
              }}
            >
              {t('visit')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          // contentInsetAdjustmentBehavior="automatic"
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140 }}
        >
          <View style={styles.mainSection}>
            <Text style={{ fontWeight: '600', marginBottom: 12 }}>
              {t('select_services_for_refund')}
            </Text>

            {params.services?.map((service: any) => {
              const isChecked = selectedServices.includes(service.id);
              const refundState = service.refundState || '';
              // determine disabled: explicit flag, any refund-* field/sub-status present, or booked — all should be non-selectable
              const svcStatusStr = (service.status || '').toString();
              const svcRefundStatusStr = (service.refundStatus || service.refund_status || '').toString();
              console.log(svcRefundStatusStr);
              // Disable only when service is Booked or refundStatus is explicitly Pending / Confirm.
              const refundStatusNormalized = (svcRefundStatusStr || '').trim().toLowerCase();
              const isRefundStatusDisabled = /^(pending|confirm|confirmed|rejected|reject)$/i.test(refundStatusNormalized);
              console.log(service)

              // const isBooked = /booked/i.test(svcStatusStr);
              // keep explicit `processed` check for fully processed refunds
              const isRejected = /reject/i.test(svcStatusStr) || /reject/i.test(svcRefundStatusStr);
              const isDisabled = !!service.disabled || isRefundStatusDisabled || isRejected || refundState === 'processed';
              console.log(`Service ID ${service.id} - Disabled: ${isDisabled} (refundStatus: ${svcRefundStatusStr}, status: ${svcStatusStr}, refundState: ${refundState})`);
              return (
                <View key={service.id} style={[styles.serviceCard, isDisabled ? { opacity: 0.6 } : {}]}>
                  <View style={styles.serviceLeft}>
                    {service.image ? (
                      <Image source={service.image} style={styles.serviceImage} />
                    ) : (
                      <ClinicAvatar name={service.name} size={56} style={styles.serviceImage as any} />
                    )}
                    <View style={styles.serviceInfo}>
                      <View style={styles.serviceBadges}>
                        <View style={styles.categoryBadge}>
                          <Text style={styles.categoryBadgeText} numberOfLines={1} ellipsizeMode="tail">
                            {service.category}
                          </Text>
                        </View>
                        <View style={styles.nameBadge}>
                          <Text style={styles.nameBadgeText} numberOfLines={1} ellipsizeMode="tail">
                            {service.categoryBadge}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.serviceName} numberOfLines={1} ellipsizeMode="tail">{service.name}</Text>
                      <View style={styles.durationContainer}>
                        <Ionicons
                          name="time-outline"
                          size={18}
                          color={colors.secondaryText}
                        />
                        <Text style={styles.duration}>{service.duration}</Text>
                      </View>

                      {/* status moved to the right column for clearer layout */}
                    </View>
                  </View>

                  <View style={styles.serviceRight}>
                    <TouchableOpacity
                      onPress={() => !isDisabled && toggleService(service.id)}
                      disabled={isDisabled}
                      style={[styles.checkbox, isChecked && styles.checkboxChecked]}
                    >
                      {isChecked && (
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      )}
                    </TouchableOpacity>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.servicePrice}>{formatPrice(service.price)}</Text>
                      {/* show refundStatus when status indicates a refund otherwise show status */}
                      {(() => {
                        const isRefund = typeof (service.status || '') === 'string' && /refund/i.test(service.status || '');
                        const displayStatus = isRefund ? (service.status + " " + service.refundStatus) : service.status;
                        return displayStatus ? (
                          <Text style={{ fontSize: 12, color: '#112244', marginTop: 6 }} numberOfLines={2}>
                            {displayStatus}
                          </Text>
                        ) : null;
                      })()}
                    
                    </View>
                  </View>
                </View>
              );
            })}

            {/* Reason Input */}
            <View style={styles.resonSection}>
              <Text style={styles.feedbackLabel}>{t('reason_for_refund')}</Text>
              <View style={styles.textInputContainer}>
                <TextInput
                  placeholder={t('provide_valid_reason_for_refund')}
                  placeholderTextColor="#999"
                  multiline
                  maxLength={300}
                  value={reason}
                  onChangeText={setReason}
                  style={[styles.textInput, { height: 120 }]}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Total Refund */}
            {selectedServices.length > 0 && (
              <View
                style={{
                  padding: 16,
                  backgroundColor: '#f8f8f8',
                  borderRadius: 12,
                  marginBottom: 16,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{ fontWeight: '600' }}>
                    {t('total_refund_amount')}
                  </Text>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      color: colors.primary,
                      fontSize: 18,
                    }}
                  >
                    SAR {totalRefund}
                  </Text>
                </View>
              </View>
            )}

            <Text style={styles.refundInstruction}>
              {t('refund_instruction')}{' '}
              <Text
                style={{ color: colors.primary, fontWeight: '600' }}
                onPress={() =>
                  navigation.navigate('RefundPolicy')
                }
              >
                {t('refund_policy')}
              </Text>
            </Text>
          </View>
        </ScrollView>

        {/* Fixed Submit Button */}
        <View style={[styles.bottomButtonContainer, { bottom: insets.bottom }]}>
          <CustomButton
            title={t('submit_request')}
            onPress={handleSubmit}
            disabled={selectedServices.length === 0 || !reason.trim() || submitting}
            loading={submitting}
          />
        </View>
      </SafeAreaView>

      <SuccessMessageModal
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          // Pop back to HistoryScreen if it's in the stack, otherwise navigate to it
          navigation.dispatch((state: any) => {
            const routes = state.routes || [];
            const idx = routes.findIndex((r: any) => r.name === 'HistoryScreen');
            if (idx === -1) {
              return CommonActions.navigate({
                name: 'EntryPoint',
                params: { screen: 'History', params: { screen: 'HistoryScreen' } },
              });
            }
            const popCount = routes.length - 1 - idx;
            if (popCount <= 0) {
              return CommonActions.navigate({
                name: 'EntryPoint',
                params: { screen: 'History', params: { screen: 'HistoryScreen' } },
              });
            }
            return StackActions.pop(popCount);
          });
        }}
        title={t('refund_request')}
        description={successMessage || t('refund_request_sent_successfully') || 'Refund request sent successfully'}
      />
    </>
  );
}
