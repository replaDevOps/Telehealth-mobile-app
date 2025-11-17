import { Header2 } from '@components/common/Header2';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';

import { View, Text, FlatList, Image } from 'react-native';
import { mvs } from '@config/metrices';
import { coinIcon } from '@assets/images';
import { styles } from './style';

export const RoyaltyPoints = () => {
  const historyData = [
    {
      id: '1',
      center: 'Eden Medical Center',
      transactionId: '#12455252',
      points: 2,
      date: '22/10/2025',
      isPositive: true,
    },
    {
      id: '2',
      center: 'Eden Medical Center',
      transactionId: '#12455252',
      points: 2,
      date: '22/10/2025',
      isPositive: false,
    },
    {
      id: '3',
      center: 'Eden Medical Center',
      transactionId: '#12455252',
      points: 2,
      date: '22/10/2025',
      isPositive: false,
    },
    {
      id: '4',
      center: 'Eden Medical Center',
      transactionId: '#12455252',
      points: 2,
      date: '22/10/2025',
      isPositive: true,
    },
    {
      id: '5',
      center: 'Eden Medical Center',
      transactionId: '#12455252',
      points: 2,
      date: '22/10/2025',
      isPositive: true,
    },
  ];

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.leftSection}>
        <Text style={styles.centerName}>{item.center}</Text>
        <Text style={styles.transactionId}>{item.transactionId}</Text>
      </View>

      <View style={styles.rightSection}>
        <View style={styles.pointsContainer}>
          <Image source={coinIcon} style={{ width: 16, height: 16 }} />
          <Text
            style={[
              styles.points,
              item.isPositive ? styles.positivePoints : styles.negativePoints,
            ]}
          >
            {item.isPositive ? '+' : '-'}
            {item.points} point
          </Text>
        </View>
        <Text style={styles.date}>{item.date}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header2 title="Royalty Points" />
      <View style={{ flex: 1, paddingHorizontal: 20, marginTop: mvs(20) }}>
        <LinearGradient
          colors={['#FDA005', '#F8D567']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.linearGradient}
        >
          <View style={styles.royaltyContent}>
            <View style={styles.royaltyTitleContainer}>
              <Text style={styles.royaltyTitle}>Current Points:</Text>
            </View>

            <Text style={styles.royaltyPointsValue}>300</Text>
            <Text style={styles.royaltySubtitle}>
              Valid till date 18/09/2025
            </Text>
          </View>

          {/* Coin Icon */}
          <Image source={coinIcon} style={styles.coinIcon} />
        </LinearGradient>
        <Text style={styles.header}>History</Text>
        <FlatList
          data={historyData}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    </View>
  );
};
