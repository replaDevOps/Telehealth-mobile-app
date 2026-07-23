import { StyleSheet } from 'react-native';
import { colors } from '../../../styles/colors';
import { mvs } from '@config/metrices';

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
    alignSelf: 'flex-start', // This makes the background wrap the text naturally
  },
  categoryText: {
    marginBottom: 8,
    backgroundColor: '#F3E8FF', // Light purple/lavender background like in Figma
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    fontSize: 12,
    color: '#8B5CF6', // Purple text color
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
  positivePoints: {
    color: '#4CAF50',
  },
  negativePoints: {
    color: '#F44336',
  },
  date: {
    fontSize: 13,
    color: '#999',
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
  logoutMenuItem: {
    backgroundColor: colors.red,
  },
  logoutMenuTitle: {
    color: colors.white,
  },
});
