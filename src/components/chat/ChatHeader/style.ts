
import { colors } from '../../../styles/colors';
import {
    StyleSheet,
  } from 'react-native';

export const styles = StyleSheet.create({
    doctorHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.white,
        // Explicit height so the absolutely-positioned center label can fill it.
        minHeight: 64,
      },
      backButton: {
        position: 'absolute',
        left: 16,
        top: 12,
        zIndex: 2,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
      },
      // Pinned to the true horizontal center of the header so the doctor's
      // name doesn't shift based on whether the End button is rendered.
      doctorHeaderCenter: {
        position: 'absolute',
        left: 72,
        right: 72,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
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
