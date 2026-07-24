import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { colors } from '../../styles/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';

export const ReviewCard = ({ review, isExpanded, onPress }) => {
  const maxLength = 150;
  const shouldTruncate = review.text.length > maxLength && !isExpanded;

  return (
    <TouchableOpacity
      style={styles.reviewCard}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.ratingContainer}>
        {[...Array(5)].map((_, i) => (
          <Ionicons
            key={i}
            name={i < review.rating ? 'star' : 'star-outline'}
            size={16}
            color={i < review.rating ? '#FFD700' : '#DDD'}
          />
        ))}
      </View>
      <View style={styles.reviewHeader}>
        <Text style={styles.authorName}>{review.author}</Text>
        <Text style={styles.reviewDate}> • {review.date}</Text>
      </View>

      <Text style={styles.reviewText} numberOfLines={shouldTruncate ? 3 : 0}>
        {review.text}
      </Text>

      {shouldTruncate && <Text style={styles.readMore}>Read more</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  reviewCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  authorName: {
    fontSize: 13,
    color: colors.secondaryText,
  },
  reviewDate: {
    fontSize: 13,
    color: colors.secondaryText,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 8,
  },
  reviewText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  readMore: {
    color: colors.primary,
    fontWeight: '500',
    marginTop: 4,
    fontSize: 14,
  },
});
