import { PipsImage, RecommandImage } from '@assets/images';
import { Header2 } from '@components/common/Header2';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../styles/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { mvs } from '@config/metrices';
import { ApplePaySvg, StcPaySvg, TabbySvg, TamaraSvg } from '@assets/icons';
import MasterCardSvg from '@assets/icons/MastercardSvg';
import { CustomTextInput } from '@components/common/CustomTextInput';
import { CustomButton } from '@components/common/CustomButton';

export default function CheckoutScreen() {
  const [selectedPayment, setSelectedPayment] = useState('credit');
  const [couponCode, setCouponCode] = useState('');

  const services = [
    {
      id: 1,
      name: 'Acne Treatment',
      duration: '40 min',
      price: '200 SAR',
      category: 'Dental',
      categoryBadge: 'Enaqa Name',
      image: PipsImage,
    },
    {
      id: 2,
      name: 'Teeth Whiting',
      duration: '40 min',
      price: '200 SAR',
      category: 'Dental',
      categoryBadge: 'Group Name',
      image: PipsImage,
    },
  ];

  const paymentMethods = [
    { id: 'credit', label: 'Credit/Debit Card', logo: <MasterCardSvg /> },
    { id: 'applepay', label: 'Apple Pay', logo: <ApplePaySvg /> },
    { id: 'stc', label: 'STC Pay', logo: <StcPaySvg /> },
  ];

  const installmentOptions = [
    { id: 'tabby', label: 'Tabby', logo: <TabbySvg /> },
    { id: 'tamara', label: 'Tamara', logo: <TamaraSvg /> },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <Header2 title="Checkkout" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.clinicCard}>
          <Image
            source={RecommandImage}
            resizeMode="cover"
            style={styles.clinicImage}
          />
          <View style={styles.clinicInfo}>
            <Text style={styles.clinicName}>Eden Medical Center</Text>
            <Text style={styles.clinicLocation}>
              Makkah, Saudi Arabia, 2.2km
            </Text>
          </View>
        </View>

        {/* Services */}
        {services.map(service => (
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
            <Text style={styles.servicePrice}>{service.price}</Text>
          </View>
        ))}

        {/* Payment Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Type</Text>
          <Text style={styles.sectionSubtitle}>ONE-TIME PAYMENT</Text>

          {paymentMethods.map(method => (
            <TouchableOpacity
              key={method.id}
              style={styles.paymentOption}
              onPress={() => setSelectedPayment(method.id)}
            >
              <View style={styles.radioContainer}>
                <View style={styles.radioOuter}>
                  {selectedPayment === method.id && (
                    <View style={styles.radioInner} />
                  )}
                </View>
                <Text style={styles.paymentLabel}>{method.label}</Text>
              </View>
              {method.logo && (
                <Text style={styles.paymentLogo}>{method.logo}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Pay in Installments */}
        <View style={styles.section}>
          <Text style={styles.sectionSubtitle}>PAY IN INSTALLMENTS</Text>

          {installmentOptions.map(option => (
            <TouchableOpacity
              key={option.id}
              style={styles.paymentOption}
              onPress={() => setSelectedPayment(option.id)}
            >
              <View style={styles.radioContainer}>
                <View style={styles.radioOuter}>
                  {selectedPayment === option.id && (
                    <View style={styles.radioInner} />
                  )}
                </View>
                <Text style={styles.paymentLabel}>{option.label}</Text>
              </View>
              <Text style={styles.installmentLogo}>{option.logo}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <CustomButton
          title="Apply Code"
          style={{ backgroundColor: colors.black, marginHorizontal: mvs(15) }}
          textStyle={{ color: colors.white }}
        />

        <CustomTextInput
          label="Coupon Code"
          placeholder="Enter Coupon Code"
          value={couponCode}
          onChangeText={setCouponCode}
          containerStyle={styles.couponInput}
        />
        {/* Appointment Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Appointment Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>No.of Services</Text>
            <Text style={styles.summaryValue}>2</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>700 SAR</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>15%</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Discount</Text>
            <Text style={styles.summaryValue}>10%</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalValue}>630 SAR</Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.proceedButton}>
          <Text style={styles.proceedButtonText}>Proceed to Payment</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },

  backButton: {
    padding: 4,
  },
  backIcon: {
    fontSize: 24,
    color: '#000',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  clinicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  clinicImage: {
    width: 48,
    height: 48,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  clinicEmoji: {
    fontSize: 24,
  },
  clinicInfo: {
    flex: 1,
  },
  clinicName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  clinicLocation: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 16,
    backgroundColor: colors.lightGray,
    marginTop: 12,
    borderRadius: 12,
  },
  serviceLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  serviceImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceBadges: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  categoryBadge: {
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '500',
  },
  nameBadge: {
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  nameBadgeText: {
    fontSize: 10,
    color: colors.text,
    fontWeight: '500',
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clockIcon: {
    fontSize: 12,
  },
  duration: {
    fontSize: 12,
    color: colors.secondaryText,
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 11,
    fontWeight: 'thin',
    color: colors.secondaryText,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.gray,
    marginBottom: mvs(8),
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#7c3aed',
  },
  paymentLabel: {
    fontSize: 15,
    color: '#111827',
  },
  paymentLogo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  paymentIcon: {
    fontSize: 20,
  },
  installmentLogo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  couponTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  optional: {
    color: '#9ca3af',
    fontWeight: '400',
  },
  couponInput: {
    marginHorizontal: mvs(15),
    marginTop: mvs(15),
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: mvs(15),
  },
  applyButton: {
    backgroundColor: colors.black,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  summarySection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 0.5,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  bottomSpacing: {
    height: 100,
  },
  bottomContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  proceedButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  proceedButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
