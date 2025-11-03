import { mvs } from '@config/metrices';
import { colors } from '../../../styles/colors';
import {
    StyleSheet,
  } from 'react-native';
export const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFFFFF',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
    },
    backButton: {
      padding: mvs(10),
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: mvs(50),
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
    },
    placeholder: {
      width: 40,
    },
    content: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    ratingList: {
      gap: 8,
    },
    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 4,
    },
    footer: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 16,
      gap: 12,
    },
    resetButton: {
      flex: 1,
      height: 48,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    resetText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    applyButton: {
      flex: 1,
      height: 48,
      borderRadius: 12,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    applyText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: '#DDD',
      marginRight: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxChecked: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkmark: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: 'bold',
    },
    checkmarkText: {
      padding: 4,
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: 18,
      textAlign: 'center',
      fontWeight: 'bold',
      zIndex: 9999,
    },
  });
  