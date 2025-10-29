import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ListRenderItem,
} from 'react-native';
import { colors } from '../../styles/colors';
import { mvs } from '../../config/metrices';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Define the Clinic interface (reuse from previous components)
interface Clinic {
  id: string;
  name: string;
  specialty: string;
  rating: number | string;
  location: string;
  image?: { uri: string } | number;
  isFeatured?: boolean;
}

// Props for ClinicListItem
interface ClinicListItemProps {
  item: Clinic;
  onPress: (clinic: Clinic) => void;
}

// Props for NearbyClinics
interface NearbyClinicsProps {
  clinics: Clinic[];
  onClinicPress: (clinic: Clinic) => void;
  onSeeAllPress?: () => void; // Optional if not used yet
}

// ClinicListItem Component
const ClinicListItem: React.FC<ClinicListItemProps> = ({ item, onPress }) => {
  return (
    <View>
      <TouchableOpacity style={styles.listItem} onPress={() => onPress(item)}>
        <Image
          source={item?.image}
          style={styles.clinicImage}
          resizeMode="cover"
        />

        <View style={styles.clinicInfo}>
          <View style={{ flexDirection: 'row', gap: '30%' }}>
            <Text style={styles.specialtyText}>{item.specialty}</Text>

            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={18} color={colors.yellow} />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
          </View>
          <Text style={styles.clinicName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={18} color={colors.secondaryText} />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.location}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      <View style={styles.divider} />
    </View>
  );
};

// NearbyClinics Component
const NearbyClinics = ({
  clinics,
  onClinicPress,
  onSeeAllPress,
}: NearbyClinicsProps) => {
  const renderItem: ListRenderItem<Clinic> = ({ item }) => (
    <ClinicListItem item={item} onPress={onClinicPress} />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nearby Clinic</Text>
        {/* Uncomment when you implement See All */}
        {/* <TouchableOpacity onPress={onSeeAllPress} style={styles.seeAllButton}>
          <View style={styles.seeAllBadge}>
            <Text style={styles.seeAllText}>→</Text>
          </View>
        </TouchableOpacity> */}
      </View>

      <FlatList
        data={clinics}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  seeAllButton: {
    padding: 4,
  },
  seeAllBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  listItem: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  clinicImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  clinicInfo: {
    flex: 1,
    marginLeft: 12,
  },
  specialtyText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    marginBottom: 4,
    backgroundColor: colors.gray,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  clinicName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 13,
    color: colors.secondaryText,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: mvs(3),
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondaryText,
  },
  separator: {
    height: 12,
  },
  divider: {
    backgroundColor: colors.border,
    height: mvs(1),
    width: '75%',
    marginLeft: mvs(80),
  },
});

export default NearbyClinics;
