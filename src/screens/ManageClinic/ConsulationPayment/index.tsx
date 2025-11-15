import { Header2 } from '@components/common/Header2';
import React, { useState } from 'react';
import { View, Text, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../styles/colors';
import { CustomButton } from '@components/common/CustomButton';
import { RecommandImage, doctor } from '@assets/images';
import { styles } from './style';
import { PaymentMethod } from '@components/molecules';

export function ConsultationPayment({ navigation, route }) {
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
        alert('Please fill all card details');
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
    if (consultationType === 'chat') return 'Chat Consultation';
    if (consultationType === 'audio') return 'Audio Consultation';
    if (consultationType === 'video') return 'Video Consultation';
    return 'Consultation';
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
            3 doctors available for your selection.
          </Text>
        </View>

        {/* Consultation Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Consultation Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Consultation Type</Text>
            <Text style={styles.summaryValue}>
              {consultationData.consultationType}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Duration</Text>
            <Text style={styles.summaryValue}>{consultationData.duration}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Price</Text>
            <Text style={styles.summaryValue}>{consultationData.price}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service Type</Text>
            <Text style={styles.summaryValue}>
              {consultationData.serviceType}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service Group</Text>
            <Text style={styles.summaryValue}>
              {consultationData.serviceGroup}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service</Text>
            <Text style={[styles.summaryValue, styles.serviceValue]}>
              {consultationData.service}
            </Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL</Text>
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
          title="Connect With Doctor"
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
            We're finding a doctor for your consultation. This may take a
            moment.
          </Text>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
