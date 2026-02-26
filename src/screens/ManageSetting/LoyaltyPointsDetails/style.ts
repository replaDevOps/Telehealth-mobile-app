import { StyleSheet } from 'react-native';
import { colors } from '../../../styles/colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
    marginHorizontal: 20,
  },
  leftSection: {
    flex: 1,
  },
  centerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    alignSelf: 'flex-start',
  },
  categoryText: {
    marginBottom: 8,
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  transactionId: {
    fontSize: 13,
    color: '#999',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  coinEmoji: {
    fontSize: 16,
  },
  points: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.yellow,
  },
  pointsText: {
    fontSize: 14,
    color: colors.borderDark,
  },
  positivePoints: {
    color: '#4CAF50',
  },
  negativePoints: {
    color: '#F44336',
  },
  price: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: 'bold',
  },
  rewardView: {
    width: 70,
    height: 70,
    backgroundColor: colors.primary,
    borderRadius: 40,
    position: 'absolute',
    bottom: 50,
    right: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
