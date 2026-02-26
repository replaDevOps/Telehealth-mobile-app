import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../styles/colors';
import { useTranslation } from 'react-i18next';
import TierUnlockedModal from './TierUnlockedModal';
import { BroneTierIcon, GoldTierSvg, SilverTierSvg } from '@assets/icons';
import { CustomButton } from '@components/common/CustomButton';
import { apiClient } from '@services/api/api-client';
import { API } from '@services/api/api-endpoint';

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
  tiers?: Tier[];
  onClaim?: (tierName: string) => void;
  clinicID?: string | number;
}

export const RewardsMilestonesBottomSheet = ({
  visible,
  onClose,
  tiers = [],
  onClaim,
  clinicID,
}: RewardsMilestonesBottomSheetProps) => {
  const { t } = useTranslation();
  const [tiersData, setTiersData] = useState<Tier[]>(tiers);
  const [loyaltyDescription, setLoyaltyDescription] = useState<string>('');
  const [loadingDescription, setLoadingDescription] = useState(false);
  const [loadingTiers, setLoadingTiers] = useState(false);
  const [claimingTier, setClaimingTier] = useState<string | null>(null);
  const [resettingTiers, setResettingTiers] = useState(false);

  const [unlockModalVisible, setUnlockModalVisible] = useState(false);
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [selectedTierIcon, setSelectedTierIcon] =
    useState<React.ReactNode | null>(null);

  const progressPercentage = (progress: number, total: number) =>
    Math.min((progress / total) * 100, 100);

  const fetchTierProgress = useCallback(async () => {
    if (!clinicID) return;

    try {
      setLoadingTiers(true);
      const response = await apiClient.get(`${API.SETTINGS.TIER_PROGRESS}?clinicID=${clinicID}`);
      console.log('🚀 ~ fetchTierProgress ~ response:', response);

      // API response structure: { data: { success: true, tier_progress: [...], current_tier: "Bronze" } }
      const responseData = response.data?.data || response.data;

      if (responseData?.success !== false) {
        // Extract tier_progress array from response
        const tiersList = responseData.tier_progress || responseData.tiers || responseData.data || [];
        const currentTier = responseData.current_tier || responseData.currentTier || '';

        console.log('🚀 ~ fetchTierProgress ~ tiersList:', tiersList);
        console.log('🚀 ~ fetchTierProgress ~ currentTier:', currentTier);

        // Map API response to Tier format
        const mappedTiers: Tier[] = tiersList.map((item: any) => {
          // Handle tier name - API returns "Bronze", "Silver", "Gold"
          const tierName = item.tier_name || item.name || item.tierName || '';
          const tierNameFormatted = tierName.includes('Tier')
            ? tierName
            : `${tierName} Tier`;

          // Map fields from API response:
          // - points -> progress (current points)
          // - milestone -> total (required points)
          // - reward -> reward (reward points)
          // - reward_claimed -> isClaimable (if true, reward is already claimed)
          return {
            name: tierNameFormatted,
            icon: item.icon || '',
            progress: item.points || item.progress || item.current_points || item.currentPoints || 0,
            total: item.milestone || item.total || item.required_points || item.requiredPoints || 0,
            reward: item.reward || item.rewardPoints || item.reward_points || 0,
            isClaimable: item.reward_claimed !== undefined
              ? item.reward_claimed
              : item.isClaimable !== undefined
                ? item.isClaimable
                : item.is_claimable !== undefined
                  ? item.is_claimable
                  : item.claimed !== undefined
                    ? item.claimed
                    : false,
            isCurrent: currentTier && tierName.toLowerCase() === currentTier.toLowerCase(),
          };
        });

        console.log('🚀 ~ fetchTierProgress ~ mappedTiers:', mappedTiers);
        setTiersData(mappedTiers);
      } else {
        // If API returns success: false, fallback to provided tiers
        if (tiers && tiers.length > 0) {
          setTiersData(tiers);
        }
      }
    } catch (error: any) {
      console.error('Error fetching tier progress:', error);
      // Fallback to provided tiers if API fails
      if (tiers && tiers.length > 0) {
        setTiersData(tiers);
      }
    } finally {
      setLoadingTiers(false);
    }
  }, [clinicID, tiers]);

  const handleClaimPress = async (tier: Tier) => {
    if (tier.isClaimable || !clinicID) {
      return;
    }

    try {
      setClaimingTier(tier.name);

      // Call claim reward API
      const response = await apiClient.post(API.SETTINGS.CLAIM_REWARD, {
        clinicID: clinicID.toString(),
        tier_name: tier.name.includes('Bronze') ? 'Bronze' : tier.name.includes('Silver') ? 'Silver' : 'Gold',
      });

      if (response.data?.success !== false) {
        // Update tier to claimed
        setTiersData(prev =>
          prev.map(item =>
            item.name === tier.name ? { ...item, isClaimable: true } : item,
          ),
        );

        setSelectedTier(tier);
        setSelectedTierIcon(getTierIcon(tier.name));
        setUnlockModalVisible(true);

        onClaim?.(tier.name);
      } else {
        throw new Error(response.data?.message || 'Failed to claim reward');
      }
    } catch (error: any) {
      console.error('Error claiming reward:', error);
      // Show error message - you might want to add a toast here
    } finally {
      setClaimingTier(null);
    }
  };

  const handleResetTiers = async () => {
    if (!clinicID) return;

    try {
      setResettingTiers(true);
      const response = await apiClient.get(`${API.SETTINGS.RESET_TIERS}?clinicID=${clinicID}`);

      if (response.data?.success !== false) {
        // Refresh tier progress after reset
        await fetchTierProgress();
      } else {
        throw new Error(response.data?.message || 'Failed to reset tiers');
      }
    } catch (error: any) {
      console.error('Error resetting tiers:', error);
      // Show error message - you might want to add a toast here
    } finally {
      setResettingTiers(false);
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

  // Function to strip HTML tags and decode HTML entities
  const stripHtmlTags = (html: string): string => {
    if (!html) return '';

    // Remove HTML tags
    let text = html.replace(/<[^>]*>/g, '');

    // Replace common HTML entities
    text = text
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<p>/gi, '\n')
      .replace(/<\/p>/gi, '');

    // Clean up multiple newlines and spaces
    text = text.replace(/\n\s*\n\s*\n/g, '\n\n');
    text = text.replace(/[ \t]+/g, ' ');
    text = text.trim();

    return text;
  };

  // Fetch loyalty points description and tier progress when modal opens
  useEffect(() => {
    if (visible) {
      if (clinicID) {
        // When opened from detail page with clinicID: fetch tier progress only
        // Clear description to ensure it doesn't show
        setLoyaltyDescription('');
        fetchTierProgress();
      } else {
        // When opened from main page without clinicID: fetch description and use provided tiers
        fetchLoyaltyDescription();
        if (tiers && tiers.length > 0) {
          setTiersData(tiers);
        }
      }
    } else {
      // Reset state when modal closes
      setLoyaltyDescription('');
    }
  }, [visible, clinicID, tiers, fetchTierProgress]);

  const fetchLoyaltyDescription = async () => {
    try {
      setLoadingDescription(true);
      const response = await apiClient.get(API.SETTINGS.LOYALTY_POINTS_DESCRIPTION);
      console.log("response",response)
      if (response.data?.success !== false && response.data?.data) {
        // The API might return description in different formats
        let description = response.data.data.description
          || response.data.data.content
          || response.data.data.text
          || response.data.data;

        if (typeof description === 'string') {
          // Strip HTML tags
          console.log('description', description);
          description = stripHtmlTags(description);
          setLoyaltyDescription(description);
        } else if (description?.description) {
          setLoyaltyDescription(stripHtmlTags(description.description));
        } else if (typeof description === 'object') {
          // Try to find any string value in the object
          const descriptionString = JSON.stringify(description);
          setLoyaltyDescription(stripHtmlTags(descriptionString));
        }
      }
    } catch (error: any) {
      console.error('Error fetching loyalty points description:', error);
      // Keep using the translation as fallback
      setLoyaltyDescription('');
    } finally {
      setLoadingDescription(false);
    }
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
              {/* Show either description OR tiers, not both */}
              {/* When clinicID is provided, show tiers only (no description) */}
              {clinicID ? (
                <>
                  <Text style={styles.title}>{t('rewardsMileStones')}</Text>
                  {loadingTiers ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color={colors.primary} />
                    </View>
                  ) : (
                    <>
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
                                      disabled={tier.isClaimable || claimingTier === tier.name}
                                    >
                                      <Text
                                        style={[
                                          styles.claimText,
                                          tier.isClaimable && styles.claimTextDisabled,
                                        ]}
                                      >
                                        {claimingTier === tier.name
                                          ? (t('claiming') || 'Claiming...')
                                          : !tier.isClaimable
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
                      ) && (
                          <CustomButton
                            title={resettingTiers ? (t('resetting') || 'Resetting...') : t('reset_tiers')}
                            onPress={handleResetTiers}
                            disabled={resettingTiers}
                          />
                        )}
                    </>
                  )}
                </>
              ) : (
                <>
                  {loadingDescription ? (
                    <>
                      <Text style={styles.title}>{t('how_it_works') || 'How it works'}</Text>
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color={colors.primary} />
                      </View>
                    </>
                  ) : loyaltyDescription ? (
                    <>
                      <Text style={styles.title}>{t('how_it_works') || 'How it works'}</Text>
                      <View style={styles.descriptionContainer}>
                        <Text style={styles.descriptionText}>
                          {loyaltyDescription}
                        </Text>
                      </View>
                    </>
                  ) : (
                    <>
                      <Text style={styles.title}>{t('rewardsMileStones')}</Text>
                      <Text style={styles.subtitle}>
                        {t('rewardsMileStonesDescription')}
                      </Text>

                      {loadingTiers ? (
                        <View style={styles.loadingContainer}>
                          <ActivityIndicator size="small" color={colors.primary} />
                        </View>
                      ) : (
                        <>
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
                                          disabled={tier.isClaimable || claimingTier === tier.name}
                                        >
                                          <Text
                                            style={[
                                              styles.claimText,
                                              tier.isClaimable && styles.claimTextDisabled,
                                            ]}
                                          >
                                            {claimingTier === tier.name
                                              ? (t('claiming') || 'Claiming...')
                                              : !tier.isClaimable
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
                          ) && (
                              <CustomButton
                                title={resettingTiers ? (t('resetting') || 'Resetting...') : t('reset_tiers')}
                                onPress={handleResetTiers}
                                disabled={resettingTiers}
                              />
                            )}
                        </>
                      )}
                    </>
                  )}
                </>
              )}
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginBottom: 32,
  },
  descriptionContainer: {
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
    textAlign: 'left',
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
