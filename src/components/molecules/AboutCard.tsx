import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageSourcePropType,
} from 'react-native';
import { colors } from '../../styles/colors';
import { TouchableOpacity } from 'react-native'; // ← Make sure you import it

type Device = {
  id: string;
  image: ImageSourcePropType;
  title: string;
  subtitle: string;
  badge: number;
  onDevicePress: (device: Device) => void;
};

type AboutClinicProps = {
  description: string;
  devices: Device[];
  style?: object;
  onDevicePress: (device: Device) => void;
};

const AboutClinic = ({
  description,
  devices,
  style,
  onDevicePress,
}: AboutClinicProps) => {
  return (
    <View style={[styles.container, style]}>
      {/* ── Description ── */}
      <Text style={styles.sectionTitle}>Description</Text>
      <Text style={styles.descriptionText}>{description}</Text>

      {/* ── Devices ── */}
      <Text style={[styles.sectionTitle, styles.devicesTitle]}>Devices</Text>

      <View style={styles.devicesList}>
        {devices.map(device => (
          <TouchableOpacity
            key={device.id}
            style={styles.deviceCard}
            onPress={() => onDevicePress(device)}
          >
            {/* Left image */}
            <Image source={device.image} style={styles.deviceImage} />

            {/* Middle text */}
            <View style={styles.textContainer}>
              <Text style={styles.deviceTitle} numberOfLines={1}>
                {device.title}
              </Text>

              <View style={styles.badgeItem}>
                <Text style={styles.badgeLabel}>
                  {Object.values(device.badge)[0]}
                </Text>
                <View style={styles.badgeCount}>
                  <Text style={styles.badgeCountText}>
                    +{Object.keys(device.badge).length - 1}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  devicesTitle: {
    marginTop: 24,
  },

  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.text,
    marginBottom: 8,
  },

  devicesList: {
    flexDirection: 'column',
    gap: 12,
  },

  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },

  deviceImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    resizeMode: 'cover',
    marginRight: 10,
  },

  textContainer: {
    flex: 1,
  },
  deviceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  deviceSubtitle: {
    fontSize: 12,
    color: colors.secondaryText,
  },

  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  badgeItem: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeLabel: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '600',
    backgroundColor: colors.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  badgeCount: {
    backgroundColor: colors.lightGray,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeCountText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '600',
  },
});

export default AboutClinic;
