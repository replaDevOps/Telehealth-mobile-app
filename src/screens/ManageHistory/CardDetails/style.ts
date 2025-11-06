import { StyleSheet } from 'react-native';
import { colors } from '../../../styles/colors';

export const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  paymentIdHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
  },

  clinicInfoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  clinicInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  clinicText: {
    flex: 1,
  },


  giveReviewButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  giveReviewText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  clinicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderBottomColor: colors.border,
  },
  clinicLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  clinicImage: {
    width: 48,
    height: 48,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    marginRight: 12,
  },
  clinicName: {
    fontSize: 15,
    fontWeight: '600',
    color:colors.secondaryText,
  },
  clinicLocation: {
    fontSize: 11,
    color: colors.secondaryText,
  
    marginTop: 2,
  },
  consultButton: {
    backgroundColor: colors.black,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth:1,
    borderColor:colors.border
  },
  consultButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 12,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.black,
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },

  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f5f3ff',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 20,
    borderRadius: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },

  bottomButtonContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  downloadButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});