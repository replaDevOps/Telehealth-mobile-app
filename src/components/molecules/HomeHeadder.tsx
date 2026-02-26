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
      <View style={[styles.headerContainer, { paddingTop: inset.top }]}>
        <View style={styles.topRow}>
          <View style={styles.locationContainer}>
            <Text style={styles.locationLabel}>{t('location_label')}</Text>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={onLocationPress}
              activeOpacity={0.7}
            >
              {isLocationLoading ? (
                <>
                  <ActivityIndicator size="small" color={colors.white} />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {t('getting_location')}
                  </Text>
                </>
              ) : location ? (
                <>
                  <Ionicons name="location" size={18} color={colors.white} />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {location}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={colors.white} />
                </>
              ) : (
                <Ionicons name="chevron-down" size={18} color={colors.white} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.iconContainer}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onCartPress}
              activeOpacity={0.7}
            >
              <ShopingCartSvg />
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
                <Ionicons name="notifications-outline" size={24} />
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
                size={22}
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
            <FilterSvg />
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
   
    paddingBottom: 30,
    paddingHorizontal: 20,
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
    width: '70%',
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
  SLButton: {
    width: 50,
    height: 50,
    backgroundColor: '#FFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeHeader;
