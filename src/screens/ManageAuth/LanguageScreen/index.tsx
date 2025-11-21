import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { styles } from './styles';
import { Header2 } from '../../../components/common/Header2';
import CustomText from '../../../components/common/CustomText';
import { AmericaFlgSvg, SaudiFlgSvg } from '../../../assets/icons';
import { mvs } from '../../../config/metrices';
import { CustomButton } from '../../../components/common/CustomButton';
import { useNavigation } from '@react-navigation/native';
import { LanguageSelection } from '@assets/images';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../styles/colors';
import { useTranslation } from 'react-i18next';

export function LanguageScreen() {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();

  const handleNext = () => {
    navigation.navigate('Auth', { screen: 'Onboarding' });
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <Header2 title="" back={false} />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={{ marginBottom: mvs(50) }}>
          <Image source={LanguageSelection} style={styles.image} />

          <View style={styles.content}>
            <View style={{ ...styles.title }}>
              <CustomText text={t('select_language')} />
            </View>
            <View style={styles.content}>
              <Text style={styles.TextContent}>
                {t('choose_language')}
              </Text>
            </View>
          </View>

          <View style={styles.languageRow}>
            <TouchableOpacity
              style={[
                styles.langOption,
                i18n.language === 'en' && styles.activeLangOption,
              ]}
              onPress={() => i18n.changeLanguage('en')}
            >
              <View style={styles.langOptionInner}>
                <View style={styles.radioOuter}>
                  {i18n.language === 'en' && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.langText}>{t('english')}</Text>
              </View>
              <AmericaFlgSvg />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.langOption,
                i18n.language === 'ar' && styles.activeLangOption,
              ]}
              onPress={() => i18n.changeLanguage('ar')}
            >
              <View style={styles.langOptionInner}>
                <View style={styles.radioOuter}>
                  {i18n.language === 'ar' && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.langText}>{t('arabic')}</Text>
              </View>
              <SaudiFlgSvg />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <View style={styles.button}>
        <CustomButton title={t('next')} onPress={handleNext} />
      </View>
    </SafeAreaView>
  );
}
