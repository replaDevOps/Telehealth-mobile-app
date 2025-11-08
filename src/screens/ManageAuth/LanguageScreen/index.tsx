import React, { useState } from 'react';
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

export function LanguageScreen() {
  const navigation = useNavigation();
  const [selectedLang, setSelectedLang] = useState<'en' | 'ar'>('en');

  const handleNext = () => {
    console.log('Selected Language:', selectedLang);

    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Auth', { screen: 'Onboarding' });
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.white,
      }}
    >
      <Header2 title="" back={false} />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={{ marginBottom: mvs(50) }}>
          <Image source={LanguageSelection} style={styles.image} />

          <View style={styles.content}>
            <View style={{ ...styles.title }}>
              <CustomText text="Select Language" />
            </View>
            <View style={styles.content}>
              <Text style={styles.TextContent}>
                Choose your preferred language.
              </Text>
            </View>
          </View>

          <View style={styles.languageRow}>
            <TouchableOpacity
              style={[
                styles.langOption,
                selectedLang === 'en' && styles.activeLangOption,
              ]}
              onPress={() => setSelectedLang('en')}
            >
              <View style={{ flexDirection: 'row', gap: mvs(10) }}>
                <View style={styles.radioOuter}>
                  {selectedLang === 'en' && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.langText}>Eng</Text>
              </View>
              <AmericaFlgSvg />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.langOption,
                selectedLang === 'ar' && styles.activeLangOption,
              ]}
              onPress={() => setSelectedLang('ar')}
            >
              <View style={{ flexDirection: 'row', gap: mvs(10) }}>
                <View style={styles.radioOuter}>
                  {selectedLang === 'ar' && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.langText}>Arabic</Text>
              </View>
              <SaudiFlgSvg />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <View style={styles.button}>
        <CustomButton title="Next" onPress={handleNext} />
      </View>
    </SafeAreaView>
  );
}
