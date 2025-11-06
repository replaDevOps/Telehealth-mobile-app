
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
      padding: mvs(10),
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
    saveText: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: '600',
      },
      sectionHeader: {
        marginVertical: mvs(15),
      },
      sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.black,
      },
      menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.gray,
        padding: 14,
        borderRadius: 8,
        marginBottom: mvs(10),
      },
      menuItemText: {
        fontSize: 16,
        color: colors.black,
      },
      switchItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.gray,
        padding: 10,
        borderRadius: 8,
        marginBottom: mvs(10),
      },
      switchLabel: {
        fontSize: 14,
        color: colors.black,
      },
      deleteButton: {
        backgroundColor: colors.red,
        marginTop: mvs(10),
      },
      deleteButtonText: {
        color: colors.white,
      },
      modalOverlay: {
        flex: 1,
        backgroundColor: '#15002E80',
        justifyContent: 'flex-end',
      },
      bottomSheet: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 40,
        minHeight: 300,
      },
      grabber: {
        width: 40,
        height: 5,
        backgroundColor: '#E0E0E0',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 20,
      },
      modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.black,
        textAlign: 'center',
        marginBottom: 12,
      },
      modalDescription: {
        fontSize: 16,
        color: colors.secondaryText,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 30,
      },
      modalDeleteButton: {
        backgroundColor: '#FF3B30',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
      },
      modalDeleteButtonText: {
        color: colors.white,
        fontSize: 17,
        fontWeight: '600',
      },
      modalCancelButton: {
        backgroundColor: colors.lightGray,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
      },
      modalCancelText: {
        fontSize: 17,
        fontWeight: '600',
      },
  });
  
  