import { StyleSheet } from 'react-native';
import { colors } from '../../../styles/colors';
import { mvs } from '../../../config/metrices';

export const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  loadingText: {
    marginTop: mvs(10),
    fontSize: 16,
    color: colors.secondaryText,
  },
});
