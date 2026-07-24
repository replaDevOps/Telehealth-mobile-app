import React, { useState, useEffect } from 'react';
import { Text, ScrollView, ActivityIndicator, View } from 'react-native';
import { Header2 } from '@components/common/Header2';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiClient } from '@services/api/api-client';
import { API } from '@services/api/api-endpoint';
import { colors } from '../../../styles/colors';
import { styles } from './style';

type RefundPolicySection = { title?: string; description?: string; content?: string };

/** Strip HTML tags and decode common entities for plain-text display. */
function stripHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

export const RefundPolicy = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sections, setSections] = useState<RefundPolicySection[]>([]);
  const [rawContent, setRawContent] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchRefundPolicy = async () => {
      try {
        setError(null);
        const response = await apiClient.get(API.HISTORY.REFUND_POLICY);
        if (cancelled) return;
        // API response: { success: true, data: { id, description, created_at, updated_at } }
        const payload = response.data;
        if (payload?.success === false) {
          setError(payload?.message || t('failed_to_load') || 'Failed to load');
          setSections([]);
          setRawContent(null);
          return;
        }
        const data = payload?.data;
        if (data == null) {
          setSections([]);
          setRawContent(null);
          return;
        }
        if (typeof data === 'string') {
          setRawContent(data);
          setSections([]);
          return;
        }
        const description = (data as { description?: string }).description;
        if (typeof description === 'string' && description.trim().length > 0) {
          setRawContent(description);
          setSections([]);
        } else {
          setSections([]);
          setRawContent(null);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.response?.data?.message || err?.message || t('failed_to_load') || 'Failed to load');
          setSections([]);
          setRawContent(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchRefundPolicy();
    return () => { cancelled = true; };
  }, [t]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header2 title={t('refund_policy')} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const hasContent = sections.length > 0 || (rawContent != null && rawContent.trim().length > 0);
  const showFallback = !hasContent || error;

  return (
    <SafeAreaView style={styles.container}>
      <Header2 title={t('refund_policy')} />
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}
        {rawContent != null && rawContent.trim().length > 0 ? (
          <Text style={styles.description}>{stripHtml(rawContent)}</Text>
        ) : null}
        {sections.map((sec, index) => (
          <React.Fragment key={index}>
            {sec.title ? <Text style={styles.sectionTitle}>{sec.title}</Text> : null}
            <Text style={styles.description}>
              {sec.description ?? sec.content ?? ''}
            </Text>
          </React.Fragment>
        ))}
        {showFallback && !error ? (
          <>
            <Text style={styles.sectionTitle}>{t('refund_policy_content_1_title')}</Text>
            <Text style={styles.description}>{t('refund_policy_content_1_desc')}</Text>
            <Text style={styles.sectionTitle}>{t('refund_policy_content_2_title')}</Text>
            <Text style={styles.description}>{t('refund_policy_content_2_desc')}</Text>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};