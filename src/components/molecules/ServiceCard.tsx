import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../styles/colors';
import { coinIcon } from '@assets/images';
import { TagSvg } from '@assets/icons';

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
}

export const ServiceCard = ({
  image,
  type,
  serviceGroup,
  serviceName,
  price,
  duration,
  onPress,
}: ServiceCardProps) => {
  return (
    <TouchableOpacity
      style={styles.containner}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.serviceCard}>
        <Image source={image} style={styles.serviceImage} />

        <View style={styles.serviceInfoContainter}>
          <View style={styles.serviceInfo}>
            <View style={styles.serviceTags}>
              <View style={styles.tag}>
                <Text style={styles.TypetagText}>{type}</Text>
              </View>
              <View style={styles.tag}>
                <Text style={styles.SGtagText}>{serviceGroup}</Text>
              </View>
            </View>
            <Text style={styles.price}>{price}</Text>
          </View>

          <View style={styles.serviceFooter}>
            <Text style={styles.serviceName}>{serviceName}</Text>
            <View style={styles.durationContainer}>
              <Ionicons
                name="time-outline"
                size={14}
                color={colors.secondaryText}
              />
              <Text style={styles.duration}>{duration}</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 5 }}>
        <View style={styles.pointTag}>
          <Image source={coinIcon} style={{ width: 15, height: 15 }} />
          <Text style={styles.pointTagText}>Earn 10 loyalty points </Text>
        </View>
        <View style={styles.pointTag}>
          <TagSvg width={15} height={15} />
          <Text style={styles.pointTagText}>40% off SAR.80</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  containner: {
    backgroundColor: colors.white,
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  serviceCard: {
    flexDirection: 'row',
  },
  serviceImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  serviceInfoContainter: {
    flex: 1,
    marginLeft: 12,
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
    gap: 8,
    marginBottom: 6,
  },
  tag: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  TypetagText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '500',
  },
  SGtagText: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '500',
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text || '#1A1A1A',
    marginBottom: 6,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  pointTag: {
    backgroundColor: colors.lightYellow,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  pointTagText: { color: colors.yellow, fontWeight: '600', fontSize: 12 },

  tagText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
});
