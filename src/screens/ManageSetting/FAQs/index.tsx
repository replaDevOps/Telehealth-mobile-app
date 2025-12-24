import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header2 } from '../../../components/common/Header2';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { colors } from '../../../styles/colors';
import { mvs } from '@config/metrices';
import { styles } from './style';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../../services/api/api-client';
import { API } from '../../../services/api/api-endpoint';
import { tryCatch } from '../../../utils';
import { Toast } from 'toastify-react-native';

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

export const FAQs = ({ navigation }: { navigation: any }) => {
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [faqData, setFaqData] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    setLoading(true);
    const [res, err] = await tryCatch(
      apiClient.get(API.SETTINGS.FAQs),
    );

    if (err) {
      const errorMessage = (err as Error).message || 'Failed to fetch FAQs';
      Toast.error(errorMessage);
      setLoading(false);
      return;
    }

    // Check if API returned success: false (even with 200 status)
    const responseData = res.data?.data || res.data;
    if (res.data?.success === false || responseData?.success === false) {
      const errorMessage = responseData?.message || res.data?.message || 'Failed to fetch FAQs';
      Toast.error(errorMessage);
      setLoading(false);
      return;
    }

    // Extract FAQs array from response
    // Handle both array directly or nested in data property
    let faqs: FAQ[] = [];
    if (Array.isArray(responseData)) {
      faqs = responseData;
    } else if (Array.isArray(res.data)) {
      faqs = res.data;
    } else if (responseData?.faqs && Array.isArray(responseData.faqs)) {
      faqs = responseData.faqs;
    }

    // Map API response to FAQ interface
    // Handle different possible field names (question/Question, answer/Answer, etc.)
    const mappedFAQs: FAQ[] = faqs.map((faq: any, index: number) => ({
      id: faq.id || faq.ID || index + 1,
      question: faq.question || faq.Question || faq.title || faq.Title || '',
      answer: faq.answer || faq.Answer || faq.description || faq.Description || '',
    })).filter((faq: FAQ) => faq.question && faq.answer); // Filter out invalid FAQs

    setFaqData(mappedFAQs);
    
    // Auto-expand first FAQ if available
    if (mappedFAQs.length > 0) {
      setExpandedId(mappedFAQs[0].id);
    }
    
    setLoading(false);
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderFAQItem = (item: FAQ) => {
    const isExpanded = expandedId === item.id;

    return (
      <View key={item.id} style={styles.faqItem}>
        <TouchableOpacity
          style={styles.faqHeader}
          onPress={() => toggleExpand(item.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.faqQuestion}>{item.question}</Text>
          <AntDesign
            name={isExpanded ? 'up' : 'down'}
            size={16}
            color={colors.black}
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.faqAnswerContainer}>
            <Text style={styles.faqAnswer}>{item.answer}</Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
        <Header2 title={t('faqs_title')} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('loading') || 'Loading...'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <Header2 title={t('faqs_title')} />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: mvs(20) }}
      >
        {faqData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {t('no_faqs_found') || 'No FAQs available at the moment.'}
            </Text>
          </View>
        ) : (
        <View style={styles.faqContainer}>{faqData.map(renderFAQItem)}</View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
