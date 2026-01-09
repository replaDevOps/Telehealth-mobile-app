import { Header2 } from '@components/common/Header2';
import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { mvs } from '@config/metrices';
import { coinIcon, RecommandImage } from '@assets/images';
import { useTranslation } from 'react-i18next';
import { styles } from './style';
import { RewardSvg } from '@assets/icons';
import {
  GenericTabs,
  RewardsMilestonesBottomSheet,
  TabItem,
} from '@components/molecules';
import { LOYALTYPOINTSOFCLINICS, MILESTONETIERS } from '@constants';
import { ClinicCard } from './components';

type PointsTab = 'earned' | 'used';

export const LoyaltyPointsDetails = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  type RouteParams = {
    clinicId?: string;
    clinicName?: string;
    clinicImage?: any;
    totalPoints?: number;
    category?: string;
  };

  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { params = {} } = route;

  const {
    clinicId = '',
    clinicName = 'Unknown Clinic',
    clinicImage = RecommandImage,
    totalPoints = 0,
    category = 'Clinic',
  } = params;

  const [activeTab, setActiveTab] = useState<PointsTab>('earned');
  const [showRewards, setShowRewards] = useState(false);

  const handleClaim = (tierName: string) => {
    console.log(`Claiming reward for ${tierName}`);
  };

  const allTransactions = LOYALTYPOINTSOFCLINICS[clinicId] || [];

  const filteredTransactions = useMemo(() => {
    if (activeTab === 'earned') {
      return allTransactions.filter(item => !item.isUsed);
    }
    return allTransactions.filter(item => item.isUsed);
  }, [allTransactions, activeTab]);

  const pointsTabs: TabItem<PointsTab>[] = [
    { key: 'earned', label: t('points_earned') },
    { key: 'used', label: t('points_used') },
  ];

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.leftSection}>
        <Text style={styles.centerName}>{item.serviceName}</Text>
        <Text style={styles.transactionId}>{item.transactionId}</Text>
      </View>

      <View style={styles.rightSection}>
        <View style={styles.pointsContainer}>
          <Image source={coinIcon} style={{ width: 16, height: 16 }} />
          <Text
            style={[
              styles.points,
              item.isUsed ? styles.negativePoints : styles.positivePoints,
            ]}
          >
            {item.isUsed ? '-' : '+'}
            {item.points} <Text style={styles.pointsText}>{t('point')}</Text>
          </Text>
        </View>
        <Text style={styles.price}>{item.price}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header2
        title={t('history')}
        howItWork={true}
        handleHowItWork={() =>
          navigation.navigate('Main', {
            screen: 'Policy',
            params: { policyType: 'loyalty' },
          })
        }
      />

      <ClinicCard
        clinicImage={clinicImage}
        category={category}
        clinicName={clinicName}
        totalPoints={totalPoints}
      />

      <GenericTabs
        tabs={pointsTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        translateLabels={true}
      />

      <View style={{ flex: 1, paddingHorizontal: 20, marginTop: mvs(20) }}>
        <FlatList
          data={filteredTransactions}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 20, color: '#666' }}>
              {activeTab === 'earned'
                ? t('no_points_earned_yet') || 'No points earned yet'
                : t('no_points_used_yet') || 'No points used yet'}
            </Text>
          }
        />

        <TouchableOpacity
          style={styles.rewardView}
          onPress={() => setShowRewards(true)}
        >
          <RewardSvg />
        </TouchableOpacity>

        <RewardsMilestonesBottomSheet
          visible={showRewards}
          onClose={() => setShowRewards(false)}
          tiers={MILESTONETIERS}
          onClaim={handleClaim}
        />
      </View>
    </View>
  );
};
