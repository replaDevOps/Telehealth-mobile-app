/*  RatingBottomSheet.tsx  */
import { RatingSvg } from '@assets/icons';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  Animated,
  Dimensions,
  StyleSheet,
  PanResponder,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../styles/colors';
import { CustomButton } from '@components/common/CustomButton';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const RatingBottomSheet = ({ visible, onClose, onSubmit }) => {
  const [rating, setRating] = useState(4);
  const [feedback, setFeedback] = useState('');
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const insets = useSafeAreaInsets();

  const ratingLabels = {
    1: 'Unsatisfied',
    2: 'Needs improvement',
    3: 'Average',
    4: 'Satisfied',
    5: 'Excellent',
  };

  /* ----------  Modal animation  ---------- */
  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const closeModal = () => {
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => onClose?.());
  };

  /* ----------  PanResponder (drag to dismiss)  ---------- */
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 150 || g.vy > 0.5) closeModal();
        else
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
      },
    }),
  ).current;

  const handleSubmit = () => {
    onSubmit?.(rating, feedback);
    setFeedback('');
    setRating(4);
    closeModal();
  };

  const renderStars = () => (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map(star => (
        <TouchableOpacity
          key={star}
          onPress={() => setRating(star)}
          style={styles.starButton}
        >
          <RatingSvg
            color={star <= rating ? colors.yellow : colors.white}
            border={star <= rating ? colors.yellow : '#C4C4C4'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={closeModal}
    >
      {/* ----------  KeyboardAvoidingView (does the lifting)  ---------- */}
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.select({
          ios: 0,
          android: 20,
        })}
      >
        {/* Backdrop */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={closeModal}
        />

        {/* ----------  Bottom sheet  ---------- */}
        <Animated.View
          style={[
            styles.bottomSheet,
            { transform: [{ translateY }] },
            // only safe-area bottom, NO keyboard height here
            { paddingBottom: insets.bottom + 20 },
          ]}
        >
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>

          {/* Scrollable content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            <View style={styles.content}>
              <Text style={styles.title}>Rate Your Experience</Text>
              <Text style={styles.subtitle}>
                Share your feedback to help us improve.
              </Text>

              {renderStars()}
              <Text style={styles.ratingLabel}>{ratingLabels[rating]}</Text>

              <Text style={styles.feedbackLabel}>Tell us more (optional)</Text>

              <View style={styles.textInputContainer}>
                <TextInput
                  placeholder="Share any comments or suggestions..."
                  placeholderTextColor="#999"
                  multiline
                  maxLength={100}
                  value={feedback}
                  onChangeText={setFeedback}
                  style={styles.textInput}
                  textAlignVertical="top"
                />
                <Text style={styles.charCount}>{feedback.length}/100</Text>
              </View>
            </View>
          </ScrollView>

          {/* Sticky submit button */}
          <View style={styles.submitWrapper}>
            <CustomButton title="Submit Feedback" onPress={handleSubmit} />
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

/* ------------------------------------------------- STYLES ------------------------------------------------- */
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#15002E80',
    justifyContent: 'flex-end',
  },
  backdrop: { flex: 1 },

  bottomSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.92, // never taller than 92% of screen
    minHeight: 500,
  },

  handleContainer: { alignItems: 'center', paddingVertical: 12 },
  handle: { width: 40, height: 4, backgroundColor: '#C4C4C4', borderRadius: 2 },

  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
    borderRadius: 18,
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 20,
    color: colors.secondaryText,
    fontWeight: '600',
  },

  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 90 }, // space for sticky button

  content: { paddingHorizontal: 24, paddingTop: 8 },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
    marginBottom: 20,
  },

  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  starButton: { padding: 4 },

  ratingLabel: {
    fontSize: 16,
    color: colors.secondaryText,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },

  feedbackLabel: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    fontWeight: '500',
  },

  textInputContainer: {
    position: 'relative',
    backgroundColor: colors.gray || '#f5f5f5',
    borderRadius: 12,
    minHeight: 100,
    marginBottom: 16,
  },
  textInput: { padding: 16, fontSize: 14, color: colors.text, minHeight: 100 },
  charCount: {
    position: 'absolute',
    bottom: 8,
    right: 16,
    fontSize: 12,
    color: colors.secondaryText || '#888',
  },

  submitWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
});

export default RatingBottomSheet;
