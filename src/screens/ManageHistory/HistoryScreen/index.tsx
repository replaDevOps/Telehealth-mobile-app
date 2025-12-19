/* HistoryScreen.tsx - Refactored */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Header2 } from '@components/common/Header2';
import { CustomDropdown } from '@components/common/CustomDropdwon';

import { RecommandImage } from '@assets/images';
import { CONSULTATION_HISTORY, PAYMENT_HISTORY } from '@constants';
import { styles } from '../style';

import type {
  Tab,
  PaymentKind,
  PaymentItem,
  ConsultationItem,
  DropdownOption,
} from '../types/history.types';
import { SearchBar } from 'react-native-screens';
import { ConsultationCard, PaymentCard, HistoryTabs } from '../components';

const DROPDOWN_OPTIONS: DropdownOption[] = [
  { label: 'Consultation', value: 'consultation' },
  { label: 'Appointment', value: 'appointment' },
];

export function HistoryScreen({ navigation }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('consultation');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<PaymentKind | ''>(
    'consultation',
  );

  const filteredPayments = useMemo(() => {
    if (!selectedType) return [];
    return PAYMENT_HISTORY.filter(item => item.kind === selectedType);
  }, [selectedType]);

  const handleNavigateToPrescription = useCallback(() => {
    navigation.navigate('PrescriptionScreen');
  }, [navigation]);

  const handleNavigateToChat = useCallback(() => {
    navigation.navigate('ChatScreen', {
      chatType: 'doctor',
      doctorInfo: {
        id: 'doctor_1',
        name: 'Dr. Sultan Khan',
        avatar: 'https://i.pravatar.cc/150?img=12',
        serviceName: 'Acne Itching Treatment',
      },
      clinicInfo: {
        name: 'Eden Medical Center',
        location: 'Makkah, Saudi Arabia, 2.2km',
        image: RecommandImage,
      },
      fromHistory: true,
    });
  }, [navigation]);

  const handleNavigateToCardDetails = useCallback(
    (item: PaymentItem) => {
      const commonParams = {
        paymentId: item.paymentId,
        clinicName: item.clinicName,
        clinicLocation: item.clinicLocation || '',
        status: item.status,
        statusColor: item.statusColor,
        dateTime: item.date,
        price: item.price,
      };

      if (item.kind === 'consultation') {
        navigation.navigate('CardDetails', {
          ...commonParams,
          consultationType: item.type,
          duration: item.duration,
          doctorName: item.doctorName,
          doctorAvatar: item.doctorAvatar,
          serviceName: item.serviceName,
        });
      } else {
        navigation.navigate('CardDetails', {
          ...commonParams,
          image: item.clinicImg ? RecommandImage : undefined,
          services: item.services || [],
        });
      }
    },
    [navigation],
  );

  const renderConsultationCard = useCallback(
    (item: ConsultationItem) => (
      <ConsultationCard
        key={item.id}
        item={item}
        onPrescriptionPress={handleNavigateToPrescription}
        onChatPress={handleNavigateToChat}
      />
    ),
    [handleNavigateToPrescription, handleNavigateToChat],
  );

  const renderPaymentCard = useCallback(
    (item: PaymentItem) => (
      <PaymentCard
        key={item.id}
        item={item}
        onViewDetails={handleNavigateToCardDetails}
      />
    ),
    [handleNavigateToCardDetails],
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <Header2 title={t('history')} />

      <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

      <HistoryTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'consultation' && (
          <View style={styles.content}>
            {CONSULTATION_HISTORY.map(renderConsultationCard)}
          </View>
        )}

        {activeTab === 'payment' && (
          <View style={styles.content}>
            <CustomDropdown
              label={t('type')}
              placeholder={t('select_type_here')}
              value={selectedType}
              onValueChange={setSelectedType}
              options={DROPDOWN_OPTIONS.map(option => ({
                ...option,
                label: t(option.label.toLowerCase()),
              }))}
            />

            {filteredPayments.map(renderPaymentCard)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
