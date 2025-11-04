import { PipsImage, RecommandImage } from '@assets/images';
import { Header2 } from '@components/common/Header2';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
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

export function CheckoutScreen() {
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

import { styles } from './style';
