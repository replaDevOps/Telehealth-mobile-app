
import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
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
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.suggestionsContainer}
    >
      {suggestions.map(service => {
        const loyaltyPts = service.totalLoyalityPoints ?? service.bonusLoyalityPoints;
        const showLoyalty = loyaltyPts && Number(loyaltyPts) > 0;
        const subtitle = service.serviceGroup || service.type || 'Service';

        return (
          <TouchableOpacity
            key={service.id}
            style={styles.suggestionCard}
            onPress={() => handleServicePress(service)}
            activeOpacity={0.85}
          >
            <Image source={service.image} style={styles.suggestionImage} />
            <View style={styles.suggestionContent}>
              <Text style={styles.suggestionTitle} numberOfLines={1} ellipsizeMode="tail">
                {service.serviceName.charAt(0).toUpperCase() + service.serviceName.slice(1).toLowerCase()}
              </Text>
              <Text style={styles.categoryTagText}>
                {service.category === 'device' ? 'Device' : 'Service'}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};
