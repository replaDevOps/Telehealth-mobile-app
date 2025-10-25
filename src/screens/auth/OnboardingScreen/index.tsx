import React, { useState } from 'react';
import { View } from 'react-native';
import { Header2 } from '../../../components/common/Header2';
import { CustomButton } from '../../../components/common/CustomButton';
import { styles } from './styles';
import { FeatureItem } from './Components';
import { ONBOARDING_STEPS } from '../../../constants';

export default function OnboardingScreen({ navigation }: any) {
  const handleNext = () => {
    console.log('Next button pressed');
    setCurrentStep(prev => (prev === 2 ? prev : ++prev));
  };

  const [currentStep, setCurrentStep] = useState<number>(0);

  const activeStep = ONBOARDING_STEPS[currentStep];
  return (
    <View style={{ ...styles.container }}>
      <Header2
        title=""
        back={true}
        useSkip={true}
        handleSkip={() => console.log('Skip pressed')}
        handleBackPress={() => {
          if (currentStep === 0) {
            navigation.goBack();
          } else {
            setCurrentStep(prev => --prev);
          }
        }}
      />

      <FeatureItem
        title={activeStep?.title}
        content={activeStep?.content}
        imgSrc={activeStep?.imgSrc}
      />

      <CustomButton title="Next" onPress={handleNext} disabled={false} />
    </View>
  );
}
