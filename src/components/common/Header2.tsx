import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { mvs } from '../../config/metrices';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BackSvg } from '../../assets/icons';
import { colors } from '../../styles/colors';

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
  handleNotification?: () => void;
  handleDownload?: () => void;
  handleSave?: () => void;
  saveDisabled?: boolean;
  handleBackPress?: () => void;
}

const Header2: React.FC<Header2Props> = ({
  title,
  showEdit = false,
  onEditPress,
  showNotification = false,
  back = true,
  useCancel = false,
  useDownload = false,
  useSave = false,
  useSkip = false,
  showLanguage = false,
  showCart = false,
  cartCount = 0,
  handleNotification = () => {},
  handleDownload = () => {},
  handleSave,
  saveDisabled = false,
  handleBackPress,
  handleSkip,
}) => {
  const navigation = useNavigation<NavigationProp>();

  const onBackPress = () => {
    if (handleBackPress) {
      handleBackPress();
    } else {
      navigation.goBack();
    }
  };

  const handleLanguage = () => {
    navigation.navigate('LanguageSelection');
  };

  return (
    <View style={styles.container}>
      {back && (
        <TouchableOpacity style={styles.headerButton} onPress={onBackPress}>
          {useCancel ? (
            <Text style={styles.cancelText}>Cancel</Text>
          ) : (
            <BackSvg />
          )}
        </TouchableOpacity>
      )}

      <View style={styles.textc}>
        <Text style={styles.text}>{title}</Text>
      </View>

      {useSave ? (
        <TouchableOpacity
          style={[styles.icon, saveDisabled && { opacity: 0.5 }]}
          onPress={() => {
            if (handleSave && !saveDisabled) {
              handleSave();
            }
          }}
          disabled={saveDisabled}
        >
          <Text style={[styles.saveText, saveDisabled && { color: 'gray' }]}>
            Save
          </Text>
        </TouchableOpacity>
      ) : useSkip && handleSkip ? (
        <TouchableOpacity style={styles.icon} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      ) : showCart && cartCount > 0 ? (
        <TouchableOpacity style={styles.icon} onPress={handleNotification}>
          <View style={styles.cartContainer}>
            <Ionicons name="cart" size={25} color={colors.black} />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartCount}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ) : showLanguage ? (
        <TouchableOpacity style={styles.icon} onPress={() => handleLanguage()}>
          <Ionicons name="globe" size={18} color={colors.black} />
          <Text style={styles.languageText}>Eng</Text>
          <Ionicons name="chevron-down" size={16} color={colors.black} />
        </TouchableOpacity>
      ) : showEdit ? (
        <TouchableOpacity style={styles.icon} onPress={onEditPress}>
          <Ionicons name="create" size={25} color={colors.black} />
        </TouchableOpacity>
      ) : showNotification ? (
        <TouchableOpacity style={styles.icon} onPress={handleNotification}>
          <Ionicons name="notifications" size={25} color={colors.black} />
        </TouchableOpacity>
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
    paddingHorizontal: mvs(15),
    paddingVertical: mvs(10),
  },
  icon: {
    flexDirection: 'row',
    gap: mvs(2),
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
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
  cancelText: {
    fontSize: mvs(16),
    color: 'gray',
  },
  saveText: {
    fontSize: mvs(16),
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
});

export { Header2 };
