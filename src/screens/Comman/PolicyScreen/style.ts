import { StyleSheet } from 'react-native';
import { colors } from '../../../styles/colors';
import { mvs } from '@config/metrices';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  contentContainer: {
    padding: mvs(20),
    paddingBottom: mvs(40),
  },
  contentWrapper: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: mvs(100),
  },
  loadingText: {
    marginTop: mvs(16),
    fontSize: 16,
    color: colors.secondaryText,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: mvs(100),
    paddingHorizontal: mvs(40),
  },
  emptyText: {
    fontSize: 16,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 24,
  },
});
