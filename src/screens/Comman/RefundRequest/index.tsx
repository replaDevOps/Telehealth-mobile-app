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

export function RefundRequest() {
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation<any>();
  const params = route.params as any;

  const [reason, setReason] = useState('');
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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

  const handleSubmit = () => {
    if (selectedServices.length === 0) {
      Alert.alert(t('error'), t('select_at_least_one_service'));
      return;
    }
    if (!reason.trim()) {
      Alert.alert(t('error'), t('provide_reason_for_refund'));
      return;
    }

    setShowSuccessModal(true);
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
                    ${totalRefund}
                  </Text>
                </View>
              </View>
            )}

            <Text style={styles.refundInstruction}>
              {t('refund_instruction')}{' '}
              <Text
                style={{ color: colors.primary, fontWeight: '600' }}
                onPress={() =>
                  navigation.navigate('Policy', { policyType: 'refund' })
                }
              >
                {t('refund_policy')}
              </Text>
            </Text>
          </View>
        </ScrollView>

        <View style={styles.bottomButtonContainer}>
          <CustomButton
            title={t('submit_request')}
            onPress={handleSubmit}
            disabled={selectedServices.length === 0 || !reason.trim()}
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
        description={t('refund_eligibility_expired')}
      />
    </>
  );
}
