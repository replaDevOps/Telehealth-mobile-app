import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../styles/colors';

const VISIBLE_MS = 3000;
const FADE_MS = 200;

interface SheetToastProps {
  /** Empty string hides it. */
  message: string;
  /** Called when the timer elapses or the user dismisses it. */
  onHide: () => void;
  duration?: number;
}

/**
 * A toast rendered *inside* a bottom sheet's Modal.
 *
 * The real ToastManager cannot be used from inside a sheet. It renders inline
 * in the React root (useModal={false}, which is what stopped toasts freezing
 * the app), and a React Native Modal is a separate native window above that
 * root - zIndex cannot lift a view across native windows, so those toasts are
 * drawn behind the sheet and never seen.
 *
 * This lives in the sheet's own window, so ordinary absolute positioning puts
 * it on top. It deliberately mimics the app toast: same place on screen, same
 * shape, same self-dismissing behaviour, so a message raised from inside a
 * sheet is indistinguishable from one raised anywhere else.
 */
export const SheetToast: React.FC<SheetToastProps> = ({
  message,
  onHide,
  duration = VISIBLE_MS,
}) => {
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  // Held in a ref so the auto-hide timer never captures a stale callback.
  const onHideRef = useRef(onHide);
  onHideRef.current = onHide;

  useEffect(() => {
    if (!message) return;

    opacity.setValue(0);
    Animated.timing(opacity, {
      toValue: 1,
      duration: FADE_MS,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_MS,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) onHideRef.current();
      });
    }, duration);

    return () => clearTimeout(timer);
    // Re-runs on a new message so a second error restarts the timer rather
    // than inheriting the remainder of the first one's.
  }, [message, duration, opacity]);

  if (!message) return null;

  return (
    <Animated.View
      style={[styles.container, { top: insets.top + 8, opacity }]}
      // Let taps through everywhere except the toast itself, so it never
      // blocks the sheet underneath while it is fading.
      pointerEvents="box-none"
    >
      <View style={styles.toast}>
        <Ionicons name="alert-circle" size={22} color="#EB5757" />
        <Text style={styles.message} numberOfLines={3}>
          {message}
        </Text>
        <TouchableOpacity
          onPress={onHide}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={20} color={colors.secondaryText} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 12,
    right: 12,
    // Above the sheet's own content. Same native window, so this works.
    zIndex: 1000,
    elevation: 1000,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 46,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.black,
  },
});

export default SheetToast;
