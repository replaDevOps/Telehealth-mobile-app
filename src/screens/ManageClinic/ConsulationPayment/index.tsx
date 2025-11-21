import { Header2 } from '@components/common/Header2';
import React, { useState } from 'react';
import { View, Text, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../styles/colors';
import { CustomButton } from '@components/common/CustomButton';
import { RecommandImage, doctor } from '@assets/images';
import { styles } from './style';
import { PaymentMethod } from '@components/molecules';
import { useTranslation } from 'react-i18next';

export function ConsultationPayment({ navigation, route }) {
  const { t } = useTranslation();
  const [selectedPayment, setSelectedPayment] = useState('credit');
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const consultationData = route?.params || {
    consultationType: 'Chat',
    consultationTypeId: 'chat',
    duration: '30 Min',
    price: '20 SAR',
    serviceType: 'Derma',
    serviceGroup: 'Diagnostics',
    service: 'Impacted Surgical Exposure - Difficult',
  };

  const consultationType = consultationData.consultationTypeId || 'chat';

  const handleConnectWithDoctor = () => {
    console.log('Connecting with doctor...', consultationType);

    // Validate payment if credit card is selected
    if (selectedPayment === 'credit') {
      if (!cardholderName || !cardNumber || !expiryDate || !cvv) {
        alert(t('fill_card_details'));
        return;
      }
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      if (consultationType === 'chat') {
        navigation.navigate('ChatScreen', {
          chatType: 'doctor',
          doctorInfo: {
            id: 'doctor_1',
            name: 'Dr. Sultan Khan',
            avatar: 'https://i.pravatar.cc/150?img=12',
          },
          clinicInfo: {
            name: 'Eden Medical Center',
            location: 'Makkah, Saudi Arabia, 2.2km',
            image: RecommandImage,
          },
        });
      } else if (consultationType === 'audio') {
        navigation.navigate('AudioConsultation', {
          doctorInfo: {
            name: 'Dr. Yasmin Chowdhury',
            avatar: doctor,
            specialization: 'Dermatologist',
          },
        });
      } else if (consultationType === 'video') {
        navigation.navigate('VideoConsultation', {
          doctorInfo: {
            name: 'Dr. Yasmin Chowdhury',
            avatar: doctor,
            specialization: 'Dermatologist',
          },
        });
      }
    }, 2000);
  };

  const getHeaderTitle = () => {
    if (consultationType === 'chat') return t('chat_consultation');
    if (consultationType === 'audio') return t('audio_consultation');
    if (consultationType === 'video') return t('video_consultation');
    return t('consultation');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header2 title={getHeaderTitle()} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Banner */}
        <View style={styles.successBanner}>
          <Text style={styles.successText}>
            {t('doctors_available')}
          </Text>
        </View>

        {/* Consultation Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>{t('consultation_summary')}</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('consultation_type')}</Text>
            <Text style={styles.summaryValue}>
              {consultationData.consultationType}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('duration')}</Text>
            <Text style={styles.summaryValue}>{consultationData.duration}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('price')}</Text>
            <Text style={styles.summaryValue}>{consultationData.price}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('service_type')}</Text>
            <Text style={styles.summaryValue}>
              {consultationData.serviceType}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('service_group')}</Text>
            <Text style={styles.summaryValue}>
              {consultationData.serviceGroup}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('service')}</Text>
            <Text style={[styles.summaryValue, styles.serviceValue]}>
              {consultationData.service}
            </Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{t('total')}</Text>
            <Text style={styles.totalValue}>{consultationData.price}</Text>
          </View>
        </View>

        {/* Payment Method Component */}
        <PaymentMethod
          selectedPayment={selectedPayment}
          onPaymentChange={setSelectedPayment}
          cardholderName={cardholderName}
          onCardholderNameChange={setCardholderName}
          cardNumber={cardNumber}
          onCardNumberChange={setCardNumber}
          expiryDate={expiryDate}
          onExpiryDateChange={setExpiryDate}
          cvv={cvv}
          onCvvChange={setCvv}
          showTitle={true}
          compact={false}
        />

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <View style={styles.bottomContainer}>
        <CustomButton
          title={t('connect_with_doctor')}
          onPress={handleConnectWithDoctor}
        />
      </View>

      <Modal
        visible={isLoading}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.white} />
          <Text style={styles.loadingText}>
            {t('finding_doctor')}
          </Text>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
