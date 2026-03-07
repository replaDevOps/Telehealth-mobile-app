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
import { useTranslation } from 'react-i18next';
import ClinicAvatar from '../common/ClinicAvatar';

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
  // Calculate rating value (handle both string and number types)
  const ratingValue = typeof item.rating === 'string'
    ? parseFloat(item.rating)
    : item.rating;
  const shouldShowRating = ratingValue > 0;
  const hasImage = item.image && (typeof item.image === 'number' || (typeof item.image === 'object' && item.image.uri));

  return (
    <View>
      <TouchableOpacity style={styles.listItem} onPress={() => onPress(item)}>
        {hasImage ? (
          <Image
            source={item?.image as any}
            style={styles.clinicImage}
            resizeMode="cover"
          />
        ) : (
          <ClinicAvatar name={item.name} size={80} style={styles.clinicImage} />
        )}

        <View style={styles.clinicInfo}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
            }}
          >
            {/* If specialty is "Both", show Online and Offline chips; otherwise show single chip */}
            {item.specialty?.toLowerCase() === 'both' ? (
              <View style={styles.chipsContainer}>
                <Text style={styles.specialtyText}>Dermatology</Text>
                <Text style={styles.specialtyText}>Dentistry</Text>
              </View>
            ) : (
              <Text style={styles.specialtyText}>{item.specialty}</Text>
            )}

            {shouldShowRating && (
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={18} color={colors.yellow} />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
            )}
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

const NearbyClinics = ({ clinics, onClinicPress }: NearbyClinicsProps) => {
  const { t } = useTranslation();
  const renderItem: ListRenderItem<Clinic> = ({ item }) => (
    <ClinicListItem item={item} onPress={onClinicPress} />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('nearby_clinic')}</Text>
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
  chipsContainer: {
    flexDirection: 'row',
    gap: 6,
    flex: 1,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  specialtyText: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.primary,
    marginBottom: 4,
    backgroundColor: colors.gray,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    marginRight: 6,
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
    flexShrink: 0,
    marginLeft: 6,
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
