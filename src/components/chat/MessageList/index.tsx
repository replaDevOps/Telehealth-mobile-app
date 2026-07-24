import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Message } from '../Message';
import { Message as MessageType, Service } from '../../../types/chat.types';
import { styles } from './style';
import { colors } from '../../../styles/colors';

interface MessageListProps {
  messages: MessageType[];
  scrollRef: React.RefObject<ScrollView | null>;
  showAvatar: boolean;
  handleServicePress: (service: Service) => void;
  handleDeleteMessage?: (messageID: string) => void;
  isRTL?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  scrollRef,
  showAvatar,
  handleServicePress,
  handleDeleteMessage,
  isRTL = false,
}) => {
  const { t } = useTranslation();

  // Show empty state if no messages
  if (messages.length === 0) {
    return (
      <ScrollView
        ref={scrollRef}
        style={styles.messagesContainer}
        contentContainerStyle={[styles.messagesContent, styles.emptyContent]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            {t('no_messages_yet') || 'No messages yet'}
          </Text>
          <Text style={styles.emptyStateSubtext}>
            {t('start_conversation') || 'Start the conversation by sending a message'}
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.messagesContainer}
      contentContainerStyle={styles.messagesContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {messages.map((msg, index) => (
        <Message
          key={msg.id || `msg-${index}`}
          msg={msg}
          showAvatar={showAvatar}
          handleServicePress={handleServicePress}
          handleDeleteMessage={handleDeleteMessage}
          isRTL={isRTL}
        />
      ))}
    </ScrollView>
  );
};
