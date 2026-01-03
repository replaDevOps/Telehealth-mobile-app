import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { colors } from '../../styles/colors'; // Adjust path as needed
import { mvs } from '@config/metrices';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');
const MODAL_WIDTH = width * 0.85;

interface ConsultationEndedModalProps {
  visible: boolean;
  onClose: () => void;
  onGetPrescription: () => void;
  hasPrescription?: boolean; // Default to false to hide button unless explicitly set
}

const ConsultationEndedModal: React.FC<ConsultationEndedModalProps> = ({
  visible,
  onClose,
  onGetPrescription,
  hasPrescription = false, // Default to false - only show button if prescription exists
}) => {
  const { t } = useTranslation();
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Close Icon */}
          <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.title}>{t('consultation_ended')}</Text>

          {/* Description */}
          <Text style={styles.description}>
            {hasPrescription 
              ? t('consultation_ended_description')
              : t('consultation_ended_no_prescription') || 'The consultation has ended. No prescription is available yet.'}
          </Text>

          {/* Buttons */}
          <View style={[styles.buttonRow, !hasPrescription && styles.buttonRowCenter]}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>{t('close')}</Text>
            </TouchableOpacity>

            {hasPrescription && (
              <TouchableOpacity
                style={styles.prescriptionButton}
                onPress={onGetPrescription}
              >
                <Text style={styles.prescriptionButtonText} numberOfLines={1}>
                  {t('get_prescription')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(21, 0, 46, 0.5)', // Muted purple overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: MODAL_WIDTH,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'flex-start',
    position: 'relative',
  },
  closeIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeText: {
    fontSize: 24,
    color: colors.text,
    fontWeight: '400',
    lineHeight: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    marginTop: 8,
    textAlign: 'center',
    width: '100%',
  },
  description: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'left',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 0,
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    justifyContent: 'space-between',
  },
  buttonRowCenter: {
    justifyContent: 'center',
  },
  closeButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.gray,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  prescriptionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  prescriptionButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
});

export default ConsultationEndedModal;
