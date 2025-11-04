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
  clinicSection: {
    backgroundColor: '#fff',
    marginTop: 16,
    paddingTop: 16,
    marginHorizontal: 16,
    paddingBottom: 20,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
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
