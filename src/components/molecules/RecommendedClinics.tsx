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

// Define the shape of a clinic item
interface Clinic {
  id: string;
  name: string;
  specialty: string;
  rating: number | string;
  location: string;
  image?: { uri: string } | number; // Can be remote URI or local require()
  isFeatured?: boolean;
}

// Props for ClinicCard
interface ClinicCardProps {
  item: Clinic;
  onPress: (clinic: Clinic) => void;
}

// Props for RecommendedClinics
interface RecommendedClinicsProps {
  clinics: Clinic[];
  onClinicPress: (clinic: Clinic) => void;
}

const ClinicCard: React.FC<ClinicCardProps> = ({ item, onPress }) => {
  console.log('item: ', JSON.stringify(item, null, 4));
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)}>
      <View style={styles.imageContainer}>
        <Image
          source={item?.image}
          style={styles.clinicImage}
          resizeMode="cover"
        />
        {item.isFeatured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredIcon}>👑</Text>
            <Text style={styles.featuredText}>Featured</Text>
          </View>
        )}
      </View>

      <View style={styles.cardContent}>
        <View style={styles.specialtyRow}>
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
  );
};

const RecommendedClinics: React.FC<RecommendedClinicsProps> = ({
  clinics,
  onClinicPress,
}) => {
  const renderItem: ListRenderItem<Clinic> = ({ item }) => (
    <ClinicCard item={item} onPress={onClinicPress} />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recommended Clinics</Text>
      <FlatList
        data={clinics}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  card: {
    width: 280,
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative' as const,
    width: '100%',
    height: 160,
    padding: mvs(10),
    backgroundColor: colors.gray,
  },
  clinicImage: {
    width: '100%',
    height: '100%',
    borderRadius: mvs(10),
  },
  featuredBadge: {
    position: 'absolute' as const,
    bottom: 15,
    left: 15,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  featuredIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  featuredText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  cardContent: {
    padding: 12,
    backgroundColor: colors.gray,
  },
  specialtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  specialtyText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: mvs(3),
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondaryText,
  },
  clinicName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
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
});

export default RecommendedClinics;
