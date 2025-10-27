import React, { useState } from 'react';
import { View } from 'react-native';
import { Header2 } from '../../../components/common/Header2';
import { CustomButton } from '../../../components/common/CustomButton';
import { styles } from './styles';
import { FeatureItem } from './Components';
import { ONBOARDING_STEPS } from '../../../constants';
import { mvs } from '../../../config/metrices';
import { colors } from '../../../styles/colors';

export default function OnboardingScreen({ navigation }: any) {
  const handleNext = () => {
    console.log('Next button pressed');
    setCurrentStep(prev =>
      prev === 2 ? navigation.navigate('SignUp') : ++prev,
    );
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

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          marginVertical: mvs(20),
        }}
      >
        {ONBOARDING_STEPS.map((_, index) => (
          <View
            key={index}
            style={{
              width: mvs(30),
              height: mvs(5),
              borderRadius: mvs(3),
              marginHorizontal: mvs(5),
              backgroundColor:
                index === currentStep ? colors.primary : colors.border,
            }}
          />
        ))}
      </View>

      <CustomButton title="Next" onPress={handleNext} disabled={false} />
    </View>
  );
}
