import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { colors } from '../../../../styles/colors';
import { coinIcon } from '@assets/images';

type ClinicCardProps = {
  clinicImage: any;
  category: string;
  clinicName: string;
  totalPoints: number;
  handlePress?: () => void;
};
export const ClinicCard = ({
  clinicImage,
  category,
  clinicName,
  totalPoints,
  handlePress,
}: ClinicCardProps) => {
  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <Image
        source={clinicImage}
        style={{ width: 50, height: 50, borderRadius: 10 }}
      />
      <View style={styles.leftSection}>
        <View style={styles.category}>
          <Text style={styles.categoryText}>{category}</Text>
        </View>
        <Text style={styles.transactionId}>{clinicName}</Text>
      </View>

      <View style={styles.rightSection}>
        <View style={styles.pointsContainer}>
          <Image source={coinIcon} style={{ width: 16, height: 16 }} />
          <Text style={styles.points}>{totalPoints}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ClinicCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  leftSection: {
    flex: 1,
  },
  centerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    alignSelf: 'flex-start',
  },
  categoryText: {
    marginBottom: 8,
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  transactionId: {
    fontSize: 13,
    color: '#999',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  points: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.yellow,
  },
});
