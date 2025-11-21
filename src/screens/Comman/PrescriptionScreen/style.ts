// styles.js
import { StyleSheet } from 'react-native';
import { colors } from '../../../styles/colors';
import { mvs } from '@config/metrices';



export const styles = StyleSheet.create({
    // Container Styles
    container: {
      flex: 1,
      backgroundColor: colors.white,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: mvs(20),
    },
    scrollView: {
      flex: 1,
    },
    contentContainer: {
      padding: mvs(16),
    },
    bottomSpacing: {
      height: mvs(20),
    },
  
    loadingText: {
      marginTop: mvs(12),
      fontSize: mvs(14),
      color: colors.secondaryText,
    },
    errorText: {
      fontSize: mvs(16),
      color: colors.red,
      marginBottom: mvs(16),
      textAlign: 'center',
    },
    retryButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: mvs(24),
      paddingVertical: mvs(12),
      borderRadius: mvs(8),
    },
    retryButtonText: {
      color: colors.white,
      fontSize: mvs(14),
      fontWeight: '600',
    },
  
    // Doctor Card Styles
    doctorCard: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: mvs(20),
      padding: mvs(12),
      borderRadius: mvs(12),
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    avatar: {
      width: mvs(56),
      height: mvs(56),
      borderRadius: mvs(28),
      marginRight: mvs(12),
      backgroundColor: colors.border,
    },
    doctorInfo: {
      flex: 1,
    },
    doctorName: {
      fontSize: mvs(16),
      fontWeight: '600',
      color: colors.text,
      marginBottom: mvs(4),
    },
    doctorCredentials: {
      fontSize: mvs(13),
      color: colors.secondaryText,
      marginBottom: mvs(4),
    },
    dateTime: {
      fontSize: mvs(12),
      color: colors.text,
    },
  
    // Info Grid Styles
    infoGrid: {
      flexDirection: 'row',
      marginBottom: mvs(24),
      gap: mvs(12),
    },
    infoSection: {
      flex: 1,
      padding: mvs(12),
      borderRadius: mvs(12),
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    infoSectionTitle: {
      fontSize: mvs(14),
      fontWeight: '600',
      color: colors.text,
      marginBottom: mvs(12),
    },
    infoItem: {
      marginBottom: mvs(10),
    },
    infoLabel: {
      fontSize: mvs(11),
      color: colors.text,
      marginBottom: mvs(3),
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    infoValue: {
      fontSize: mvs(13),
      color: colors.text,
      lineHeight: mvs(18),
      fontWeight: '500',
    },
  
    // Section Styles
    section: {
      marginBottom: mvs(24),
    },
    sectionTitle: {
      fontSize: mvs(16),
      fontWeight: '600',
      color: colors.text,
      marginBottom: mvs(12),
    },
  
    // Diagnosis Styles
    diagnosisBox: {
      padding: mvs(16),
      borderRadius: mvs(12),
      borderBottomColor: colors.border,
      borderBottomWidth: 1,
    },
    diagnosisLabel: {
      fontSize: mvs(11),
      color: colors.secondaryText,
      marginBottom: mvs(8),
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      fontWeight: '600',
    },
    diagnosisText: {
      fontSize: mvs(14),
      color: colors.text,
      lineHeight: mvs(20),
      marginBottom: mvs(8),
    },
  
    // Treatment Styles
    treatmentBox: {
      borderBottomWidth: 1,
      borderColor: colors.border,
      padding: mvs(16),
      borderRadius: mvs(12),
    },
    treatmentLabel: {
      fontSize: mvs(11),
      color: colors.secondaryText,
      marginBottom: mvs(4),
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      fontWeight: '600',
    },
    treatmentName: {
      fontSize: mvs(16),
      marginBottom: mvs(12),
    },
    treatmentNotes: {
      fontSize: mvs(14),
      color: colors.text,
      lineHeight: mvs(20),
    },
  
    // Medication Card Styles
    medicationCard: {
      backgroundColor: '#FCFBFC',
      borderWidth: 1,
      borderColor: colors.border,
      padding: mvs(16),
      borderRadius: mvs(12),
      marginBottom: mvs(12),
    },
    medicationName: {
      fontSize: mvs(15),
      fontWeight: '600',
      color: colors.text,
      marginBottom: mvs(4),
    },
    medicationGeneric: {
      fontSize: mvs(14),
      color: colors.primary,
      marginBottom: mvs(12),
      fontWeight: '500',
    },
    medicationDetails: {
      paddingHorizontal: mvs(12),
      borderRadius: mvs(8),
    },
    medicationRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: mvs(8),
    },
    medicationLabel: {
      fontSize: mvs(12),
      color: colors.secondaryText,
      fontWeight: '500',
    },
    medicationValue: {
      paddingHorizontal: mvs(12),

      fontSize: mvs(13),
      color: colors.text,
      fontWeight: '600',
    },
    medicationInstructions: {
      paddingHorizontal: mvs(12),

      fontSize: mvs(13),
      color: colors.secondaryText,
      lineHeight: mvs(18),
      fontStyle: 'italic',
    },
  
    // Signature Styles
    signatureBox: {
      alignItems: 'flex-start',
    },
    signatureImage: {
      width: mvs(100),
      height: mvs(84),
    },
  
    // Footer & Button Styles
    footer: {
      backgroundColor: colors.white,
      paddingHorizontal: mvs(16),
      paddingVertical: mvs(12),
      borderTopWidth: 1,
      borderTopColor: colors.border,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    buttonWrapper: {
        flex: 1,
        marginHorizontal: mvs(5),
    },
  
    // Loading Overlay
    loadingOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    downloadingText: {
      color: colors.white,
      fontSize: mvs(16),
      marginTop: mvs(12),
      fontWeight: '500',
    },
    noPrescriptionContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
      backgroundColor: colors.white,
    },
    noPrescriptionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      marginTop: 24,
      textAlign: 'center',
    },
    noPrescriptionSubtitle: {
      fontSize: 15,
      color: colors.secondaryText,
      marginTop: 12,
      textAlign: 'center',
      lineHeight: 22,
    },
  });
  
;