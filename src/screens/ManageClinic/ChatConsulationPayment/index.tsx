import { Header2 } from '@components/common/Header2';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../styles/colors';
import { CustomButton } from '@components/common/CustomButton';
import { ApplePaySvg, MastercardSvg, StcPaySvg } from '@assets/icons';
import { RecommandImage } from '@assets/images';
import { styles } from './style';

export default function ChatConsultationPayment({ navigation, route }) {
  const [selectedPayment, setSelectedPayment] = useState('credit');
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const consultationData = route?.params || {
    consultationType: 'Chat',
    duration: '30 Min',
    price: '20 SAR',
    serviceType: 'Derma',
    serviceGroup: 'Diagnostics',
    service: 'Impacted Surgical Exposure - Difficult',
  };

  const handleConnectWithDoctor = () => {
    console.log('Connecting with doctor...');

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('ChatScreen', {
        chatType: 'ai',
      });

      navigation.navigate('ChatScreen', {
        chatType: 'doctor',
        doctorInfo: {
          id: 'doctor_1',
          name: 'Dr. Sultan Khan',
          avatar: '',
        },
        clinicInfo: {
          name: 'Eden Medical Center',
          location: 'Makkah, Saudi Arabia, 2.2km',
          image: RecommandImage,
        },
      });
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header2 title="Chat Consultation" />

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

        {/* Payment Method */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Payment Method</Text>

          {/* Credit/Debit Card */}
          <TouchableOpacity
            style={[
              styles.paymentOption,
              selectedPayment === 'credit' && styles.paymentOptionSelected,
            ]}
            onPress={() => setSelectedPayment('credit')}
          >
            <View style={styles.paymentLeft}>
              <View style={styles.radioOuter}>
                {selectedPayment === 'credit' && (
                  <View style={styles.radioInner} />
                )}
              </View>
              <Text style={styles.paymentLabel}>Credit/Debit Card</Text>
            </View>
            <View style={styles.cardLogos}>
              <MastercardSvg />
            </View>
          </TouchableOpacity>

          {/* Card Details Form */}
          {selectedPayment === 'credit' && (
            <View style={styles.cardForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Cardholder Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter cardholder name"
                  placeholderTextColor="#9ca3af"
                  value={cardholderName}
                  onChangeText={setCardholderName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Cardholder Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter cardholder name"
                  placeholderTextColor="#9ca3af"
                  value={cardNumber}
                  onChangeText={setCardNumber}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, styles.inputGroupHalf]}>
                  <Text style={styles.inputLabel}>Cardholder Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="01/2025"
                    placeholderTextColor="#9ca3af"
                    value={expiryDate}
                    onChangeText={setExpiryDate}
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.inputGroup, styles.inputGroupHalf]}>
                  <Text style={styles.inputLabel}>CVVName</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="000"
                    placeholderTextColor="#9ca3af"
                    value={cvv}
                    onChangeText={setCvv}
                    keyboardType="numeric"
                    maxLength={3}
                    secureTextEntry
                  />
                </View>
              </View>
            </View>
          )}

          {/* Apple Pay */}
          <TouchableOpacity
            style={[
              styles.paymentOption,
              selectedPayment === 'applepay' && styles.paymentOptionSelected,
            ]}
            onPress={() => setSelectedPayment('applepay')}
          >
            <View style={styles.paymentLeft}>
              <View style={styles.radioOuter}>
                {selectedPayment === 'applepay' && (
                  <View style={styles.radioInner} />
                )}
              </View>
              <Text style={styles.paymentLabel}>Apple Pay</Text>
            </View>
            <ApplePaySvg />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              selectedPayment === 'stc' && styles.paymentOptionSelected,
            ]}
            onPress={() => setSelectedPayment('stc')}
          >
            <View style={styles.paymentLeft}>
              <View style={styles.radioOuter}>
                {selectedPayment === 'stc' && (
                  <View style={styles.radioInner} />
                )}
              </View>
              <Text style={styles.paymentLabel}>STC Pay</Text>
            </View>
            <StcPaySvg />
          </TouchableOpacity>
        </View>

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
            We’re finding a doctor for your consultation. This may take a
            moment.
          </Text>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
