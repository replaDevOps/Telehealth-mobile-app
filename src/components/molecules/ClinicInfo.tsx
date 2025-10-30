import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../styles/colors';

interface ClinicInfoProps {
  category: string;
  name: string;
  location: string;
  distance?: string;
  rating: number;
  onConsultPress: () => void;
}

export const ClinicInfo: React.FC<ClinicInfoProps> = ({
  category,
  name,
  location,
  distance = '2.2km',
  rating,
  onConsultPress,
}) => {
  return (
    <View style={styles.infoContainer}>
      <View style={styles.nameRow}>
        <Text style={styles.category}>{category}</Text>
        <TouchableOpacity style={styles.consultButton} onPress={onConsultPress}>
          <Text style={styles.consultText}>Consult Now</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.clinicName}>{name}</Text>

      <View style={styles.locationRow}>
        <View style={styles.locationName}>
          <Ionicons name="location" size={16} color={colors.secondaryText} />
          <Text style={styles.locationText}>{location},</Text>
          <Text style={styles.statText}>{distance},</Text>
          <View style={styles.statItem}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.statText}>{rating}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  infoContainer: {
    padding: 16,
    backgroundColor: colors.white,
  },
  category: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    marginBottom: 8,
    backgroundColor: colors.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  clinicName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  consultButton: {
    backgroundColor: colors.black,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  consultText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  locationRow: {
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationName: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: colors.secondaryText,
  },
});
