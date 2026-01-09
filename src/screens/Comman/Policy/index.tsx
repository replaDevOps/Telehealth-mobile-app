import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Header2 } from '@components/common/Header2';
import { useTranslation } from 'react-i18next';
import { useRoute, RouteProp } from '@react-navigation/native';
import { styles } from './style';
import { SafeAreaView } from 'react-native-safe-area-context';

type PolicyRouteParams = {
    policyType: 'loyalty' | 'refund';
};

export const Policy = () => {
    const { t } = useTranslation();
    const route = useRoute<RouteProp<{ params: PolicyRouteParams }, 'params'>>();
    const { policyType } = route.params || { policyType: 'refund' };

    const isLoyalty = policyType === 'loyalty';

    const renderBullet = (textKey: string) => (
        <View style={styles.bulletContainer}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>{t(textKey)}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Header2 title={isLoyalty ? t('loyalty_program_policy') : t('refund_policy')} />
            <ScrollView contentContainerStyle={styles.contentContainer}>
                {isLoyalty ? (
                    <>
                        <Text style={styles.sectionTitle}>{t('loyalty_policy_content_1_title')}</Text>
                        <Text style={styles.description}>{t('loyalty_policy_content_1_desc')}</Text>

                        <Text style={styles.sectionTitle}>{t('loyalty_policy_content_2_title')}</Text>
                        <Text style={styles.description}>{t('loyalty_policy_content_2_desc')}</Text>
                        {renderBullet('loyalty_policy_bullet_1')}
                        {renderBullet('loyalty_policy_bullet_2')}
                        {renderBullet('loyalty_policy_bullet_3')}
                    </>
                ) : (
                    <>
                        <Text style={styles.sectionTitle}>{t('refund_policy_content_1_title')}</Text>
                        <Text style={styles.description}>{t('refund_policy_content_1_desc')}</Text>

                        <Text style={styles.sectionTitle}>{t('refund_policy_content_2_title')}</Text>
                        <Text style={styles.description}>{t('refund_policy_content_2_desc')}</Text>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};
