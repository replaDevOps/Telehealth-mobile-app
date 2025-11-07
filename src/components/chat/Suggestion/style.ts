
import { colors } from '../../../styles/colors';
import {
    StyleSheet,
  } from 'react-native';

export const styles = StyleSheet.create({
    suggestionsContainer: {
        marginTop: 12,
        gap: 8,
        flexDirection: 'row',
        flexWrap: 'wrap',
      },
      suggestionCard: {
        width: '48%',
        minHeight: 70,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.lightGray,
        padding: 12,
        borderRadius: 8,
      },
      suggestionIcon: {
        width: 40,
        height: 40,
        borderRadius: 8,
        overflow: 'hidden',
        marginRight: 12,
      },
      suggestionImage: {
        width: 40,
        height: 40,
      },
      suggestionContent: {
        flex: 1,
      },
      suggestionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 4,
      },
      suggestionSubtitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
      },
      suggestionSubtitle: {
        fontSize: 10,
        color: colors.secondaryText,
        flex: 1,
      },
});
