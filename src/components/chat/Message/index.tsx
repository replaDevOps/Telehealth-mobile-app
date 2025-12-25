import React from 'react';
import { View, Text, Image, TouchableOpacity, Platform, ActionSheetIOS } from 'react-native';
import { Suggestion } from '../Suggestion';
import { Message as MessageType, Service } from '../../../types/chat.types';
import { styles } from './style';

interface MessageProps {
  msg: MessageType;
  showAvatar: boolean;
  handleServicePress: (service: Service) => void;
  handleDeleteMessage?: (messageID: string) => void;
}

export const Message: React.FC<MessageProps> = ({
  msg,
  showAvatar,
  handleServicePress,
  handleDeleteMessage,
}) => {
  const isUser = msg.type === 'user';
  const hasText = msg.text && msg.text.trim().length > 0;
  const hasImages = msg.images && msg.images.length > 0;

  const handleLongPress = () => {
    if (!isUser || !handleDeleteMessage) return;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Delete'],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            handleDeleteMessage(msg.id);
          }
        }
      );
    } else {
      // For Android, we'll use Alert (already imported in ChatScreen)
      // The Alert will be shown from ChatScreen's handleDeleteMessage
      handleDeleteMessage(msg.id);
    }
  };

  return (
    <View style={styles.messageContainer}>
      {/* Bot Message */}
      {!isUser && (
        <View style={showAvatar && styles.botMessageWithAvatar}>
          {showAvatar && msg.user && (
            <Image source={msg.user.avatar} style={styles.avatar} />
          )}
          <View style={styles.botMessageContent}>
            {showAvatar && msg.user && (
              <Text style={styles.senderName}>{msg.user.name}</Text>
            )}
            {hasText && (
              <View style={styles.botMessage}>
                <Text style={styles.botMessageText}>{msg.text}</Text>
              </View>
            )}
            {msg.suggestions && (
              <Suggestion
                suggestions={msg.suggestions}
                handleServicePress={handleServicePress}
              />
            )}
          </View>
        </View>
      )}

      {/* User Message */}
      {isUser && (
        <TouchableOpacity
          style={styles.userMessageWrapper}
          onLongPress={handleLongPress}
          activeOpacity={0.9}
          disabled={!handleDeleteMessage}
        >
          {showAvatar && msg.user && (
            <View style={styles.userMessageHeader}>
              <Text style={styles.timestamp}>{msg.timestamp}</Text>
              <Text style={styles.senderName}>{msg.user.name}</Text>
              <Image source={msg.user.avatar} style={styles.avatar} />
            </View>
          )}

          {(hasText || hasImages) && (
            <View style={styles.userMessage}>
              {hasText && (
                <Text style={styles.userMessageText}>{msg.text}</Text>
              )}
              {hasImages && (
                <View style={styles.imagesRow}>
                  {msg.images?.map((img, i) => {
                    // Ensure image URI is properly formatted
                    const imageUri = typeof img === 'string' 
                      ? img 
                      : img?.uri || img;
                    
                    // If URI doesn't start with http, prepend BASE_URL
                    const fullImageUri = imageUri && !imageUri.startsWith('http') && !imageUri.startsWith('file://')
                      ? `https://telehealth.repla-projects.com/${imageUri}`
                      : imageUri;

                    return (
                      <Image
                        key={`img-${i}`}
                        source={{ uri: fullImageUri }}
                        style={styles.uploadedImage}
                      />
                    );
                  })}
                </View>
              )}
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};
