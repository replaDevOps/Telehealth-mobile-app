import React from 'react';
import { Text, ScrollView } from 'react-native';
import { Header2 } from '@components/common/Header2';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './style';



export const RefundPolicy = () => {
    const { t } = useTranslation();


    return (
        <SafeAreaView style={styles.container}>
            <Header2 title={t('refund_policy')} />
            <ScrollView contentContainerStyle={styles.contentContainer}>

                <Text style={styles.sectionTitle}>{t('refund_policy_content_1_title')}</Text>
                <Text style={styles.description}>{t('refund_policy_content_1_desc')}</Text>

                <Text style={styles.sectionTitle}>{t('refund_policy_content_2_title')}</Text>
                <Text style={styles.description}>{t('refund_policy_content_2_desc')}</Text>

            </ScrollView>
        </SafeAreaView>
    );
};