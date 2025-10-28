import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../styles/colors';

interface HomeHeaderProps {
  location?: string;
  country?: string;
  onLocationPress?: () => void;
  onCartPress?: () => void;
  onNotificationPress?: () => void;
  onSearchPress?: () => void;
  onQRPress?: () => void;
  cartItemCount?: number;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({
  location = 'Makkah, Saudi Arabia',
  country = 'Saudi Arabia',
  onLocationPress,
  onCartPress,
  onNotificationPress,
  onSearchPress,
  onQRPress,
  cartItemCount = 0,
}) => {
  return (
    <View style={styles.headerContainer}>
      {/* Location and Icons Row */}
      <View style={styles.topRow}>
        <View style={styles.locationContainer}>
          <Text style={styles.locationLabel}>Location</Text>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={onLocationPress}
            activeOpacity={0.7}
          >
            <Ionicons name="location" size={18} color={colors.white} />
            <Text style={styles.locationText}>{location}</Text>
            <Ionicons name="chevron-down" size={18} color={colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.iconContainer}>
          {/* Cart Icon with Badge */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onCartPress}
            activeOpacity={0.7}
          >
            <Ionicons name="cart-outline" size={24} />
            {cartItemCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartItemCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Notification Icon */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onNotificationPress}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar Row */}
      <View style={styles.searchRow}>
        <TouchableOpacity
          style={styles.searchContainer}
          onPress={onSearchPress}
          activeOpacity={0.8}
        >
          <TextInput
            style={styles.searchInput}
            placeholder="Search clinic"
            placeholderTextColor="#999"
            // editable={false}
            pointerEvents="none"
          />
          <Ionicons
            name="search"
            size={22}
            color="#666"
            style={styles.searchIcon}
          />
        </TouchableOpacity>

        {/* QR Code Button */}
        <TouchableOpacity
          style={styles.qrButton}
          onPress={onQRPress}
          activeOpacity={0.7}
        >
          <Ionicons name="qr-code-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: colors.primary,
    paddingTop: 30,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  locationContainer: {
    flex: 1,
  },
  locationLabel: {
    color: '#FFF',
    fontSize: 14,
    marginBottom: 5,
    opacity: 0.9,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  locationText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 2,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    backgroundColor: '#FFF',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.white,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  searchIcon: {
    marginLeft: 10,
  },
  qrButton: {
    width: 50,
    height: 50,
    backgroundColor: '#FFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeHeader;
