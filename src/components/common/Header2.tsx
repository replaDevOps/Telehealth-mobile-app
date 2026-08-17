import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, Modal, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { mvs } from '../../config/metrices';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BackSvg, ShopingCartSvg } from '../../assets/icons';
import { AiLogo, LogoPng } from '../../assets/images';
import { colors } from '../../styles/colors';
import { useTranslation } from 'react-i18next';
import { setAppLanguage, type AppLanguage } from '@services/language';
import { useNavigation } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native-paper';

type RootStackParamList = {
  [key: string]: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Header2Props {
  title: string;
  showEdit?: boolean;
  onEditPress?: () => void;
  showNotification?: boolean;
  back?: boolean;
  useCancel?: boolean;
  useDownload?: boolean;
  useSave?: boolean;
  useSkip?: boolean;
  handleSkip?: () => void;
  showLanguage?: boolean;
  showCart?: boolean;
  cartCount?: number;
  notificationCount?: number;
  handleNotification?: () => void;
  HandleCart?: () => void;

  handleDownload?: () => void;
  handleSave?: () => void;
  saveDisabled?: boolean;
  logo?: boolean;
  handleBackPress?: () => void;
  loading?: boolean;
  rightElement?: React.ReactNode;
  inScrollView?: boolean;

  theme?: 'light' | 'dark';
  onThemeChange?: (theme: 'light' | 'dark') => void;
  showLogoLeft?: boolean;
}

const Header2: React.FC<Header2Props> = ({
  title,
  showEdit = false,
  onEditPress,
  showNotification = false,
  back = true,
  useCancel = false,
  useSave = false,
  useSkip = false,
  showLanguage = false,
  showCart = false,
  cartCount = 0,
  notificationCount = 0,
  handleNotification = () => {},
  HandleCart = () => {},
  handleSave,
  saveDisabled = false,
  handleBackPress,
  handleSkip,
  logo = false,
  loading = false,
  rightElement,
  inScrollView = false,
  theme = 'light',
  onThemeChange,
  showLogoLeft = false,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const { t, i18n } = useTranslation();

  const normalizeLang = (lang: string | undefined) => {
    if (!lang) return 'en';
    const code = lang.split(/[-_]/)[0];
    return code === 'ar' ? 'ar' : 'en';
  };

  const [language, setLanguage] = useState<string>(normalizeLang(i18n.language));
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langButtonRef = useRef<View>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0, width: mvs(120) });

  // Keep local language state in sync when i18n changes elsewhere
  React.useEffect(() => {
    const normalized = normalizeLang(i18n.language);
    if (normalized !== language) setLanguage(normalized);
  }, [i18n.language]);

  const data = [
    { label: t('english'), value: 'en' },
    { label: t('arabic'), value: 'ar' },
  ];

  const onBackPress = () => {
    if (handleBackPress) {
      handleBackPress();
    } else {
      navigation.goBack();
    }
  };

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
          top: top > 0 ? top : mvs(50),
          right: Math.max(right, mvs(10)),
          width: Math.max(width, mvs(120)),
        });
        setIsLangMenuOpen(true);
      });
    } else {
      setIsLangMenuOpen(true);
    }
  };

  return (
    <View style={[styles.container, { paddingHorizontal: inScrollView ? 0 : mvs(15) }]} >
      {showLogoLeft ? (
        <View style={styles.leftLogoContainer}>
          <Image
            source={LogoPng}
            style={[
              styles.leftLogoImage,
              theme === 'dark' && { tintColor: '#FFFFFF' },
            ]}
            resizeMode="contain"
          />
        </View>
      ) : back ? (
        <TouchableOpacity
          style={[
            styles.headerButton,
            {
              backgroundColor: theme === 'light' ? '#FFFFFF' : '#1D1236',
              borderColor: theme === 'light' ? colors.border : '#3A2E5B',
            },
          ]}
          onPress={onBackPress}
        >
          {useCancel ? (
            <Text style={[styles.cancelText, { color: theme === 'light' ? 'gray' : '#A772E5' }]}>{t('cancel')}</Text>
          ) : theme === 'light' ? (
            <BackSvg />
          ) : (
            <Ionicons name="chevron-back" size={20} color={colors.white} />
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.emptySpace} />
      )}

      {(logo || title) ? (
        <View style={styles.textc}>
          {logo ? (
            <Image source={AiLogo} style={styles.logoImage} resizeMode="contain" />
          ) : (
            <Text style={[styles.text, { color: theme === 'light' ? colors.black : colors.white }]}>{title}</Text>
          )}
        </View>
      ) : null}

      {useSave ? (
        <TouchableOpacity
          style={[styles.icon, saveDisabled && { opacity: 0.5 }]}
          onPress={() => handleSave?.()}
          disabled={saveDisabled || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={[styles.saveText, saveDisabled && { color: 'gray' }]}>
              {t('save')}
            </Text>
          )}
        </TouchableOpacity>
      ) : useSkip && handleSkip ? (
        <TouchableOpacity style={styles.icon} onPress={handleSkip}>
          <Text style={styles.skipText}>{t('skip')}</Text>
        </TouchableOpacity>
      ) : showCart ? (
        <TouchableOpacity style={styles.headerButton} onPress={HandleCart}>
          <View style={styles.cartContainer}>
            <ShopingCartSvg />
            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      ) : showLanguage ? (
        <View style={styles.rightHeaderControls}>
          {onThemeChange && (
            <TouchableOpacity
              style={[
                styles.themeButton,
                {
                  backgroundColor: theme === 'light' ? '#FFFFFF' : '#1D1236',
                  borderColor: theme === 'light' ? colors.border : '#3A2E5B',
                  borderWidth: 1,
                },
              ]}
              onPress={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}
            >
              <Ionicons
                name={theme === 'light' ? 'sunny-outline' : 'moon-outline'}
                size={mvs(18)}
                color={theme === 'light' ? '#EAA300' : '#A772E5'}
              />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            ref={langButtonRef}
            activeOpacity={0.8}
            style={[
              styles.langPillButton,
              {
                backgroundColor: theme === 'light' ? '#FFFFFF' : '#1D1236',
                borderColor: theme === 'light' ? colors.border : '#3A2E5B',
              },
            ]}
            onPress={handleOpenLangMenu}
          >
            <Ionicons
              name="globe-outline"
              size={mvs(16)}
              color={theme === 'light' ? colors.black : colors.white}
              style={{ marginRight: mvs(4) }}
            />
            <Text
              style={[
                styles.langPillText,
                { color: theme === 'light' ? colors.black : colors.white },
              ]}
            >
              {language === 'ar' ? t('arabic') : t('english')}
            </Text>
            <Ionicons
              name={isLangMenuOpen ? 'chevron-up' : 'chevron-down'}
              size={mvs(14)}
              color={theme === 'light' ? colors.black : colors.white}
              style={{ marginLeft: mvs(4) }}
            />
          </TouchableOpacity>

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
                    backgroundColor: theme === 'light' ? '#FFFFFF' : '#1F123A',
                    borderColor: theme === 'light' ? colors.border : '#3A2E5B',
                  },
                ]}
              >
                {data.map((item, idx) => {
                  const isSelected = language === item.value;
                  return (
                    <TouchableOpacity
                      key={item.value}
                      activeOpacity={0.7}
                      style={[
                        styles.langOptionItem,
                        idx < data.length - 1 && {
                          borderBottomWidth: 1,
                          borderBottomColor:
                            theme === 'light' ? '#F0F0F5' : 'rgba(255, 255, 255, 0.08)',
                        },
                        isSelected && {
                          backgroundColor:
                            theme === 'light' ? '#F5F3FF' : '#2A1A4A',
                        },
                      ]}
                      onPress={() => {
                        handleLanguageChange(item);
                        setIsLangMenuOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.langOptionText,
                          {
                            color: isSelected
                              ? theme === 'light'
                                ? '#7625D7'
                                : '#B388FF'
                              : theme === 'light'
                              ? colors.black
                              : colors.white,
                            fontWeight: isSelected ? '600' : '400',
                          },
                        ]}
                      >
                        {item.label}
                      </Text>
                      {isSelected && (
                        <Ionicons
                          name="checkmark"
                          size={mvs(16)}
                          color={theme === 'light' ? '#7625D7' : '#B388FF'}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </TouchableOpacity>
          </Modal>
        </View>
      ) : showEdit ? (
        <TouchableOpacity style={styles.icon} onPress={onEditPress}>
          <Ionicons name="create" size={25} color={colors.black} />
        </TouchableOpacity>
      ) : showNotification ? (
        <TouchableOpacity style={styles.headerButton} onPress={handleNotification}>
          <View style={styles.cartContainer}>
            <Ionicons name="notifications" size={25} color={colors.black} />
            {notificationCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{notificationCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      ) : rightElement ? (
        rightElement
      ) : (
        <View style={styles.emptySpace} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: mvs(10),
  },
  icon: {
    marginRight: 5,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  textc: {
    flex: 1,
    alignItems: 'center',
  },
  text: {
    color: colors.black,
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoImage: {
    width: 64,
    height: 32,
  },
  cancelText: {
    fontSize: mvs(16),
    color: 'gray',
  },
  saveText: {
    fontSize: mvs(14),
    color: colors.primary,
    fontWeight: 'bold',
  },
  skipText: {
    fontSize: mvs(16),
    color: colors.primary,
    fontWeight: 'bold',
  },
  cartContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.primary,
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  languageText: {
    fontSize: mvs(14),
    color: colors.black,
    marginLeft: 5,
  },
  emptySpace: {
    width: 45,
  },
  rightHeaderControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeButton: {
    width: mvs(36),
    height: mvs(36),
    borderRadius: mvs(18),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: mvs(8),
  },
  dropdown: {
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  placeholderStyle: {
    fontSize: 14,
  },
  selectedTextStyle: {
    fontSize: 14,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  iconStyle: {
    width: 16,
    height: 16,
  },
  leftLogoContainer: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: mvs(80),
  },
  leftLogoImage: {
    width: mvs(70),
    height: mvs(30),
  },
  langPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: mvs(36),
    paddingHorizontal: mvs(10),
    borderRadius: mvs(18),
    borderWidth: 1,
  },
  langPillText: {
    fontSize: mvs(13),
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  langDropdownCard: {
    position: 'absolute',
    borderRadius: mvs(12),
    borderWidth: 1,
    paddingVertical: mvs(4),
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
    paddingVertical: mvs(10),
    paddingHorizontal: mvs(14),
  },
  langOptionText: {
    fontSize: mvs(14),
  },
});

export { Header2 };
