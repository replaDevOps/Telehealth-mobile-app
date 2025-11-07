
import { colors } from '../../../styles/colors';
import {
    StyleSheet,
  } from 'react-native';

export const styles = StyleSheet.create({
    doctorHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.white,
      },
      backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
      },
      doctorHeaderCenter: {
        flex: 1,
        alignItems: 'center',
      },
      doctorName: {
        fontSize: 17,
        fontWeight: '600',
        color: colors.text,
      },
      consultationTime: {
        fontSize: 13,
        color: colors.secondaryText,
        marginTop: 2,
      },
      endButton: {
        backgroundColor: '#ef4444',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 6,
      },
      endButtonText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: '600',
      },
});
