
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
    button: {
        flex:1,
        position:"absolute",
        bottom:mvs(10),
        alignSelf:"center",
        width:"100%"
    },
    buttonText: {
      color: colors.white,
      fontSize: mvs(16),
      fontWeight: '600',
    },
  });
  
  