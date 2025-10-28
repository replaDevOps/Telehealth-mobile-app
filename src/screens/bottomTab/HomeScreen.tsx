import React from 'react';
import { View, ScrollView, StyleSheet, StatusBar } from 'react-native';
import HomeHeader from '../../components/molecules/HomeHeadder';
import { colors } from '../../styles/colors';

const HomeScreen = ({ navigation }) => {
  const handleLocationPress = () => {
    // Navigate to location selection screen
    console.log('Location pressed');
  };

  const handleCartPress = () => {
    navigation.navigate('Cart');
  };

  const handleNotificationPress = () => {
    navigation.navigate('Notifications');
  };

  const handleSearchPress = () => {
    navigation.navigate('Search');
  };

  const handleQRPress = () => {
    navigation.navigate('QRScanner');
  };

  return (
    <View style={styles.container}>
      <HomeHeader
        location="Makkah, Saudi Arabia"
        onLocationPress={handleLocationPress}
        onCartPress={handleCartPress}
        onNotificationPress={handleNotificationPress}
        onSearchPress={handleSearchPress}
        onQRPress={handleQRPress}
        cartItemCount={4}
      />

      <ScrollView style={styles.content}>
        {/* Your home screen content here */}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
  },
});

export default HomeScreen;
