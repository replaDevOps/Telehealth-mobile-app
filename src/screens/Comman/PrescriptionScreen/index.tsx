import React, { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  View,
  Modal,
  ActivityIndicator,
  Text,
} from 'react-native';
import { Header2 } from '@components/common/Header2';
import { CustomButton } from '@components/common/CustomButton';
import { prescription } from '@assets/images';
import { colors } from '../../../styles/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './style';
import { EmptyContentSvg } from '@assets/icons';

export function PrescriptionScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPrescriptionAvailable] = useState(false);

  const handleDownload = () => {
    setIsLoading(true);
    // Simulate 3-second loading (as if downloading)
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('EntryPoint');
    }, 3000);
  };

  useEffect(() => {
    if (!isPrescriptionAvailable) {
      setTimeout(() => {
        setIsLoading(false);
        navigation.navigate('EntryPoint');
      }, 2000);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Header2 title="#12345" />
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isPrescriptionAvailable ? (
          <Image
            source={prescription}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.noPrescriptionContainer}>
            <EmptyContentSvg />
            <Text style={styles.noPrescriptionText}>
              No prescription available.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <CustomButton
          title="Download Prescription"
          onPress={handleDownload}
          disabled={isLoading || !isPrescriptionAvailable}
        />
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
