
import { StyleSheet } from 'react-native';
import { colors } from '../../../styles/colors';

export const styles = StyleSheet.create({
    messagesContainer: {
        flex: 1,
        backgroundColor: '#fff',
      },
      messagesContent: {
        padding: 16,
      },
      emptyContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
      emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
      },
      emptyStateText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text || '#111827',
        marginBottom: 8,
        textAlign: 'center',
      },
      emptyStateSubtext: {
        fontSize: 14,
        color: colors.secondaryText || '#6b7280',
        textAlign: 'center',
        paddingHorizontal: 40,
      },
});
