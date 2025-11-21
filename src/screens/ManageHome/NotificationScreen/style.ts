import { StyleSheet } from "react-native";
import { colors } from '../../../styles/colors';


export const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.white,
    },
    scrollView: {
      flex: 1,
    },
    notificationItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: colors.white,
    },
    notificationBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    iconContainer: {
      marginRight: 12,
      marginTop: 2,
      borderWidth:1,
      borderColor:colors.border,
      padding:4,
      borderRadius:8,
    },
    contentContainer: {
      flex: 1,
      marginRight: 12,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    message: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
      marginBottom: 8,
    },
    time: {
      fontSize: 12,
      color: colors.secondaryText,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
      marginTop: 8,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingVertical: 128,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#111827',
      marginTop: 16,
      marginBottom: 8,
    },
    emptyMessage: {
      fontSize: 14,
      color: '#6B7280',
      textAlign: 'center',
      lineHeight: 20,
    },
  });
  