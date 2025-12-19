// components/modals/TierUnlockedModal.tsx

import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../styles/colors';
import { CustomButton } from '@components/common/CustomButton';
import { useTranslation } from 'react-i18next';

interface TierUnlockedModalProps {
  visible: boolean;
  onClose: () => void;
  onViewProgress?: () => void;
  tierName: string;
  pointsRequired: number;
  TierIcon: React.ReactNode;
}

export const TierUnlockedModal: React.FC<TierUnlockedModalProps> = ({
  visible,
  onClose,
  onViewProgress,
  tierName,
  pointsRequired,
  TierIcon,
}) => {
  const metalName = tierName.split(' ')[0];
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={{ marginVertical: 10 }}>{TierIcon}</View>

          <Text style={styles.title}>
            {metalName} {t('tierUnlocked')}
          </Text>

          <Text style={styles.description}>
            {t('youHaveEarned')}{' '}
            <Text style={styles.bold}>
              {pointsRequired} {t('loyaltyPoints')}
            </Text>{' '}
            {t('tierModalDescription')}
          </Text>

          <View style={styles.buttonRow}>
            <CustomButton
              style={{
                width: '50%',
                backgroundColor: colors.white,
                borderColor: colors.borderDark,
                borderWidth: 1,
              }}
              textStyle={{ color: colors.text }}
              title={t('backToHome')}
              onPress={onClose}
            />

            <CustomButton
              style={{ width: '50%' }}
              title={t('ViewProgress')}
              onPress={() => {
                onViewProgress?.();
                onClose();
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '85%',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  starIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  bold: {
    fontWeight: '700',
    color: colors.text,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  backButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#F5F0FF',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9B6EFF',
  },
  viewProgressButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#9B6EFF',
    alignItems: 'center',
  },
  viewProgressText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default TierUnlockedModal;
