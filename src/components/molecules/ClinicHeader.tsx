import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { colors } from '../../styles/colors';
import { BackSvg, ShopingCartSvg } from '@assets/icons';
import ClinicAvatar from '../common/ClinicAvatar';

interface ClinicHeaderProps {
  backgroundImage: any;
  logo: any;
  onBackPress: () => void;
  onSharePress?: () => void;
  onNotificationPress?: () => void;
  notificationCount?: number;
  cartCount?: number;
  clinicName?: string;
}

export const ClinicHeader: React.FC<ClinicHeaderProps> = ({
  backgroundImage,
  logo,
  onBackPress,
  onSharePress,
  onNotificationPress,
  notificationCount = 0,
  cartCount = 0,
  clinicName = '',
}) => {
  const hasLogo = logo && (typeof logo === 'number' || (typeof logo === 'object' && logo.uri));

  return (
    <ImageBackground source={backgroundImage} style={styles.headerBackground}>
      <View style={styles.headerOverlay}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.headerButton} onPress={onBackPress}>
            <BackSvg />
          </TouchableOpacity>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={onSharePress}
            >
              <ShopingCartSvg />
              {cartCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={onNotificationPress}
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#1A1A1A"
              />
              {notificationCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{notificationCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.logoContainer}>
          {hasLogo ? (
            <Image source={logo} style={styles.logo} />
          ) : (
            // Use logoFrame (border + size, no white background) so the
            // avatar's primary-color circle and white initials remain visible.
            <ClinicAvatar name={clinicName} size={100} style={styles.logoFrame} textStyle={styles.initialsText} />
          )}
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  headerBackground: {
    height: 200,
    width: '100%',
    // Shown when no real background image is available; matches the calm
    // light-gray placeholder used elsewhere instead of a dummy photo.
    backgroundColor: colors.lightGray,
  },
  headerOverlay: {
    flex: 1,
    // backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.primary,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.white,
    borderWidth: 4,
    borderColor: colors.white,
    zIndex: 9999,
  },
  logoFrame: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: colors.white,
    zIndex: 9999,
  },
  initialsText: {
    fontSize: 28,
  },
});
