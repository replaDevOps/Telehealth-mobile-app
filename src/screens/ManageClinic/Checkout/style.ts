import { StyleSheet } from 'react-native';
import { colors } from '../../../styles/colors';
import { mvs } from '@config/metrices';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
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
  clinicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 16,
    backgroundColor: colors.lightGray,
    marginTop: 12,
    borderRadius: 12,
  },
  serviceLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  serviceImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
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
  bottomSpacing: {
    height: 100,
  },
  bottomContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  proceedButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  proceedButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
