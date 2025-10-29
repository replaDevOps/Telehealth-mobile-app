import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { styles } from './styles';
import { FeatureItemProps } from './props';
import CustomText from '../../../../../components/common/CustomText';

export const FeatureItem = ({ title, content, imgSrc }: FeatureItemProps) => {
  return (
    <View style={styles.containner}>
      <View style={styles.image}></View>
      <View style={styles.content}>
        <View style={{ ...styles.title }}>
          <CustomText text={title} />
        </View>
        <View style={styles.content}>
          <Text style={styles.TextContent}>{content}</Text>
        </View>
      </View>
    </View>
  );
};

export default FeatureItem;
