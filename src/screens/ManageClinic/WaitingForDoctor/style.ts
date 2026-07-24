import { StyleSheet } from 'react-native';
import { colors } from '../../../styles/colors';
import { mvs } from '../../../config/metrices';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: mvs(20),
  },
  loader: {
    marginBottom: mvs(30),
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: mvs(16),
  },
  message: {
    fontSize: 16,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: mvs(40),
  },
  timerContainer: {
    alignItems: 'center',
    marginTop: mvs(20),
  },
  timerLabel: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: mvs(8),
  },
  timerValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    fontFamily: 'monospace',
  },
});