// style.ts
import { mvs } from '@config/metrices';
import { StyleSheet } from 'react-native';
import { colors } from '../../../styles/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.gray,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 8,  
    paddingVertical: 12
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: 16,
    marginLeft: 16,
    color: '#333',
    fontWeight: '500',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  // New styles extracted from inline styling
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  royaltyPointsContainer: {
    marginTop: mvs(20),
    marginBottom: mvs(10),
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
  // Additional styles for conditional rendering
  logoutMenuItem: {
    backgroundColor: colors.red,
  },
  logoutMenuTitle: {
    color: colors.white,
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: '#15002E80',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    textAlign: 'center',
  },
});