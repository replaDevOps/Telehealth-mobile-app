import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { colors } from '../../../../styles/colors';
import ClinicAvatar from '@components/common/ClinicAvatar';
import { SingleLogo } from '@assets/icons';

type ClinicCardProps = {
  clinicImage: any;
  category: string | string[];
  categories?: string[];
  clinicName: string;
  totalPoints: number;
  handlePress?: () => void;
};
export const ClinicCard = ({
  clinicImage,
  category,
  categories,
  clinicName,
  totalPoints,
  handlePress,
}: ClinicCardProps) => {
  console.log('ClinicCard Props:', {
    clinicImage,
    category,
    categories,
    clinicName,
    totalPoints,
  });
  const pills: string[] = Array.isArray(category)
    ? category
    : category
    ? [category]
    : [];
  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      {clinicImage ? (
        <Image
          source={clinicImage}
          style={{ width: 50, height: 50, borderRadius: 10 }}
        />
      ) : (
        <ClinicAvatar name={clinicName} size={50} style={{ borderRadius: 10 }} />
      )}
      <View style={styles.leftSection}>
        <View style={styles.pillsRow}>
          {pills.map((label, index) => (
            <View key={index} style={styles.category}>
              <Text style={styles.categoryText}>{label}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.transactionId}>{clinicName}</Text>
      </View>

      <View style={styles.rightSection}>
        <View style={styles.pointsRow}>
          <View style={styles.coinIcon}>
            <SingleLogo width={20} height={20} fill="#FDA005" />
          </View>
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
    marginHorizontal: 20,
  },
  leftSection: {
    flex: 1,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    marginBottom: 8,
  },
  centerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  category: {
   
    alignSelf: 'flex-start',
  },
  categoryText: {
    // marginBottom: 8,
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 10,
    color: '#8B5CF6',
    fontWeight: '400',
  },
  transactionId: {
    fontSize: 13,
    color: '#000',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  coinIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  points: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.yellow,
  },
});
