import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { AudioSvg, ChatSvg, VedioSvg } from '@assets/icons';
import { CustomDropdown } from '@components/common/CustomDropdwon';
import { colors } from '../../styles/colors';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { CustomButton } from '@components/common/CustomButton';
import Ionicons from 'react-native-vector-icons/Ionicons';

type RootStackParamList = {
  ConsultationPayment: {
    consultationType: string;
    consultationTypeId: 'chat' | 'audio' | 'video'; // Add this
    duration: string;
    price: string;
    serviceType: string;
    serviceGroup: string;
    service: string;
  };
};

export default function ConsultDoctorBottomSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [isLoading, setIsLoading] = useState(false);

  const [serviceType, setServiceType] = useState('');
  const [serviceGroup, setServiceGroup] = useState('');
  const [service, setService] = useState('');
  const [selectedConsultation, setSelectedConsultation] = useState<
    'chat' | 'audio' | 'video'
  >('chat');

  const consultationTypes = [
    {
      id: 'chat' as const,
      title: 'Chat Consultation',
      duration: '30 min',
      price: '20 SAR',
      Icon: ChatSvg,
    },
    {
      id: 'audio' as const,
      title: 'Audio Consultation',
      duration: '30 min',
      price: '30 SAR',
      Icon: AudioSvg,
    },
    {
      id: 'video' as const,
      title: 'Video Consultation',
      duration: '30 min',
      price: '40 SAR',
      Icon: VedioSvg,
    },
  ];

  const serviceTypes = [
    { label: 'General', value: 'general' },
    { label: 'Specialist', value: 'specialist' },
  ];
  const serviceGroups = [
    { label: 'Internal Medicine', value: 'internal' },
    { label: 'Pediatrics', value: 'pediatrics' },
  ];
  const services = [
    { label: 'Flu Check-up', value: 'flu' },
    { label: 'Vaccination', value: 'vaccine' },
  ];

  const handleFindDoctor = async () => {
    const selected = consultationTypes.find(t => t.id === selectedConsultation);
    if (!selected) return;

    // Show loading state
    setIsLoading(true);

    // Simulate API call or processing delay
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('ConsultationPayment', {
        consultationType: selected.title,
        consultationTypeId: selected.id, // Pass the type ID
        duration: selected.duration,
        price: selected.price,
        serviceType: serviceType || 'General',
        serviceGroup: serviceGroup || 'Internal Medicine',
        service: service || 'Flu Check-up',
      });
      onClose();
    }, 2000);
  };

  return (
    <>
      {/* Full Screen Loading Modal */}
      <Modal
        visible={isLoading}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.white} />
        </View>
      </Modal>

      {/* Main Bottom Sheet Modal */}
      <Modal
        visible={visible && !isLoading}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.overlayTouchable}
            activeOpacity={1}
            onPress={onClose}
          />
          <View style={styles.bottomSheet}>
            <View style={styles.handleBar} />
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeIcon}>×</Text>
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.header}>
                <Text style={styles.title}>Consult with a Doctor</Text>
                <Text style={styles.subtitle}>
                  Choose how you'd like to connect
                </Text>
              </View>

              <CustomDropdown
                label="Service Type"
                value={serviceType}
                onValueChange={setServiceType}
                options={serviceTypes}
                placeholder="Select Type"
              />
              <CustomDropdown
                label="Service Group"
                value={serviceGroup}
                onValueChange={setServiceGroup}
                options={serviceGroups}
                placeholder="Select Group"
              />
              <CustomDropdown
                label="Service"
                value={service}
                onValueChange={setService}
                options={services}
                placeholder="Select Service"
              />

              {/* Consultation Type */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Consultation Type</Text>
                {consultationTypes.map(type => {
                  const isSelected = selectedConsultation === type.id;
                  const Icon = type.Icon;

                  return (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.consultationCard,
                        isSelected && styles.consultationCardSelected,
                      ]}
                      onPress={() => setSelectedConsultation(type.id)}
                    >
                      <View style={styles.consultationLeft}>
                        <View style={[styles.iconContainer]}>
                          <Icon width={24} height={24} />
                        </View>

                        <View style={styles.consultationInfo}>
                          <Text style={[styles.consultationTitle]}>
                            {type.title}
                          </Text>
                          <View style={styles.durationContainer}>
                            <Ionicons name="time-outline" size={20} />
                            <Text style={styles.duration}>{type.duration}</Text>
                          </View>
                        </View>
                      </View>

                      <Text style={[styles.consultationPrice]}>
                        {type.price}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <CustomButton
                onPress={handleFindDoctor}
                title={isLoading ? 'Finding...' : 'Find Doctor'}
                disabled={isLoading}
              />

              <View style={styles.bottomSpacing} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1 },
  overlayTouchable: { flex: 1 },
  bottomSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeIcon: { fontSize: 25, color: colors.text, fontWeight: '300' },
  header: { alignItems: 'center', marginTop: 8, marginBottom: 24 },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: { fontSize: 14, color: colors.secondaryText },
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  consultationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.gray,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  consultationCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#f5f3ff',
  },
  consultationLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: {
    width: 44,
    height: 44,
    backgroundColor: colors.white,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  consultationInfo: { flex: 1 },
  consultationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  durationContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  clockIcon: { fontSize: 11 },
  duration: { fontSize: 12, color: colors.secondaryText },
  consultationPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  bottomSpacing: { height: 20 },
  loadingOverlay: {
    flex: 1,
    backgroundColor: '#15002E80',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
