import React from 'react';
import {
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../styles/colors';
import { styles } from './style';

interface MessageInputProps {
  message: string;
  setMessage: (message: string) => void;
  handleSend: () => void;
  handleImagePick: () => void;
  canSendMessages: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  message,
  setMessage,
  handleSend,
  handleImagePick,
  canSendMessages,
}) => {
  if (!canSendMessages) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      style={styles.inputContainer}
    >
      <TouchableOpacity style={styles.cameraButton} onPress={handleImagePick}>
        <Ionicons
          name="camera-outline"
          size={24}
          color={colors.secondaryText}
        />
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="Message"
        placeholderTextColor={colors.secondaryText}
        value={message}
        onChangeText={setMessage}
        onSubmitEditing={handleSend}
        returnKeyType="send"
        multiline
        maxLength={500}
      />
      <TouchableOpacity
        style={[styles.sendButton]}
        onPress={handleSend}
        disabled={!message.trim()}
      >
        <Ionicons name="send" size={24} color={colors.white} />
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};
