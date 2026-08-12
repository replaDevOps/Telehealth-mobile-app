import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../styles/colors';
import LinearGradient from 'react-native-linear-gradient';
import { FilterSvg, ShopingCartSvg } from '@assets/icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HomeHeaderProps {
  location?: string | null; // Can be null if no location available
  isLocationLoading?: boolean;
  country?: string;
  onLocationPress?: () => void;
  onCartPress?: () => void;
  onNotificationPress?: () => void;
  onSearchPress?: () => void;
  onSearchChange?: (text: string) => void;
  searchValue?: string;
  onSLPress?: () => void;
  cartItemCount?: number;
  notificationCount?: number;
}

const HomeHeader = ({
  location,
  isLocationLoading = false,
  onLocationPress,
  onCartPress,
  onNotificationPress,
  onSearchPress,
  onSearchChange,
  searchValue = '',
  onSLPress,
  cartItemCount = 0,
  notificationCount = 0,
}: HomeHeaderProps) => {
  const { t } = useTranslation();
  const inset = useSafeAreaInsets();
  return (
    <LinearGradient
      colors={['#7625D7', '#591CA2', '#3E1371']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.LinearGradientContainer}
    >
      <View style={[styles.headerContainer, { paddingTop: inset.top + 12 }]}>
        <View style={styles.topRow}>
          <View style={styles.locationContainer}>
            <Text style={styles.locationLabel}>{t('location_label')}</Text>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={onLocationPress}
              activeOpacity={0.7}
            >
              {/* Only spin when there is nothing to show. A refresh over an
                  already-known city should not blank out the header. */}
              {isLocationLoading && !location ? (
                <>
                  <ActivityIndicator size="small" color={colors.white} />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {t('getting_location')}
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="location" size={14} color={colors.white} />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {location || t('riyadh')}
                  </Text>
                  <Ionicons name="chevron-down" size={14} color={colors.white} />
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.iconContainer}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onCartPress}
              activeOpacity={0.7}
            >
              <ShopingCartSvg width={18} height={18} />
              {cartItemCount > 0 && (
                <View style={[styles.badge,{top: -4, right: -4}]}>
                  <Text style={styles.badgeText}>{cartItemCount}</Text>
                </View>
              )} 
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconButton}
              onPress={onNotificationPress}
              activeOpacity={0.7}
            >
              <View style={styles.notificationIconContainer}>
                <Ionicons name="notifications-outline" size={20} />
                {notificationCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder={t('search_clinic')}
              placeholderTextColor="#999"
              value={searchValue}
              onChangeText={onSearchChange}
              onSubmitEditing={onSearchPress}
              returnKeyType="search"
            />
            <TouchableOpacity onPress={onSearchPress} activeOpacity={0.7}>
              <Ionicons
                name="search"
                size={18}
                color={colors.black}
                style={styles.searchIcon}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.SLButton}
            onPress={onSLPress}
            activeOpacity={0.7}
          >
            <FilterSvg width={18} height={18} />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  LinearGradientContainer: {
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  headerContainer: {
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  locationContainer: {
    flex: 1,
  },
  locationLabel: {
    color: '#FFF',
    fontSize: 13,
    marginBottom: 2,
    opacity: 0.9,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: '75%',
  },
  locationText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 2,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 36,
    height: 36,
    backgroundColor: '#FFF',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -15,
    right: -15,
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
  notificationIconContainer: {
    position: 'relative',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 10,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    paddingVertical: 0,
  },
  searchIcon: {
    marginLeft: 8,
  },
  SLButton: {
    width: 40,
    height: 40,
    backgroundColor: '#FFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeHeader;
