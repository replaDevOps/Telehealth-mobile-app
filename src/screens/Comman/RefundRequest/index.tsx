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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header2 } from '@components/common/Header2';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RecommandImage } from '@assets/images';
import { styles } from './style';
import { colors } from '../../../styles/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CustomButton } from '@components/common/CustomButton';
import { CheckBox } from '@rneui/base';
import { SuccessMessageModal } from '@components/molecules';
import { useTranslation } from 'react-i18next';
import { apiClient } from '@services/api/api-client';
import { API } from '@services/api/api-endpoint';
import { Toast } from 'toastify-react-native';

export function RefundRequest() {
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
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
    navigation.navigate('ClinicDetail', {
      clinic: {
        id: `clinic_${Date.now()}`,
        name: 'AI Health Clinic',
        location: 'None',
        image: RecommandImage,
        specialty: 'General',
        rating: 3,
      },
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
        // Set success message from API response
        setSuccessMessage(responseData?.message || t('refund_request_sent_successfully') || 'Refund request sent successfully');
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
        <Header2 title={t('refund_request') + ' ' + params.paymentId} />

        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.container}
        >
          {/* Clinic Info */}
          <View style={styles.clinicInfo}>
            <View style={styles.clinicLeft}>
              <Image
                source={params.image || RecommandImage}
                style={styles.clinicImage}
                resizeMode="cover"
              />
              <View>
                <Text style={styles.clinicName}>{params.clinicName}</Text>
                <Text style={styles.clinicLocation}>
                  {params.clinicLocation}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.consultButton}
              onPress={handleVisit}
            >
              <Text style={styles.consultButtonText}>{t('visit')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mainSection}>
            <Text style={{ fontWeight: '600', marginBottom: 12 }}>
              {t('select_services_for_refund')}
            </Text>

            {params.services?.map((service: any) => {
              const isChecked = selectedServices.includes(service.id);

              return (
                <View key={service.id} style={styles.serviceCard}>
                  <View style={styles.serviceLeft}>
                    <Image source={service.image} style={styles.serviceImage} />
                    <View style={styles.serviceInfo}>
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
                      <Text style={styles.serviceName}>{service.name}</Text>
                      <View style={styles.durationContainer}>
                        <Ionicons
                          name="time-outline"
                          size={18}
                          color={colors.secondaryText}
                        />
                        <Text style={styles.duration}>{service.duration}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.serviceRight}>
                    <CheckBox
                      checked={isChecked}
                      onPress={() => toggleService(service.id)}
                      containerStyle={{
                        backgroundColor: 'transparent',
                        padding: 0,
                        margin: 0,
                      }}
                      checkedColor={colors.primary}
                      uncheckedColor="#ccc"
                    />
                    <Text style={styles.servicePrice}>{service.price}</Text>
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
                  marginTop: 16,
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
              <Text style={{ color: colors.primary, fontWeight: '600' }}>
                {t('refund_policy')}
              </Text>
            </Text>
          </View>
        </ScrollView>

        <View style={styles.bottomButtonContainer}>
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
          navigation.goBack();
        }}
        title={t('refund_request')}
        description={successMessage || t('refund_request_sent_successfully') || 'Refund request sent successfully'}
      />
    </>
  );
}
