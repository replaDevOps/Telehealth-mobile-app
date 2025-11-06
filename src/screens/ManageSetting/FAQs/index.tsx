import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header2 } from '../../../components/common/Header2';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { colors } from '../../../styles/colors';
import { mvs } from '@config/metrices';
import { styles } from './style';

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

export const FAQs = ({ navigation }: { navigation: any }) => {
  const [expandedId, setExpandedId] = useState<number | null>(1);

  const faqData: FAQ[] = [
    {
      id: 1,
      question: 'How can I book a consultation?',
      answer:
        'You can book a consultation by selecting your preferred clinic and tapping the "Consult Now" button. The system will automatically connect you with an available doctor.',
    },
    {
      id: 2,
      question: 'Can I choose a specific doctor?',
      answer:
        'Yes, you can choose a specific doctor from our list of available healthcare professionals. Simply browse through the doctors profiles and select your preferred specialist.',
    },
    {
      id: 3,
      question: 'Can I download my prescription later?',
      answer:
        'Yes, all your prescriptions are saved in your profile and can be downloaded at any time. Go to your consultation history and tap on the download icon next to each prescription.',
    },
    {
      id: 4,
      question: 'Is my chat or call private and secure?',
      answer:
        'Absolutely! All consultations are end-to-end encrypted and comply with medical privacy standards. Your personal health information is completely confidential and secure.',
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
      <Header2 title="FAQ's" />

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
