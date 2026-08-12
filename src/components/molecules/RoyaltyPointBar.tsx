import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { mvs } from '@config/metrices';
import { SingleLogo } from '../../assets/icons';
import { StyleSheet } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { colors } from '../../styles/colors';
import { useTranslation } from 'react-i18next';

interface RoyaltyPointsProps {
  points?: number;
  validTill?: string;
  onPress?: () => void;
  containerStyle?: any;
}

export const RoyaltyPointsBar: React.FC<RoyaltyPointsProps> = ({
  points = 300,
  validTill = '18/09/2025',
  onPress,
  containerStyle,
}) => {
  const { t } = useTranslation();
  return (
    <TouchableOpacity
      style={[style.royaltyPointsContainer, containerStyle]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={['#7625D7', '#4A148B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={style.linearGradient}
      >
        <View style={style.royaltyContent}>
          <View style={style.royaltyTitleContainer}>
            <Text style={style.royaltyTitle}>{t('loyalty_points')}</Text>
            <AntDesign name="right" size={16} color={colors.white} />
          </View>

          <Text style={style.royaltyPointsLabel}>{t('current_points')}</Text>
          <Text style={style.royaltyPointsValue}>{points}</Text>
        </View>

        {/* Gold V Logo Icon */}
        <View style={style.logoContainer}>
          <SingleLogo width={36} height={36} fill="#FDA005" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const style = StyleSheet.create({
  royaltyPointsContainer: {
    marginTop: mvs(15),
    marginBottom: mvs(10),
  },
  linearGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: mvs(10),
  },
  royaltyContent: {
    padding: mvs(10),
  },
  royaltyTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: mvs(8),
  },
  royaltyTitle: {
    fontSize: mvs(14),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  royaltyArrow: {
    fontSize: mvs(14),
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: mvs(6),
  },
  royaltySubtitle: {
    fontSize: mvs(12),
    color: '#FFFFFF',
    marginTop: mvs(4),
  },
  royaltyPointsLabel: {
    fontSize: mvs(11),
    fontWeight: '500',
    color: '#FFFFFF',
    marginTop: mvs(4),
  },
  royaltyPointsValue: {
    fontSize: mvs(14),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    // Inset lives here, not as paddingRight on the LinearGradient: the gradient
    // does not apply its own padding on the new architecture, so the logo ends
    // up flush against the card edge and clips.
    marginRight: mvs(20),
  },
});
