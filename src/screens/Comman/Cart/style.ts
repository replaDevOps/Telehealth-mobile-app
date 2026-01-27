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
    backgroundColor: '#f0f0f0',
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
  },
  clinicLocation: {
    fontSize: 12,
    color: colors.secondaryText,
  },

  // Service Card Styles
  serviceCard: {
    flexDirection: 'row',
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  serviceImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 12,
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
  serviceBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  categoryBadge: {
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '500',
  },
  nameBadge: {
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  nameBadgeText: {
    fontSize: 10,
    color: colors.text,
    fontWeight: '500',
  },
  removeButton: {
    position: 'absolute',
    top: -20,
    right: -15,
  },
  removeCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
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
  loyaltyBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#FFF7E6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  loyaltyBadgeText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#B06B00',
    fontWeight: '600',
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
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  suggestedPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addSuggestedButton: {
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderColor: colors.primary,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 12,
    top: 12,
  },
  addSuggestedButtonDisabled: {
    backgroundColor: '#2ECC71', // Green for "added" state
    borderColor: '#2ECC71',
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