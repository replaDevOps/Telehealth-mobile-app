
import React from 'react';
import { View, Text, Image } from 'react-native';
import { Suggestion } from '../Suggestion';
import { Message as MessageType, Service } from '../../../types/chat.types';
import { styles } from './style';

interface MessageProps {
  msg: MessageType;
  showAvatar: boolean;
  handleServicePress: (service: Service) => void;
}

export const Message: React.FC<MessageProps> = ({ msg, showAvatar, handleServicePress }) => {
  const isUser = msg.type === 'user';
  const hasText = msg.text && msg.text.trim().length > 0;
  const hasImages = msg.images && msg.images.length > 0;

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
            {msg.suggestions && <Suggestion suggestions={msg.suggestions} handleServicePress={handleServicePress} />}
          </View>
        </View>
      )}

      {/* User Message */}
      {isUser && (
        <View style={styles.userMessageWrapper}>
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
                  {msg.images?.map((img, i) => (
                    <Image
                      key={`img-${i}`}
                      source={{ uri: img.uri }}
                      style={styles.uploadedImage}
                    />
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
};
