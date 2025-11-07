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
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../styles/colors';
import { styles } from './style';
import { Header2 } from '@components/common/Header2';
import { CustomButton } from '@components/common/CustomButton';
import { RecommandImage } from '@assets/images';
import RatingBottomSheet from '@components/molecules/RatingBottomSheet';
import { RouteProp, useRoute } from '@react-navigation/native';

type CardDetailsRouteParams = {
  paymentId: string;
  clinicName: string;
  clinicLocation: string;
  status: string;
  statusColor: string;
  dateTime: string;
  price: string;
  image?: any;
  reason?: string;

  consultationType?: 'Chat' | 'Video' | 'Audio';
  duration?: string;
  doctorName?: string;
  doctorAvatar?: string;
  serviceName?: string;

  services?: Array<{
    id: number;
    name: string;
    duration: string;
    price: string;
    category: string;
    categoryBadge: string;
    image: any;
  }>;
};

type CardDetailsRouteProp = RouteProp<
  { CardDetails: CardDetailsRouteParams },
  'CardDetails'
>;

export function CardDetails({ navigation }: { navigation: any }) {
  const route = useRoute<CardDetailsRouteProp>();
  const params = route.params;
  const reason = params.reason;

  const isAppointment = !!params.services?.length;
  const isConsultation = !isAppointment;

  const [showRating, setShowRating] = useState(false);

  const handleGiveReview = () => setShowRating(true);
  const handleRatingSubmit = (rating: number, feedback: string) => {
    console.log('Rating:', rating, 'Feedback:', feedback);
    setShowRating(false);
  };

  const handleDownloadInvoice = () => {
    alert('Invoice download not implemented yet');
  };

  const handleRefund = () => {
    navigation.navigate('Refund', {
      paymentId: params.paymentId,
      clinicName: params.clinicName,
      clinicLocation: params.clinicLocation,
      image: params.image,
      services: params.services,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle="dark-content" />
      <Header2 title={params.paymentId} />

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        <View style={styles.clinicInfo}>
          <View style={styles.clinicLeft}>
            <Image
              source={params.image || RecommandImage}
              style={styles.clinicImage}
              resizeMode="cover"
            />
            <View>
              <Text style={styles.clinicName}>{params.clinicName}</Text>
              <Text style={styles.clinicLocation}>{params.clinicLocation}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={{
              ...styles.consultButton,
              backgroundColor: isAppointment ? colors.gray : colors.black,
            }}
            onPress={handleGiveReview}
          >
            <Text
              style={{
                ...styles.consultButtonText,
                color: isAppointment ? colors.text : colors.white,
              }}
            >
              {isAppointment ? 'Visit' : 'Give Review'}
            </Text>
          </TouchableOpacity>
        </View>

        {isAppointment &&
          params.services?.map(service => (
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
        {reason && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reason for Refund</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{reason}</Text>
            </View>
          </View>
        )}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Detail</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method</Text>
            <Text style={styles.detailValue}>Credit Card</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <Text style={[styles.detailValue, { color: params.statusColor }]}>
              {params.status}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date & Time</Text>
            <Text style={styles.detailValue}>{params.dateTime}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isAppointment ? 'Appointment Summary' : 'Consultation Summary'}
          </Text>

          {params.consultationType && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Consultation Type</Text>
              <Text style={styles.detailValue}>{params.consultationType}</Text>
            </View>
          )}

          {params.doctorName && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Doctor Name</Text>
              <Text style={styles.detailValue}>{params.doctorName}</Text>
            </View>
          )}

          {params.duration && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>{params.duration}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Price</Text>
            <Text style={styles.detailValue}>{params.price}</Text>
          </View>

          {params.serviceName && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Service</Text>
              <Text style={styles.detailValue}>{params.serviceName}</Text>
            </View>
          )}
        </View>

        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>TOTAL</Text>
          <Text style={styles.totalAmount}>{params.price}</Text>
        </View>
      </ScrollView>

      {!reason && (
        <View style={styles.bottomButtonContainer}>
          {isAppointment ? (
            <CustomButton title="Request for Refund" onPress={handleRefund} />
          ) : (
            <CustomButton
              title="Download Invoice"
              onPress={handleDownloadInvoice}
            />
          )}
        </View>
      )}

      <RatingBottomSheet
        visible={showRating}
        onClose={() => setShowRating(false)}
        onSubmit={handleRatingSubmit}
      />
    </SafeAreaView>
  );
}
