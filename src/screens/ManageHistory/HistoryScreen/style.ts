import { StyleSheet, Platform } from 'react-native';
import { colors } from '../../../styles/colors';


export const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f9fafb',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.white,
    },
    backButton: {
      padding: 4,
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.text,
    },
    placeholder: {
      width: 32,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.gray,
      marginHorizontal: 16,
      marginTop: 16,
      paddingHorizontal: 12,
      paddingVertical: Platform.OS === 'ios' ? 10 : 0,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchInput: {
      flex: 1,
      marginLeft: 8,
      fontSize: 14,
      color: colors.text,
    },
    tabsContainer: {
      flexDirection: 'row',
      marginHorizontal: 16,
      marginTop: 16,
      backgroundColor: colors.lightGray,
      borderRadius: 10,
      padding: 4,
    },
    tab: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderRadius: 8,
    },
    activeTab: {
      backgroundColor: colors.primary,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    activeTabText: {
      color: colors.white,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 16,
    },
    card: {
      backgroundColor: colors.white,

      marginBottom: 16,
    },
    cardContainer:{
        backgroundColor: colors.gray,
      borderRadius: 12,
    borderWidth:1,
    borderColor:colors.border

    },
    dateText: {
      fontSize: 12,
      color: colors.secondaryText,
      marginBottom: 12,
    },
    serviceHeader: {
      backgroundColor: colors.primary,
      padding: 8,
      marginBottom: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopEndRadius: 8,
      borderTopStartRadius: 8,
    },
    serviceHeaderLeft: {
      flex: 1,
    },
    serviceName: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.white,
    },
    serviceDetails: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    durationText: {
      fontSize: 13,
      color: colors.white,
      marginRight: 8,
    },
    typeText: {
      fontSize: 13,
      color: colors.white,
    },
    badgesContainer: {
      flexDirection: 'row',
      gap: 6,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.white,
    },
    doctorSection: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      paddingHorizontal: 16,
    },
    doctorAvatar: {
      width: 48,
      height: 48,
      borderRadius: 8,
      marginRight: 12,
      backgroundColor:"#DACEFB",
      alignItems:"center",
      justifyContent:"center"
    },
    clinicLogo:{
        textAlign:"center",
        color:colors.primary,
        fontSize:10
    },
    doctorInfo: {
      flex: 1,
    },
    doctorName: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },
    clinicName: {
      fontSize: 13,
      color: colors.secondaryText,
    },
    price: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical:12
    },
    prescriptionButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      backgroundColor: colors.white,
    },
    prescriptionButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    viewChatButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 8,
      backgroundColor: colors.primary,
      alignItems: 'center',
    },
    viewChatButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.white,
    },
    paymentServiceHeader: {
      backgroundColor: colors.lightGray,
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    paymentServiceName: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    paymentServiceDetails: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    paymentDuration: {
      fontSize: 13,
      color: colors.primary,
      fontWeight: '500',
    },
    paymentHeader: {
      backgroundColor: colors.primary,
      padding: 8,
      marginBottom: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopEndRadius: 8,
      borderTopStartRadius: 8,
    },
    paymentId: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.white,
    },
    paymentTypeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    paymentType: {
      fontSize: 13,
      color: colors.white,
      fontWeight: '500',
    },
    paymentDoctorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
      paddingHorizontal: 16,
    },
    paymentDoctorSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    paymentPrice: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.secondaryText,
      marginLeft: 12,
    },
    serviceStatusRow: {
      flexDirection: 'row',
      borderRadius: 8,
      paddingHorizontal: 16,
      marginBottom: 12,
      alignItems: 'center',
      justifyContent:"center",
      gap: 12,
    },
    serviceInfo: {
      flex: 1,
      alignItems: 'center',
    },
    serviceLabel: {
      fontSize: 12,
      color: colors.secondaryText,
      marginBottom: 4,
    },
    serviceValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    statusDivider: {
      width:1,
      height: 30,
      backgroundColor: colors.black,
      marginHorizontal: 12,
    //   position:"absolute",
    //   right:20
    },
    statusInfo: {
      alignItems: 'flex-end',
    },
    noDoctorSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    noDoctorIcon: {
      marginRight: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor:colors.border,
      borderRadius: 8,
    },
    noDoctorInfo: {
      flex: 1,
    },
    noDoctorText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },
    paymentFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    statusLabel: {
      fontSize: 13,
      color: colors.secondaryText,
    },
    statusValue: {
      fontSize: 14,
      fontWeight: '600',
    },
    viewDetailsButton: {
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      margin:16,
      backgroundColor:colors.white
    },
    viewDetailsButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
  });