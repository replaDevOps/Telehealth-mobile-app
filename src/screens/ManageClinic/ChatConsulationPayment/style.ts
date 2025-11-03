import {
  StyleSheet,
} from 'react-native';
import { mvs } from '@config/metrices';
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
      paddingHorizontal: mvs(16),
      paddingVertical: mvs(12),
      backgroundColor: colors.white,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    backButton: {
      padding: mvs(4),
    },
    backIcon: {
      fontSize: mvs(22),
      color: '#000',
    },
    headerTitle: {
      fontSize: mvs(17),
      fontWeight: '600',
      color: '#000',
    },
    placeholder: {
      width: mvs(30),
    },
    scrollView: {
      flex: 1,
    },
    successBanner: {
      backgroundColor: colors.green,
      marginHorizontal: mvs(16),
      marginTop: mvs(16),
      paddingVertical: mvs(12),
      paddingHorizontal: mvs(16),
      borderRadius: mvs(10),
    },
    successText: {
      color: '#fff',
      fontSize: mvs(14),
      fontWeight: '500',
    },
    summarySection: {
      backgroundColor: colors.white,
      marginHorizontal: mvs(16),
      marginTop: mvs(16),
      padding: mvs(16),
      borderRadius: mvs(12),
    },
    sectionTitle: {
      fontSize: mvs(16),
      fontWeight: '600',
      color: colors.text,
      marginBottom: mvs(16),
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: mvs(12),
    },
    summaryLabel: {
      fontSize: mvs(14),
      color: colors.secondaryText,
      flex: 1,
    },
    summaryValue: {
      fontSize: mvs(14),
      color: colors.text,
      fontWeight: '500',
      textAlign: 'right',
      flex: 1,
    },
    serviceValue: {
      fontSize: mvs(13),
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: mvs(16),
      padding: mvs(12),
      backgroundColor: colors.lightGray,
      borderRadius: mvs(10),
    },
    totalLabel: {
      fontSize: mvs(15),
      fontWeight: '700',
      color: colors.text,
      letterSpacing: 0.5,
    },
    totalValue: {
      fontSize: mvs(16),
      fontWeight: '700',
      color: colors.text,
    },
    paymentSection: {
      backgroundColor: colors.white,
      marginHorizontal: mvs(16),
      marginTop: mvs(16),
      padding: mvs(16),
      borderRadius: mvs(12),
    },
    paymentOption: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: mvs(14),
      paddingHorizontal: mvs(16),
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: mvs(10),
      marginBottom: mvs(12),
    },
    paymentOptionSelected: {
      borderColor: '#7c3aed',
      backgroundColor: '#faf5ff',
    },
    paymentLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    radioOuter: {
      width: mvs(20),
      height: mvs(20),
      borderRadius: mvs(10),
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: mvs(12),
    },
    radioInner: {
      width: mvs(10),
      height: mvs(10),
      borderRadius: mvs(5),
      backgroundColor: '#7c3aed',
    },
    paymentLabel: {
      fontSize: mvs(15),
      color: '#111827',
      fontWeight: '500',
    },
    cardLogos: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    mastercardLogo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  
    cardForm: {
      marginTop: mvs(8),
      marginBottom: mvs(12),
      borderWidth: 1,
      borderColor: colors.border,
      padding: mvs(16),
      borderRadius: mvs(8),
      gap: mvs(12),
    },
    inputGroup: {
      // marginTop: mvs(12),
    },
    inputGroupHalf: {
      flex: 1,
    },
    inputRow: {
      flexDirection: 'row',
      gap: mvs(12),
    },
    inputLabel: {
      fontSize: mvs(13),
      fontWeight: '600',
      color: colors.text,
      marginBottom: mvs(8),
    },
    input: {
      backgroundColor: colors.gray,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: mvs(8),
      paddingHorizontal: mvs(14),
      paddingVertical: mvs(12),
      fontSize: mvs(14),
      color: colors.text,
    },
    bottomSpacing: {
      height: mvs(100),
    },
    bottomContainer: {
      padding: mvs(16),
      backgroundColor: colors.white,
    },
    loadingOverlay: {
      flex: 1,
      backgroundColor: '#15002E80',
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingContainer: {
      backgroundColor: colors.white,
      padding: 30,
      borderRadius: 16,
      alignItems: 'center',
      minWidth: 200,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      fontWeight: '600',
      color: colors.white,
      textAlign: 'center',
    },
  });
  