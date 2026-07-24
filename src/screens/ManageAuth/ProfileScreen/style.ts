
import { StyleSheet } from 'react-native';
import { mvs } from '../../../config/metrices';
import { colors } from '../../../styles/colors';


export const styles = StyleSheet.create({
        header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: mvs(16),
      alignItems: 'center',
    },
    language: {
      fontSize: mvs(14),
      color: colors.black,
    },
    container: {
    //   padding: mvs(16),
    },
    profileImageContainer: {
      position: 'relative',
      marginBottom: mvs(20),
    },
    profileImage: {
      width: mvs(100),
      height: mvs(100),
      borderRadius: mvs(50),
      borderWidth: 2,
      borderColor: colors.primary,
    },
    content: {
      alignItems: 'center',
      gap: mvs(5),
      marginBottom: mvs(20),
    },
    label: {
        fontSize: mvs(13),
        color: colors.black,
        marginBottom: mvs(8),
        fontWeight: '500',
      },
    TextContent: {
      fontSize: 16,
      textAlign: 'center',
      fontWeight: '500',
      color: colors.secondaryText,
    },
    editIcon: {
      position: 'absolute',
      bottom: mvs(5),
      right: mvs(5),
      backgroundColor: colors.primary,
      borderRadius: mvs(10),
      padding: mvs(4),
    },
    title: {
      fontSize: mvs(20),
      fontWeight: 'bold',
      color: colors.black,
      marginBottom: mvs(10),
    },
    subtitle: {
      fontSize: mvs(14),
      color: colors.gray,
      textAlign: 'center',
      marginBottom: mvs(20),
    },
    buttonContainer:{
      width:"100%",
      flexDirection:"row",
      gap:mvs(10),
      alignItems:"center",
      marginTop: mvs(20),
      paddingBottom: mvs(10),
    },

    buttonText: {
      color: colors.white,
      fontSize: mvs(16),
      fontWeight: '600',
    },
    errorText: {
      color: 'red',
      fontSize: mvs(12),
      marginTop: mvs(5),
      marginBottom: mvs(10),
      textAlign: 'center',
    },
    saudiToggleRow: {
      flexDirection: 'row',
      gap: mvs(10),
      marginTop: mvs(2),
    },
    saudiOption: {
      flex: 1,
      height: mvs(40),
      borderRadius: mvs(10),
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.gray,
      alignItems: 'center',
      justifyContent: 'center',
    },
    saudiOptionActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    saudiOptionText: {
      fontSize: mvs(14),
      color: colors.text,
      fontWeight: '500',
    },
    saudiOptionTextActive: {
      color: colors.white,
    },
    disclaimer: {
      fontSize: mvs(12),
      color: colors.secondaryText,
      marginTop: mvs(8),
      marginBottom: mvs(16),
    },
    vatNote: {
      fontSize: mvs(12),
      color: colors.primary,
      marginTop: mvs(4),
      marginBottom: mvs(4),
    },
    fieldError: {
      color: 'red',
      fontSize: mvs(12),
      marginTop: mvs(4),
      marginBottom: mvs(10),
    },
  });
  
  