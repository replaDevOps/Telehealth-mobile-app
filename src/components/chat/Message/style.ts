
import { colors } from '../../../styles/colors';
import {
    StyleSheet,
  } from 'react-native';

export const styles = StyleSheet.create({
    messageContainer: {
        marginBottom: 16,
      },
      botMessageWithAvatar: {
        flexDirection: 'row',
        alignItems: 'flex-start',
      },
      avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 8,
      },
      botMessageContent: {
        flex: 1,
      },
      messageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        gap: 8,
      },
      senderName: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.text,
      },
      timestamp: {
        fontSize: 12,
        color: colors.secondaryText,
      },
      userMessageWrapper: {
        alignItems: 'flex-end',
      },
      userMessageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        gap: 8,
      },
      userMessageRow: {
        flexDirection: 'row-reverse',
        alignItems: 'flex-start',
      },
      userMessage: {
        maxWidth: '80%',
      },
      userMessageText: {
        fontSize: 15,
        color: colors.text,
        backgroundColor: colors.lightGray,
        padding: 12,
        borderRadius: 10,
      },
      imagesRow: {
        flexDirection: 'row',
        marginTop: 8,
        gap: 8,
        justifyContent: 'flex-end',
      },
      botImagesRow: {
        flexDirection: 'row',
        marginTop: 8,
        gap: 8,
        justifyContent: 'flex-start',
      },
      imageContainer: {
        position: 'relative',
        width: 80,
        height: 80,
        borderRadius: 8,
        overflow: 'hidden',
      },
      uploadedImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
      },
      uploadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
      },
      botMessageWrapper: {
        alignItems: 'flex-start',
      },
      botMessage: {
        maxWidth: '85%',
      },
      botMessageText: {
        backgroundColor: colors.primary,
        borderRadius: 10,
        padding: 12,
        fontSize: 15,
        color: '#fff',
        lineHeight: 20,
      },
});
