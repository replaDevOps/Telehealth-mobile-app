import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import { colors } from '../../styles/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator } from 'react-native-paper';

interface Device {
  id: string;
  image: { uri: string };
  title: string;
  note?: string;
  badge: { [key: string]: string };
  purpose?: string;
}

interface DeviceDetailBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  device: Device | null;
  loading?: boolean;
}

export const DeviceDetailBottomSheet: React.FC<
  DeviceDetailBottomSheetProps
> = ({ visible, onClose, device, loading = false }) => {
  const { t } = useTranslation();
  // Always render the component, even if device is null
  const services = device ? Object.values(device.badge) : [];
  // console.log('services', device);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.bottomSheetContainer}>
          {/* Handle Bar */}
          <View style={styles.handleBar} />

          {/* Close Button */}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>

          {/* Content */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>{t('loading') || 'Loading...'}</Text>
            </View>
          ) : device ? (
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {/* Device Image */}
              <Image source={device.image} style={styles.deviceImage} />

              {/* Device Name */}
              <Text style={styles.deviceName}>{device.title}</Text>

              {/* Purpose Section */}
              {device.purpose && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>{t('purpose')}</Text>
                  <Text style={styles.sectionText}>{device.purpose}</Text>
                </View>
              )}

              {/* Notes Section */}
              {device.note && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>{t('notes')}</Text>
                  <Text style={styles.sectionText}>{device.note}</Text>
                </View>
              )}

              {/* Service Section */}
              {services.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>{t('service')}</Text>
                  <View style={styles.servicesContainer}>
                    {services.map((service, index) => (
                      <View key={index} style={styles.serviceTag}>
                        <Text style={styles.serviceTagText}>{service}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>{t('no_device_selected')}</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    flex: 1,
  },
  bottomSheetContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '75%',
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  deviceImage: {
    width: '50%',
    height: 120,
    borderRadius: 8,
    marginBottom: 16,
    alignSelf: 'center',
  },
  deviceName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    color: colors.secondaryText,
    lineHeight: 20,
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceTag: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  serviceTagText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.secondaryText,
  },
});

export default DeviceDetailBottomSheet;
