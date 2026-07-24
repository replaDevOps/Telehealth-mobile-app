import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { mvs } from '../../config/metrices';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BackSvg, ShopingCartSvg } from '../../assets/icons';
import { AiLogo } from '../../assets/images';
import { colors } from '../../styles/colors';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'react-native-element-dropdown';
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
}) => {
  const navigation = useNavigation<NavigationProp>();
  const { t, i18n } = useTranslation();

  const normalizeLang = (lang: string | undefined) => {
    if (!lang) return 'en';
    const code = lang.split(/[-_]/)[0];
    return code === 'ar' ? 'ar' : 'en';
  };

  const [language, setLanguage] = useState<string>(normalizeLang(i18n.language));

  // Keep local language state in sync when i18n changes elsewhere
  React.useEffect(() => {
    const normalized = normalizeLang(i18n.language);
    if (normalized !== language) setLanguage(normalized);
  }, [i18n.language]);
  const [isFocus, setIsFocus] = useState(false);

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
    i18n.changeLanguage(item.value);
    setIsFocus(false);
  };

  return (
    <View style={[styles.container,{paddingHorizontal: inScrollView ? 0 : mvs(15)}]} >
      {back && (
        <TouchableOpacity style={styles.headerButton} onPress={onBackPress}>
          {useCancel ? (
            <Text style={styles.cancelText}>{t('cancel')}</Text>
          ) : (
            <BackSvg />
          )}
        </TouchableOpacity>
      )}

      <View style={styles.textc}>
        {logo ? (
          <Image source={AiLogo} style={styles.logoImage} resizeMode="contain" />
        ) : (
          <Text style={styles.text}>{title}</Text>
        )}
      </View>

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
        <Dropdown
          style={[styles.dropdown]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={data}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={!isFocus ? t('select_language') : '...'}
          value={language}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={handleLanguageChange}
          renderLeftIcon={() => (
            <Ionicons
              style={styles.icon}
              color={isFocus ? 'blue' : 'black'}
              name="globe"
              size={20}
            />
          )}
        />
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
  dropdown: {
    height: 50,
    paddingHorizontal: 8,
    width: 120,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
});

export { Header2 };
