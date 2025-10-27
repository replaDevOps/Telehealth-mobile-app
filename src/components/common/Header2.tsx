import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { mvs } from '../../config/metrices';
import { colors } from '../../config/colors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BackSvg } from '../../assets/icons';

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

  return (
    <View style={styles.container}>
      {back && (
        <TouchableOpacity style={styles.borderIcon} onPress={onBackPress}>
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
        <TouchableOpacity style={styles.icon}>
          <Ionicons name="globe" size={25} color={colors.black} />
          <Text style={styles.languageText}>Eng</Text>
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
    paddingHorizontal: 10,
  },
  icon: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  borderIcon: {
    padding: mvs(10),
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textc: {
    flex: 1,
    alignItems: 'center',
  },
  text: {
    color: colors.black,
    fontSize: 16,
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
