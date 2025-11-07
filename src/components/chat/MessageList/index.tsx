
import React from 'react';
import { ScrollView } from 'react-native';
import { Message } from '../Message';
import { Message as MessageType, Service } from '../../../types/chat.types';
import { styles } from './style';

interface MessageListProps {
  messages: MessageType[];
  scrollRef: React.RefObject<ScrollView>;
  showAvatar: boolean;
  handleServicePress: (service: Service) => void;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, scrollRef, showAvatar, handleServicePress }) => {
  return (
    <ScrollView
      ref={scrollRef}
      style={styles.messagesContainer}
      contentContainerStyle={styles.messagesContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {messages.map((msg, index) => (
        <Message key={msg.id || `msg-${index}`} msg={msg} showAvatar={showAvatar} handleServicePress={handleServicePress} />
      ))}
    </ScrollView>
  );
};
