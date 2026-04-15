import { Header2 } from '@components/common/Header2';
import React, { useState, useCallback } from 'react';
import { View, FlatList, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { mvs } from '@config/metrices';
import { styles } from './style';
import { useTranslation } from 'react-i18next';
import { ClinicCard } from '../LoyaltyPointsDetails/components';
import { apiClient } from '@services/api/api-client';
import { API } from '@services/api/api-endpoint';
import { RecommandImage } from '@assets/images';
import { colors } from '../../../styles/colors';
import { useFocusEffect } from '@react-navigation/native';
import { RewardsMilestonesBottomSheet } from '@components/molecules';
import { MILESTONETIERS } from '@constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const RoyaltyPoints = ({ navigation }) => {
  const inset = useSafeAreaInsets();
  const { t } = useTranslation();
  const [loyaltyPointsData, setLoyaltyPointsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const recordsPerPage = 10;

  const fetchLoyaltyPoints = async (pageNo: number = 1, append: boolean = false, isRefresh: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else if (isRefresh) {
        setRefreshing(true);
        setCurrentPage(1);
        setHasMore(true);
      } else {
        setLoading(true);
        setCurrentPage(1);
        setHasMore(true);
      }
      setError(null);
      const response = await apiClient.get(API.SETTINGS.LOYALTY_POINTS, {
        params: {
          pageNo: pageNo,
          recordsPerPage: recordsPerPage,
        },
      });
      console.log("🚀 ~ fetchLoyaltyPoints ~ response:", response);
      console.log("🚀 ~ fetchLoyaltyPoints ~ response.data:", response.data);
      
      // API response structure with pagination:
      // {
      //   success: true,
      //   total: 3,
      //   currentPage: 2,
      //   perPage: 1,
      //   nextPageUrl: "...",
      //   previousPageUrl: "...",
      //   data: [...] // or clinics: [...]
      // }
      const responseData = response.data;
      
      // Extract data array - check multiple possible locations
      let clinicsList: any[] = [];
      if (Array.isArray(responseData)) {
        // Response is an array directly (legacy format)
        clinicsList = responseData;
      } else if (Array.isArray(responseData?.data)) {
        // Data is in response.data.data
        clinicsList = responseData.data;
      } else if (Array.isArray(responseData?.clinics)) {
        // Data is in response.data.clinics
        clinicsList = responseData.clinics;
      }
      
      console.log("🚀 ~ fetchLoyaltyPoints ~ clinicsList:", clinicsList);
      
      // Check if there's more data using nextPageUrl from backend
      const hasMoreData = !!(responseData?.nextPageUrl);
      setHasMore(hasMoreData);
      
      if (responseData?.success !== false && clinicsList.length > 0) {
        const getCategories = (businessType: string | undefined): string[] => {
          if (!businessType || typeof businessType !== 'string') return ['General'];
          const trimmed = businessType.trim();
          if (trimmed.toLowerCase() === 'both') return ['Dentistry', 'Dermatology'];
          const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
          return [capitalized];
        };

        // Map API response to expected format
        const mappedData = clinicsList.map((item: any, index: number) => {
          const clinicId = item.clinicID?.toString() || item.clinic?.id?.toString() || index.toString();
          const clinicName = item.clinic?.clinicName || item.clinicName || 'Unknown Clinic';
          const points = item.total_loyalty_points || item.totalLoyaltyPoints || 0;
          const image = item.clinic?.image 
            ? { uri: item.clinic.image } 
            : item.clinicImage 
            ? (typeof item.clinicImage === 'string' ? { uri: item.clinicImage } : item.clinicImage)
            : RecommandImage;
          const businessType = item.clinic?.businessType || item.businessType;
          const categories = getCategories(businessType);
          const category = categories[0] ?? 'General';
          
          console.log(`Mapped item ${index}:`, { clinicId, clinicName, points, categories });
          
          return {
            id: clinicId,
            clinicId: clinicId,
            clinicName: clinicName,
            points: points,
            image: image,
            category: category,
            categories: categories,
          };
        });

        console.log("🚀 ~ fetchLoyaltyPoints ~ mappedData:", mappedData);
        
        if (append) {
          setLoyaltyPointsData(prev => [...prev, ...mappedData]);
        } else {
          setLoyaltyPointsData(mappedData);
        }
        
        // Update current page from backend response
        if (responseData?.currentPage) {
          setCurrentPage(responseData.currentPage);
        } else if (mappedData.length > 0) {
          setCurrentPage(pageNo);
        }
      } else {
        console.log("🚀 ~ fetchLoyaltyPoints ~ No clinics found in response");
        if (!append) {
          setLoyaltyPointsData([]);
        }
        setHasMore(false);
      }
    } catch (error: any) {
      console.error('Error fetching loyalty points:', error);
      setError(error?.response?.data?.message || error?.message || t('failed_to_load_loyalty_points') || 'Failed to load loyalty points');
      if (!append) {
        setLoyaltyPointsData([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      fetchLoyaltyPoints(currentPage + 1, true);
    }
  };

  // Fetch data on mount and when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchLoyaltyPoints(1, false);
    }, [])
  );

  const handlePointDetails = (item: any) => {
    navigation.navigate('LoyaltyPointsDetails', {
      clinicId: item.clinicId,
      clinicName: item.clinicName,
      clinicImage: item.image,
      totalPoints: item.points,
      category: item.categories || item.category,
    });
  };

  const renderItem = ({ item }) => (
    <ClinicCard
      clinicImage={item.image}
      category={item.categories}
      clinicName={item.clinicName}
      totalPoints={item.points}
      handlePress={() => handlePointDetails(item)}
    />
  );

  const renderEmptyComponent = () => {
    if (loading) {
      return (
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 16, color: colors.secondaryText }}>
            {t('loading') || 'Loading...'}
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={{ justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
          <Text style={{ color: colors.red, textAlign: 'center', marginBottom: 16 }}>
            {error}
          </Text>
        </View>
      );
    }

    return (
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.secondaryText, textAlign: 'center' }}>
          {t('no_loyalty_points_found') || 'No loyalty points found'}
        </Text>
      </View>
    );
  };

  const handleClaim = (tierName: string) => {
    console.log(`Claiming reward for ${tierName}`);
  };

  return (
    <View style={[styles.container,{ paddingTop: inset.top }]}>
      <Header2 
        title={t('loyalty_points')}
        rightElement={
          <TouchableOpacity 
            onPress={() => setShowHowItWorks(true)}
            activeOpacity={0.7}
          >
            <Text style={headerStyles.howItWorksText}>{t('how_it_works') || 'How it works'}</Text>
          </TouchableOpacity>
        }
      />
      <View style={{ flex: 1, paddingHorizontal: 20, marginTop: mvs(20) }}>
        <FlatList
          data={loyaltyPointsData}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={[
            // styles.listContainer,
            loyaltyPointsData.length === 0 && { flexGrow: 1, justifyContent: 'center' }
          ]}
          ListEmptyComponent={renderEmptyComponent}
          refreshing={refreshing}
          onRefresh={() => fetchLoyaltyPoints(1, false, true)}
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
      </View>
      
      <RewardsMilestonesBottomSheet
        visible={showHowItWorks}
        onClose={() => setShowHowItWorks(false)}
        tiers={MILESTONETIERS}
        onClaim={handleClaim}
      />
    </View>
  );
};

const headerStyles = StyleSheet.create({
  howItWorksText: {
    color: colors.primary,
    fontSize: mvs(14),
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
});
