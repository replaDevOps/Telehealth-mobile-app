import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { mvs } from '@config/metrices';
import { coinIcon } from '@assets/images';
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
        colors={['#FDA005', '#F8D567']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={style.linearGradient}
      >
        <View style={style.royaltyContent}>
          <View style={style.royaltyTitleContainer}>
            <Text style={style.royaltyTitle}>{t('royalty_points')}</Text>
            <AntDesign name="right" size={18} color={colors.white} />
          </View>

          <Text style={style.royaltySubtitle}>
            {t('valid_till_date')} {validTill}
          </Text>

          <Text style={style.royaltyPointsLabel}>{t('current_points')}</Text>
          <Text style={style.royaltyPointsValue}>{points}</Text>
        </View>

        {/* Coin Icon */}
        <Image source={coinIcon} style={style.coinIcon} />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const style = StyleSheet.create({
  royaltyPointsContainer: {
    marginTop: mvs(20),
    marginBottom: mvs(10),
  },
  linearGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: mvs(10),
  },
  royaltyContent: {
    padding: mvs(12),
  },
  royaltyTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: mvs(10),
  },
  royaltyTitle: {
    fontSize: mvs(16),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  royaltyArrow: {
    fontSize: mvs(16),
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: mvs(8),
  },
  royaltySubtitle: {
    fontSize: mvs(13),
    color: '#FFFFFF',
    marginTop: mvs(4),
  },
  royaltyPointsLabel: {
    fontSize: mvs(13),
    fontWeight: '500',
    color: '#FFFFFF',
    marginTop: mvs(8),
  },
  royaltyPointsValue: {
    fontSize: mvs(16),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  coinIcon: {
    width: mvs(70),
    position: 'absolute',
    right: mvs(30),
    height: mvs(70),
    resizeMode: 'contain',
  },
});
