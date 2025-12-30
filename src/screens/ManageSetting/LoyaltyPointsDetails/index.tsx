import { Header2 } from '@components/common/Header2';
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
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
import { MILESTONETIERS } from '@constants';
import { ClinicCard } from './components';
import { apiClient } from '@services/api/api-client';
import { API } from '@services/api/api-endpoint';
import { colors } from '../../../styles/colors';

type PointsTab = 'earned' | 'used';

export const LoyaltyPointsDetails = () => {
  const { t } = useTranslation();

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
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const recordsPerPage = 10;

  const handleClaim = (tierName: string) => {
    console.log(`Claiming reward for ${tierName}`);
  };

  const fetchTransactions = async (pageNo: number = 1, append: boolean = false) => {
    if (!clinicId) {
      setLoading(false);
      return;
    }

    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setCurrentPage(1);
        setHasMore(true);
      }
      setError(null);
      
      const endpoint = activeTab === 'earned' 
        ? API.SETTINGS.LOYALTY_POINTS_EARNED
        : API.SETTINGS.LOYALTY_POINTS_USED;
      
      const response = await apiClient.get(endpoint, {
        params: {
          clinicID: clinicId,
          pageNo: pageNo,
          recordsPerPage: recordsPerPage,
        },
      });
      console.log("🚀 ~ fetchTransactions ~ response:",endpoint, response);
      
      // API response structure with pagination:
      // {
      //   success: true,
      //   total: 3,
      //   currentPage: 2,
      //   perPage: 1,
      //   nextPageUrl: "...",
      //   previousPageUrl: "...",
      //   data: [...]
      // }
      const responseData = response.data;
      
      // Extract data array
      let transactionsList: any[] = [];
      if (Array.isArray(responseData)) {
        transactionsList = responseData;
      } else if (Array.isArray(responseData?.data)) {
        transactionsList = responseData.data;
      } else if (Array.isArray(responseData?.transactions)) {
        transactionsList = responseData.transactions;
      } else if (Array.isArray(responseData?.points)) {
        transactionsList = responseData.points;
      }
        
        console.log('🚀 ~ fetchTransactions ~ transactionsList:', transactionsList);
        
        // Check if there's more data using nextPageUrl from backend
        const hasMoreData = !!(responseData?.nextPageUrl);
        setHasMore(hasMoreData);
        
        if (responseData?.success !== false && transactionsList.length > 0) {
        
        // Map API response to expected format
        const mappedTransactions = transactionsList.map((item: any, index: number) => {
          // Format date from ISO string to readable format
          let formattedDate = '';
          if (item.expiry_date || item.date || item.created_at || item.createdAt) {
            const dateStr = item.expiry_date || item.date || item.created_at || item.createdAt;
            try {
              const date = new Date(dateStr);
              formattedDate = date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              });
            } catch (e) {
              formattedDate = dateStr;
            }
          }

          return {
            id: item.id?.toString() || item.transactionID?.toString() || index.toString(),
            serviceName: item.service_name || item.serviceName || item.service?.name || item.name || 'Service',
            serviceImage: item.service_image || item.serviceImage || item.image || null,
            transactionId: item.transactionId || item.transactionID || item.id?.toString() || `TXN-${index}`,
            points: item.loyalty_points || item.points || item.loyaltyPoints || item.totalPoints || 0,
            price: item.price || item.amount || item.totalAmount || '0 SAR',
            isUsed: activeTab === 'used',
            date: formattedDate || item.date || item.created_at || item.createdAt || '',
            expiryDate: item.expiry_date || item.expiryDate || null,
          };
        });
        
        console.log('🚀 ~ fetchTransactions ~ mappedTransactions:', mappedTransactions);
        
        if (append) {
          setTransactions(prev => [...prev, ...mappedTransactions]);
        } else {
          setTransactions(mappedTransactions);
        }
        
        // Update current page from backend response
        if (responseData?.currentPage) {
          setCurrentPage(responseData.currentPage);
        } else if (mappedTransactions.length > 0) {
          setCurrentPage(pageNo);
        }
      } else {
        if (!append) {
          setTransactions([]);
        }
        setHasMore(false);
      }
    } catch (error: any) {
      console.error(`Error fetching ${activeTab} points:`, error);
      setError(error?.response?.data?.message || error?.message || t('failed_to_load_points') || 'Failed to load points');
      if (!append) {
        setTransactions([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore && !loading && clinicId) {
      fetchTransactions(currentPage + 1, true);
    }
  };

  // Fetch data when tab changes or screen comes into focus
  useEffect(() => {
    fetchTransactions(1, false);
  }, [activeTab, clinicId]);

  useFocusEffect(
    useCallback(() => {
      fetchTransactions(1, false);
    }, [activeTab, clinicId])
  );

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
      <Header2 title={t('history')} />

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
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ marginTop: 16, color: colors.secondaryText }}>
              {t('loading') || 'Loading...'}
            </Text>
          </View>
        ) : error ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100, paddingHorizontal: 20 }}>
            <Text style={{ color: colors.red, textAlign: 'center' }}>
              {error}
            </Text>
          </View>
        ) : (
          <FlatList
            data={transactions}
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
            refreshing={loading && transactions.length === 0}
            onRefresh={() => fetchTransactions(1, false)}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loadingMore ? (
                <View style={{ paddingVertical: 20 }}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              ) : null
            }
          />
        )}

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
          clinicID={clinicId}
        />
      </View>
    </View>
  );
};
