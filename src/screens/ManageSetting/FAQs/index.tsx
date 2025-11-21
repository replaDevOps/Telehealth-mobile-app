import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header2 } from '../../../components/common/Header2';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { colors } from '../../../styles/colors';
import { mvs } from '@config/metrices';
import { styles } from './style';
import { useTranslation } from 'react-i18next';

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

export const FAQs = ({ navigation }: { navigation: any }) => {
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState<number | null>(1);

  const faqData: FAQ[] = [
    {
      id: 1,
      question: t('how_to_book_consultation'),
      answer: t('how_to_book_consultation_answer'),
    },
    {
      id: 2,
      question: t('can_i_choose_specific_doctor'),
      answer: t('can_i_choose_specific_doctor_answer'),
    },
    {
      id: 3,
      question: t('can_i_download_prescription_later'),
      answer: t('can_i_download_prescription_later_answer'),
    },
    {
      id: 4,
      question: t('is_chat_private_secure'),
      answer: t('is_chat_private_secure_answer'),
    },
  ];

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <Header2 title={t('faqs_title')} />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: mvs(20) }}
      >
        <View style={styles.faqContainer}>{faqData.map(renderFAQItem)}</View>
      </ScrollView>
    </SafeAreaView>
  );
};
