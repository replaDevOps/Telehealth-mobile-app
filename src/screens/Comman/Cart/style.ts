import { StyleSheet } from 'react-native';
import { colors } from '../../../styles/colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 4,
  },
  backIcon: {
    fontSize: 22,
    color: '#000',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 30,
  },
  scrollView: {
    flex: 1,
  },

  // Empty State Styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    color: colors.secondaryText,
    marginBottom: 30,
    textAlign: 'center',
  },
  browseButton: {
    minWidth: 200,
  },

  // Clinic Section
  clinicSection: {
    backgroundColor: colors.gray,
    marginTop: 16,
    padding: 16,
    marginHorizontal: 16,
    paddingBottom: 20,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    borderRadius: 12,
  },
  clinicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  clinicImage: {
    width: 44,
    height: 44,
    backgroundColor: '#DACEFB',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  clinicEmoji: {
    fontSize: 22,
  },
  clinicInfo: {
    flex: 1,
  },
  clinicName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
    width: '70%',
  },
  clinicLocation: {
    fontSize: 12,
    color: colors.secondaryText,
    width: '70%',
  },
  clinicPointsContainer: {
    position: 'absolute',
    right: 12,
    top: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinWrapper: {
    width: 18,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
   
  },
  coinImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  clinicPointsText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '700',
    color: colors.yellow,
  },

  // Service Card Styles
  serviceCard: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    // subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardBody: {
    flexDirection: 'row',
  },
  serviceImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 12,
  },
  serviceBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  categoryBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 70,
    maxWidth:120
  },
  categoryBadgeText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '600',
    textTransform: 'capitalize',
    
  },
  nameBadge: {
    backgroundColor: '#E9D9F8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    maxWidth: 120,
    flexShrink: 1,
  },
  nameBadgeText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  serviceContent: {
    flex: 1,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    padding: 2,
  },
  removeCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    top: -12,
    right: -12,
  },
  removeIcon: {
    fontSize: 18,
    color: colors.white,
    fontWeight: '400',
    lineHeight: 20,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clockIcon: {
    fontSize: 12,
  },
  duration: {
    fontSize: 12,
    color: '#666',
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },
  loyaltyBadge: {},
  loyaltyBadgeText: {
    marginTop: 8,
    fontSize: 12,
    color: '#CC9600',
    fontWeight: '600',
  },
  loyaltyCoin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F6C84A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },

  // Suggested Services Styles
  suggestedSection: {
    marginTop: 16,
    marginBottom: 12,
  },
  suggestedTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  suggestedServiceCard: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    // subtle shadow instead of dashed border to match cards
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  suggestedPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addSuggestedButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    backgroundColor: colors.white,
    borderColor: "#E6E6E6",
    borderWidth: 2,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSuggestedButtonDisabled: {
    backgroundColor: colors.primary, // keep purple for added state but show checkmark
    borderColor: colors.primary,
  },
  cartIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusBadge: {
    position: 'absolute',
    top: -10,
    right: -15,
    backgroundColor: colors.primary,
    borderRadius: 8,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  addSuggestedButtonText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },

  // Subtotal and Checkout
  subtotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 4,
  },
  subtotalLabel: {
    fontSize: 15,
    fontWeight: '400',
    color: '#000',
  },
  subtotalValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },
  checkoutButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  taxNote: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    marginTop: 10,
  },
  bottomSpacing: {
    height: 20,
  },
});