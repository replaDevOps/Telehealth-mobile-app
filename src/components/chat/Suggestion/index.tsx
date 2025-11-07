
import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { colors } from '../../../styles/colors';
import { Service } from '../../../types/chat.types';
import { styles } from './style';

interface SuggestionProps {
  suggestions: Service[];
  handleServicePress: (service: Service) => void;
}

export const Suggestion: React.FC<SuggestionProps> = ({
  suggestions,
  handleServicePress,
}) => {
  return (
    <View style={styles.suggestionsContainer}>
      {suggestions.map(service => (
        <TouchableOpacity
          key={service.id}
          style={styles.suggestionCard}
          onPress={() => handleServicePress(service)}
        >
          <Image source={service.image} style={styles.suggestionImage} />
          <View style={styles.suggestionContent}>
            <Text style={styles.suggestionTitle}>{service.serviceGroup}</Text>
            <View style={styles.suggestionSubtitleRow}>
              <Text style={styles.suggestionSubtitle}>
                {service.serviceName}
              </Text>
              <FontAwesome5
                name="external-link-alt"
                size={12}
                color={colors.primary}
              />
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};
