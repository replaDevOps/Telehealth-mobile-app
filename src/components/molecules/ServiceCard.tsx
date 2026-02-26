import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LoyaltyPSvg } from '@assets/icons';
import { colors } from '../../styles/colors';

interface ServiceCardProps {
  image: any;
  type: string;
  serviceGroup: string;
  serviceName: string;
  price: string;
  duration: string;
  onPress: () => void;
  description?: string;
  procedure?: string;
  bonusLoyalityPoints?: string | number;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  image,
  type,
  serviceGroup,
  serviceName,
  price,
  duration,
  description,
  procedure,
  bonusLoyalityPoints,
  onPress,
}) => {
  console.log('ServiceCard props:', {
    image,
    type,
    serviceGroup,
    serviceName,
    price,
    duration,
    description,
    procedure,
    bonusLoyalityPoints,
  });
  return (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image source={image} style={styles.serviceImage} />

      <View style={styles.serviceInfoContainter}>
        <View style={styles.serviceInfo}>
          <View style={styles.serviceTags}>
            <View style={styles.tag}>
              <Text style={styles.TypetagText} numberOfLines={1} ellipsizeMode="tail">{type}</Text>
            </View>
              <View style={styles.tag}>
                <Text style={styles.SGtagText} numberOfLines={1} ellipsizeMode="tail">{serviceGroup}</Text>
              </View>
          </View>
          <Text style={styles.price}>{price}</Text>
        </View>

        <View style={styles.serviceFooter}>
          <Text style={styles.serviceName} numberOfLines={1} ellipsizeMode="tail">{serviceName}</Text>
          <View style={styles.durationContainer}>
            <Ionicons
              name="time-outline"
              size={14}
              color={colors.secondaryText}
            />
            <Text style={styles.duration}>{duration}</Text>
          </View>
        </View>
        {/* Loyalty badge */}
        {bonusLoyalityPoints && Number(bonusLoyalityPoints) > 0 && (
          <View style={styles.loyaltyBadge}>
            <LoyaltyPSvg width={16} height={16} />
            <Text style={styles.loyaltyBadgeText}>{`Earn ${Math.round(Number(bonusLoyalityPoints))} loyalty points`}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  serviceCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: 12,

    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  serviceImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  serviceInfoContainter: {
    flex: 1,
    marginLeft: 4,
    justifyContent: 'space-between',
  },
  serviceInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceTags: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 6,
  },
  tag: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    maxWidth: 70,
  },
  TypetagText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '500',
    flexShrink: 1,
  },
  SGtagText: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '500',
    flexShrink: 1,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text || '#1A1A1A',
    marginBottom: 6,
    flex: 1,
    flexShrink: 1,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text || '#1A1A1A',
    textAlign: 'right',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  duration: {
    fontSize: 13,
    color: colors.secondaryText || '#666666',
  },
  loyaltyBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E6',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
  },
  loyaltyBadgeText: {
    fontSize: 12,
    color: '#7A4B00',
    marginLeft: 6,
    fontWeight: '500',
  },
});
