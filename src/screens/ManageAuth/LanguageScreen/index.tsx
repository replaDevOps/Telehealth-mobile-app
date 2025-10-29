import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './styles';
import { Header2 } from '../../../components/common/Header2';
import CustomText from '../../../components/common/CustomText';
import { AmericaFlgSvg, SaudiFlgSvg } from '../../../assets/icons';
import { mvs } from '../../../config/metrices';
import { CustomButton } from '../../../components/common/CustomButton';
import { useNavigation } from '@react-navigation/native';

export function LanguageScreen() {
  const navigation = useNavigation();
  const [selectedLang, setSelectedLang] = useState<'en' | 'ar'>('en');

  const handleNext = () => {
    console.log('Selected Language:', selectedLang);

    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Main', { screen: 'Home' });
    }
  };

  return (
    <View style={styles.container}>
      <Header2 title="" back={false} useSkip={false} />

      <View style={styles.image}></View>

      <View>
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

      <CustomButton title="Next" onPress={handleNext} />
    </View>
  );
}
