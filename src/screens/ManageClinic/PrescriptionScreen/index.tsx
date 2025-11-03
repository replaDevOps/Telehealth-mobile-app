import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  View,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Header2 } from '@components/common/Header2';
import { CustomButton } from '@components/common/CustomButton';
import { prescription } from '@assets/images';
import { colors } from '../../../styles/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mvs } from '@config/metrices';

const { width, height } = Dimensions.get('window');

export function PrescriptionScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = () => {
    setIsLoading(true);
    // Simulate 3-second loading (as if downloading)
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('ClinicScreen'); // <-- Make sure the route name matches your navigator
    }, 3000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header2 title="#12345" />
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={prescription}
          style={styles.image}
          resizeMode="contain"
        />
      </ScrollView>

      <View style={styles.buttonContainer}>
        <CustomButton title="Download Prescription" onPress={handleDownload} />
      </View>

      {/* Loading Modal */}
      <Modal
        visible={isLoading}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.white} />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors?.white,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
  },
  image: {
    width: width * 0.9,
    height: height * 0.8,
    borderRadius: 12,
  },
  buttonContainer: {
    backgroundColor: colors?.white,
    paddingHorizontal: mvs(18),
    paddingVertical: mvs(10),
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: '#15002E80',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
