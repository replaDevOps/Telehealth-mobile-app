import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../styles/colors';
import LinearGradient from 'react-native-linear-gradient';
import { FilterSvg, ShopingCartSvg } from '@assets/icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore, useGuestStore } from '@store';
import { setAppLanguage, type AppLanguage } from '@services/language';

interface HomeHeaderProps {
  location?: string | null; // Can be null if no location available
  isLocationLoading?: boolean;
  /** Permission was refused - no amount of waiting will produce a location. */
  isLocationDenied?: boolean;
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
  isGuest?: boolean;
}

const HomeHeader = ({
  location,
  isLocationLoading = false,
  isLocationDenied = false,
  onLocationPress,
  onCartPress,
  onNotificationPress,
  onSearchPress,
  onSearchChange,
  searchValue = '',
  onSLPress,
  cartItemCount = 0,
  notificationCount = 0,
  isGuest: isGuestProp,
}: HomeHeaderProps) => {
  const { t, i18n } = useTranslation();
  const inset = useSafeAreaInsets();

  const isGuestStoreState = useGuestStore(state => state.isGuest);
  const token = useAuthStore(state => state.auth?.token);

  // Guest user case: until user makes a proper login (isGuest flag set or token is missing)
  const isGuestUser = isGuestProp !== undefined ? isGuestProp : (isGuestStoreState || !token);

  const normalizeLang = (lang: string | undefined) => {
    if (!lang) return 'en';
    const code = lang.split(/[-_]/)[0];
    return code === 'ar' ? 'ar' : 'en';
  };

  const [language, setLanguage] = useState<string>(normalizeLang(i18n.language));
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langButtonRef = useRef<View>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0, width: 120 });

  useEffect(() => {
    const normalized = normalizeLang(i18n.language);
    if (normalized !== language) setLanguage(normalized);
  }, [i18n.language]);

  const langData = [
    { label: t('english'), value: 'en' },
    { label: t('arabic'), value: 'ar' },
  ];

  const handleLanguageChange = (item: { label: string; value: string }) => {
    setLanguage(item.value);
    setAppLanguage(item.value as AppLanguage);
  };

  const handleOpenLangMenu = () => {
    if (langButtonRef.current) {
      langButtonRef.current.measureInWindow((x, y, width, height) => {
        const screenWidth = Dimensions.get('window').width;
        const top = y + height + 4;
        const right = screenWidth - (x + width);

        setMenuPos({
          top: top > 0 ? top : 50,
          right: Math.max(right, 10),
          width: Math.max(width, 120),
        });
        setIsLangMenuOpen(true);
      });
    } else {
      setIsLangMenuOpen(true);
    }
  };

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
              {/* Only spin when there is nothing to show AND waiting can still
                  change the answer. Once permission is refused the spinner is a
                  lie - it would sit there until the position read times out. */}
              {isLocationLoading && !location && !isLocationDenied ? (
                <>
                  <ActivityIndicator size="small" color={colors.white} />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {t('getting_location')}
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons
                    name={location ? 'location' : 'location-outline'}
                    size={14}
                    color={colors.white}
                  />
                  {/* No city means no city. This used to fall back to "Riyadh",
                      which read as a confirmed location the user had never
                      set. */}
                  <Text style={styles.locationText} numberOfLines={1}>
                    {location || t('location_unavailable')}
                  </Text>
                  <Ionicons name="chevron-down" size={14} color={colors.white} />
                </>
              )}
            </TouchableOpacity>
          </View>

          {isGuestUser ? (
            <View style={styles.iconContainer}>
              <TouchableOpacity
                ref={langButtonRef}
                style={styles.iconButton}
                onPress={handleOpenLangMenu}
                activeOpacity={0.7}
              >
                <Ionicons name="globe-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.iconContainer}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={onCartPress}
                activeOpacity={0.7}
              >
                <ShopingCartSvg width={18} height={18} />
                {cartItemCount > 0 && (
                  <View style={[styles.badge, { top: -4, right: -4 }]}>
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
          )}
        </View>

        <Modal
          transparent
          visible={isLangMenuOpen}
          animationType="fade"
          statusBarTranslucent
          onRequestClose={() => setIsLangMenuOpen(false)}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setIsLangMenuOpen(false)}
          >
            <View
              style={[
                styles.langDropdownCard,
                {
                  top: menuPos.top,
                  right: menuPos.right,
                  width: menuPos.width,
                },
              ]}
            >
              {langData.map((item, idx) => {
                const isSelected = language === item.value;
                return (
                  <TouchableOpacity
                    key={item.value}
                    activeOpacity={0.7}
                    style={[
                      styles.langOptionItem,
                      idx < langData.length - 1 && styles.langOptionBorder,
                      isSelected && styles.langOptionSelected,
                    ]}
                    onPress={() => {
                      handleLanguageChange(item);
                      setIsLangMenuOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.langOptionText,
                        isSelected && styles.langOptionTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </TouchableOpacity>
        </Modal>

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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  langDropdownCard: {
    position: 'absolute',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    backgroundColor: '#FFFFFF',
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 12,
  },
  langOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  langOptionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F5',
  },
  langOptionSelected: {
    backgroundColor: '#F5F3FF',
  },
  langOptionText: {
    fontSize: 14,
    color: colors.black,
  },
  langOptionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
});

export default HomeHeader;
