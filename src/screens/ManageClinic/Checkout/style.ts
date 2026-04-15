import { StyleSheet } from 'react-native';
import { colors } from '../../../styles/colors';
import { mvs } from '@config/metrices';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  couponSection: {
    marginTop: mvs(8),
  },
  discountAppliedText: {
    fontSize: 14,
    color: colors.green || '#10B981',
    marginHorizontal: mvs(15),
    marginTop: mvs(8),
    fontWeight: '500',
  },
  discountValue: {
    color: colors.green || '#10B981',
  },
  backButton: {
    padding: 4,
  },
  backIcon: {
    fontSize: 24,
    color: '#000',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: mvs(40),
  },
  clinicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    marginHorizontal: 12,
    marginVertical: 10,
    borderRadius: 12,
  },
  clinicImage: {
    width: 48,
    height: 48,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  clinicEmoji: {
    fontSize: 24,
  },
  clinicInfo: {
    flex: 1,
  },
  clinicName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  clinicLocation: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  serviceCard: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 4,
    marginHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 10
  },
  serviceContent:{
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  serviceImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 6,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceBadges: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  categoryBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 70,
    maxWidth: 120,
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
  },
  nameBadgeText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
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
    color: colors.secondaryText,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 4,
    gap: 8,
    backgroundColor: "#EBAD0033",
    // borderWidth: 1,
    // borderColor: colors.yellow,
    marginHorizontal: 12,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 50
  },
  bonusInstruction: {
    color: colors.yellow,
    // textAlign: "center"
    fontSize: 12,
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 11,
    fontWeight: 'thin',
    color: colors.secondaryText,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.gray,
    marginBottom: mvs(8),
  },
  paymentOptionSelected: {
    backgroundColor: colors.lightGray
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#7c3aed',
  },
  paymentLabel: {
    fontSize: 15,
    color: '#111827',
  },
  paymentLogo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  paymentIcon: {
    fontSize: 20,
  },
  installmentLogo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  couponTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  optional: {
    color: '#9ca3af',
    fontWeight: '400',
  },
  couponInput: {
    marginHorizontal: mvs(15),
    marginTop: mvs(15),
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: mvs(15),
  },
  applyButton: {
    backgroundColor: colors.black,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  summarySection: {
    paddingHorizontal: 16,
    marginTop: 24,
    paddingBottom: 24,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 0.5,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  bottomPadding: {
    height: mvs(200),
  },
  bottomContainer: {
    padding: 20,
    backgroundColor: colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  bottomInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 15,
  },
  totalAmountText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  inclTaxText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#9CA3AF',
  },
  totalAmountValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  summaryTriggerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryTriggerText: {
    fontSize: 14,
    color: '#6B7280',
    textDecorationLine: 'underline',
  },
  originalSubtotal: {
    fontSize: 14,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  proceedButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  proceedButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  redemptionValue: {
    color: '#EF4444',
  },

  redemptionInfoRow: {
    marginHorizontal: 20,
    marginTop: 8,
  },
  redemptionInfoText: {
    color: '#6B7280',
    fontSize: 13,
  },

  insufficientText: {
    color: '#EF4444',
    marginTop: 4,
    fontSize: 13,
    marginHorizontal: 4,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
});
