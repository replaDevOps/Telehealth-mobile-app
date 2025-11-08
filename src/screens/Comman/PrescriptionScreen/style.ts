import { Dimensions, StyleSheet } from "react-native";
import { colors } from '../../../styles/colors';
import { mvs } from '@config/metrices';

const { width, height } = Dimensions.get('window');
export const styles = StyleSheet.create({
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
  