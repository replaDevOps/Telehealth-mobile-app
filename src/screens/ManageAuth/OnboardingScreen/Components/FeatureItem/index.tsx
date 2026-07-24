import React from 'react';
import { Image, Text, View } from 'react-native';
import { styles } from './styles';
import { FeatureItemProps } from './props';
import CustomText from '../../../../../components/common/CustomText';
import { colors } from '../../../../../styles/colors';
import { mvs } from '../../../../../config/metrices';
import { ONBOARDING_STEPS } from '@constants';

export const FeatureItem = ({
  title,
  content,
  imgSrc,
  currentStep = 0,
}: FeatureItemProps & { currentStep?: number }) => {
  return (
    <View style={styles.containner}>
      <Image source={imgSrc} style={styles.image} />

      <View style={styles.content}>
        <View style={styles.title}>
          <CustomText text={title} />
        </View>
        <View style={styles.content}>
          <Text style={styles.TextContent}>{content}</Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
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
      </View>
    </View>
  );
};

export default FeatureItem;
