import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Header2 } from '../../../components/common/Header2';
import { CustomButton } from '../../../components/common/CustomButton';
import { styles } from './styles';
import { FeatureItem } from './Components';
import { ONBOARDING_STEPS } from '../../../constants';
import { colors } from '../../../styles/colors';
import { SafeAreaView } from 'react-native-safe-area-context';

export function OnboardingScreen({ navigation }: any) {
  const [currentStep, setCurrentStep] = useState<number>(0);

  const handleNext = () => {
    console.log('Next button pressed');
    setCurrentStep(prev => {
      if (prev === ONBOARDING_STEPS.length - 1) {
        navigation.replace('SignIn');
        return prev;
      }
      return prev + 1;
    });
  };

  const activeStep = ONBOARDING_STEPS[currentStep];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <Header2
        title=""
        back={false}
        useSkip={true}
        handleSkip={() => {
          console.log('Skip pressed');
          navigation.replace('Auth', { screen: 'SignIn' });
        }}
      />

      <ScrollView contentContainerStyle={styles.container}>
        <FeatureItem
          title={activeStep?.title}
          content={activeStep?.content}
          imgSrc={activeStep?.imgSrc}
          currentStep={currentStep} // ✅ pass current step
        />
      </ScrollView>

      <View style={styles.button}>
        <CustomButton title="Next" onPress={handleNext} />
      </View>
    </SafeAreaView>
  );
}
