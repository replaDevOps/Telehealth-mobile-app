import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../styles/colors';
import { useTranslation } from 'react-i18next';
import TierUnlockedModal from './TierUnlockedModal';
import { BroneTierIcon, GoldTierSvg, SilverTierSvg } from '@assets/icons';
import { CustomButton } from '@components/common/CustomButton';

interface Tier {
  name: string;
  icon: string;
  progress: number;
  total: number;
  reward: number;
  isClaimable?: boolean;
  isCurrent?: boolean;
}

interface RewardsMilestonesBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  tiers: Tier[];
  onClaim?: (tierName: string) => void;
}

export const RewardsMilestonesBottomSheet = ({
  visible,
  onClose,
  tiers,
  onClaim,
}: RewardsMilestonesBottomSheetProps) => {
  const { t } = useTranslation();
  const [tiersData, setTiersData] = useState(tiers);

  const [unlockModalVisible, setUnlockModalVisible] = useState(false);
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [selectedTierIcon, setSelectedTierIcon] =
    useState<React.ReactNode | null>(null);

  const progressPercentage = (progress: number, total: number) =>
    Math.min((progress / total) * 100, 100);

  const handleClaimPress = (tier: Tier) => {
    if (!tier.isClaimable) {
      onClaim?.(tier.name);

      setTiersData(prev =>
        prev.map(item =>
          item.name === tier.name ? { ...item, isClaimable: true } : item,
        ),
      );

      setSelectedTier(tier);
      setSelectedTierIcon(getTierIcon(tier.name));
      setUnlockModalVisible(true);
    }
  };

  const closeUnlockModal = () => {
    setUnlockModalVisible(false);
    setSelectedTier(null);
  };

  const getTierIcon = (tierName: string) => {
    if (tierName.includes('Bronze')) return <BroneTierIcon />;
    if (tierName.includes('Silver')) return <SilverTierSvg />;
    return <GoldTierSvg />;
  };

  return (
    <>
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
            <View style={styles.handleBar} />

            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.content}
            >
              <Text style={styles.title}>{t('rewardsMileStones')}</Text>
              <Text style={styles.subtitle}>
                {t('rewardsMileStonesDescription')}
              </Text>

              <View style={styles.tiersContainer}>
                {tiersData.map((tier, index) => {
                  const percentage = progressPercentage(
                    tier.progress,
                    tier.total,
                  );
                  const isCompleted = tier.progress >= tier.total;

                  return (
                    <View key={index} style={styles.tierRow}>
                      {tier.name.includes('Bronze') ? (
                        <BroneTierIcon />
                      ) : tier.name.includes('Silver') ? (
                        <SilverTierSvg />
                      ) : (
                        <GoldTierSvg />
                      )}

                      <View style={styles.tierInfo}>
                        <View style={styles.tierHeader}>
                          <Text style={styles.tierName}>{tier.name}</Text>

                          {isCompleted && (
                            <TouchableOpacity
                              style={[
                                tier.isClaimable
                                  ? styles.claimButtonDisabled
                                  : styles.claimButton,
                              ]}
                              onPress={() => handleClaimPress(tier)}
                              disabled={tier.isClaimable}
                            >
                              <Text
                                style={[
                                  styles.claimText,
                                  tier.isClaimable && styles.claimTextDisabled,
                                ]}
                              >
                                {!tier.isClaimable
                                  ? t('claimNow')
                                  : t('completed')}
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>

                        <View style={styles.progressBarBackground}>
                          <LinearGradient
                            colors={['#9B6EFF', '#7B3FE4']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{
                              height: '100%',
                              width: `${percentage}%`,
                              borderRadius: 8,
                            }}
                          />
                        </View>

                        <View style={styles.rewardRow}>
                          <Text style={styles.progressText}>
                            {tier.progress.toLocaleString()} /{' '}
                            {tier.total.toLocaleString()}
                          </Text>
                          <View style={styles.coinsRow}>
                            <Text style={styles.coinEmoji}>🪙</Text>

                            <Text style={styles.coinsAmount}>
                              {tier.reward}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
              {tiersData.find(
                t => t.name.includes('Golden') && t.isClaimable,
              ) && <CustomButton title={t('reset_tiers')} onPress={() => {}} />}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {selectedTier && selectedTierIcon && (
        <TierUnlockedModal
          visible={unlockModalVisible}
          onClose={closeUnlockModal}
          onViewProgress={() => {
            closeUnlockModal();
          }}
          tierName={selectedTier.name}
          pointsRequired={selectedTier.reward}
          TierIcon={selectedTierIcon}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  claimButtonDisabled: {},
  claimTextDisabled: {
    color: colors.green,
  },
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
    height: '60%',
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#8A8A8E',
    textAlign: 'center',
    marginBottom: 32,
  },
  tiersContainer: {
    gap: 24,
  },
  tierRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bronzeIcon: {
    backgroundColor: '#FDF4E8',
  },
  silverIcon: {
    backgroundColor: '#F0F0F0',
  },
  goldenIcon: {
    backgroundColor: '#FFF8E1',
  },
  tierInfo: {
    flex: 1,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  tierName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  claimButton: {
    borderBottomColor: colors.primary,
    borderBottomWidth: 1,
  },
  claimText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  progressText: {
    fontSize: 13,
    color: '#8A8A8E',
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: '#EDEDED',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  rewardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardText: {
    fontSize: 14,
    color: '#8A8A8E',
  },
  coinsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  coinsAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  coinEmoji: {
    fontSize: 20,
  },
});

export default RewardsMilestonesBottomSheet;
