import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header2 } from '../../../components/common/Header2';
import { colors } from '../../../styles/colors';
import { styles } from './style';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../../services/api/api-client';
import { API } from '../../../services/api/api-endpoint';
import { Toast } from 'toastify-react-native';
import RenderHtml from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';

interface PolicyScreenProps {
  navigation: any;
  route: {
    params: {
      type: 'privacy' | 'terms';
    };
  };
}

export const PolicyScreen = ({ navigation, route }: PolicyScreenProps) => {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  const policyType = route.params?.type || 'privacy';
  const isPrivacy = policyType === 'privacy';

  useEffect(() => {
    fetchPolicyContent();
  }, [policyType]);

  const fetchPolicyContent = async () => {
    setLoading(true);
    
    try {
      const endpoint = isPrivacy ? API.CLINIC.PRIVACY_POLICY : API.CLINIC.TERMS_CONDITIONS;
      const response = await apiClient.get(endpoint);
        console.log('Policy API response:', response.data);
      if (response.data?.success === false) {
        const errorMessage = response.data?.message || 'Failed to fetch policy';
        Toast.error(errorMessage);
        setLoading(false);
        return;
      }

      // Extract content from response
      // Handle different possible response structures
      const responseData = response.data?.data || response.data;
      let policyContent = '';

      if (typeof responseData === 'string') {
        policyContent = responseData;
      } else if (responseData?.content) {
        policyContent = responseData.content;
      } else if (responseData?.description) {
        policyContent = responseData.description;
      } else if (responseData?.text) {
        policyContent = responseData.text;
      } else if (isPrivacy && responseData?.privacy) {
        policyContent = responseData.privacy;
      } else if (!isPrivacy && responseData?.terms) {
        policyContent = responseData.terms;
      }

      setContent(policyContent);
    } catch (error: any) {
      console.error('Error fetching policy:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to fetch policy';
      Toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    return isPrivacy 
      ? t('privacy_policy') || 'Privacy Policy' 
      : t('terms_conditions') || 'Terms & Conditions';
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
        <Header2 title={getTitle()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('loading') || 'Loading...'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <Header2 title={getTitle()} />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {content ? (
          <View style={styles.contentWrapper}>
            <RenderHtml
              contentWidth={width}
              source={{ html: content }}
              tagsStyles={{
                p: { fontSize: 15, lineHeight: 24, color: colors.text, marginBottom: 12 },
                h1: { fontSize: 20, fontWeight: '700', color: colors.black, marginBottom: 16, marginTop: 8 },
                h2: { fontSize: 18, fontWeight: '600', color: colors.black, marginBottom: 14, marginTop: 8 },
                h3: { fontSize: 16, fontWeight: '600', color: colors.black, marginBottom: 12, marginTop: 8 },
                li: { fontSize: 15, lineHeight: 22, color: colors.text, marginBottom: 8 },
                ul: { marginBottom: 12 },
                ol: { marginBottom: 12 },
                strong: { fontWeight: '700' },
                b: { fontWeight: '700' },
              }}
            />
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {isPrivacy 
                ? t('no_privacy_policy') || 'No privacy policy available at the moment.'
                : t('no_terms') || 'No terms and conditions available at the moment.'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
