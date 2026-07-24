import { colors } from '../../../styles/colors';
import {
    StyleSheet,
  } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
      },
      keyboardView: {
        flex: 1,
        minHeight: 0,
        backgroundColor: '#fff',
      },
      content: {
        flex: 1,
        minHeight: 0,
      },
      inputWrapper: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
      },
      clinicInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderBottomWidth: 1,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        borderBottomColor: colors.border,
      },
      clinicLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 8,
      },
      clinicTextWrapper: {
        flex: 1,
      },
      clinicImage: {
        width: 48,
        height: 48,
        backgroundColor: '#e5e7eb',
        borderRadius: 24,
        marginRight: 12,
      },
      clinicName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
      },
      clinicLocation: {
        fontSize: 11,
        color: '#6b7280',
        marginTop: 2,
        flexShrink: 1,
      },
      consultButton: {
        backgroundColor: colors.black,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 4,
      },
      consultButtonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
      },
      loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
      },
      loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: colors.secondaryText,
      },
      visitButton: {
        backgroundColor: colors.lightGray,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.border,
      },
      visitButtonText: {
        color: colors.text,
        fontSize: 13,
        fontWeight: '600',
      },
});