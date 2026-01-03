import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Platform, ActionSheetIOS, ActivityIndicator } from 'react-native';
import FastImage from '@d11/react-native-fast-image';
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
  const [loadingImages, setLoadingImages] = useState<{ [key: number]: boolean }>({});
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
            {(hasText || hasImages) && (
              <View style={styles.botMessage}>
                {hasText && (
                  <Text style={styles.botMessageText}>{msg.text}</Text>
                )}
                {hasImages && (
                  <View style={styles.botImagesRow}>
                    {msg.images?.map((img, i) => {
                      // Ensure image URI is properly formatted
                      const imageUri = typeof img === 'string' 
                        ? img 
                        : (typeof img === 'object' && img?.uri) ? img.uri : String(img);
                      
                      const isUploading = typeof img === 'object' && img?.isUploading;
                      const isLoading = loadingImages[i] || false;
                      
                      // If URI doesn't start with http, prepend BASE_URL
                      const fullImageUri = imageUri && typeof imageUri === 'string' && !imageUri.startsWith('http') && !imageUri.startsWith('file://')
                        ? `https://telehealth.repla-projects.com/${imageUri}`
                        : (typeof imageUri === 'string' ? imageUri : '');

                      const handleLoadStart = () => {
                        setLoadingImages(prev => ({ ...prev, [i]: true }));
                      };

                      const handleLoadEnd = () => {
                        setLoadingImages(prev => ({ ...prev, [i]: false }));
                      };

                      return (
                        <View key={`img-${i}`} style={styles.imageContainer}>
                          <FastImage
                            source={{ uri: fullImageUri }}
                            style={styles.uploadedImage}
                            resizeMode={FastImage.resizeMode.cover}
                            onLoadStart={handleLoadStart}
                            onLoadEnd={handleLoadEnd}
                            onError={handleLoadEnd}
                          />
                          {(isUploading || isLoading) && (
                            <View style={styles.uploadingOverlay}>
                              <ActivityIndicator size="small" color="#fff" />
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                )}
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
                      : (typeof img === 'object' && img?.uri) ? img.uri : String(img);
                    
                    const isUploading = typeof img === 'object' && img?.isUploading;
                    const isLoading = loadingImages[i] || false;
                    
                    // If URI doesn't start with http, prepend BASE_URL
                    const fullImageUri = imageUri && typeof imageUri === 'string' && !imageUri.startsWith('http') && !imageUri.startsWith('file://')
                      ? `https://telehealth.repla-projects.com/${imageUri}`
                      : (typeof imageUri === 'string' ? imageUri : '');

                    const handleLoadStart = () => {
                      setLoadingImages(prev => ({ ...prev, [i]: true }));
                    };

                    const handleLoadEnd = () => {
                      setLoadingImages(prev => ({ ...prev, [i]: false }));
                    };

                    return (
                      <View key={`img-${i}`} style={styles.imageContainer}>
                        <FastImage
                          source={{ uri: fullImageUri }}
                          style={styles.uploadedImage}
                          resizeMode={FastImage.resizeMode.cover}
                          onLoadStart={handleLoadStart}
                          onLoadEnd={handleLoadEnd}
                          onError={handleLoadEnd}
                        />
                        {(isUploading || isLoading) && (
                          <View style={styles.uploadingOverlay}>
                            <ActivityIndicator size="small" color="#fff" />
                          </View>
                        )}
                      </View>
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
