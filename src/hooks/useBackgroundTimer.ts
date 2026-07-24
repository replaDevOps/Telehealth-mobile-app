import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';

interface UseBackgroundTimerOptions {
  /** Total duration in seconds (e.g., 1800 for 30 minutes) */
  totalDuration: number;
  /** Whether the timer should be active */
  isActive: boolean;
  /** Callback when timer reaches zero */
  onTimeUp?: () => void;
  /** Callback with remaining seconds on each tick */
  onTick?: (remainingSeconds: number) => void;
}

interface UseBackgroundTimerReturn {
  /** Remaining time in seconds */
  remainingSeconds: number;
  /** Elapsed time in seconds since timer started */
  elapsedSeconds: number;
  /** Whether the timer has been initialized */
  isInitialized: boolean;
  /** Formatted time string (MM:SS) */
  formattedTime: string;
  /** Reset the timer */
  resetTimer: () => void;
  /** Start timestamp when timer was initialized */
  startTimestamp: number | null;
}

/**
 * A hook that manages a countdown timer that continues running even when the app is in the background.
 * Uses timestamp-based calculation instead of interval-based counting to ensure accuracy
 * when the app returns from background.
 */
export function useBackgroundTimer({
  totalDuration,
  isActive,
  onTimeUp,
  onTimeUpRef,
  onTick,
}: UseBackgroundTimerOptions & { onTimeUpRef?: React.MutableRefObject<(() => void) | undefined> }): UseBackgroundTimerReturn {
  const [remainingSeconds, setRemainingSeconds] = useState(totalDuration);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Use refs to track state that shouldn't cause re-renders
  const startTimestampRef = useRef<number | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Background timer ref (from react-native-background-timer) if available
  const backgroundIntervalRef = useRef<number | null>(null);
  const hasEndedRef = useRef(false);

  // Calculate remaining time based on start timestamp
  const calculateRemainingTime = useCallback(() => {
    if (!startTimestampRef.current) return totalDuration;
    
    const elapsedMs = Date.now() - startTimestampRef.current;
    const elapsedSeconds = Math.floor(elapsedMs / 1000);
    const remaining = Math.max(0, totalDuration - elapsedSeconds);
    
    return remaining;
  }, [totalDuration]);

  // Reset the timer
  const resetTimer = useCallback(() => {
    startTimestampRef.current = null;
    hasEndedRef.current = false;
    setIsInitialized(false);
    setRemainingSeconds(totalDuration);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [totalDuration]);

  // Handle app state changes (background/foreground)
  useEffect(() => {
    // Attempt to load a native background timer if available (optional dependency)
    let BackgroundTimer: any = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      BackgroundTimer = require('react-native-background-timer');
    } catch (e) {
      BackgroundTimer = null;
    }

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const previousState = appStateRef.current;
      appStateRef.current = nextAppState;

      // When app goes to background, start a background interval if available
      if (
        previousState === 'active' &&
        nextAppState.match(/inactive|background/) &&
        isActive &&
        startTimestampRef.current
      ) {
        if (BackgroundTimer && typeof BackgroundTimer.setInterval === 'function') {
          // Clear any previous background interval
          if (backgroundIntervalRef.current) {
            try { BackgroundTimer.clearInterval(backgroundIntervalRef.current); } catch (e) {}
            backgroundIntervalRef.current = null;
          }

          // Use a 1s interval to keep tracking elapsed time while backgrounded.
          // NOTE: Do NOT call onTimeUp or set hasEndedRef here — React state
          // updates won't render while the app is in the background. The
          // foreground handler below will fire the callback when the user
          // returns to the app.
          backgroundIntervalRef.current = BackgroundTimer.setInterval(() => {
            const remaining = calculateRemainingTime();
            setRemainingSeconds(remaining);

            // Stop ticking once we've hit zero — callback is handled on foreground return
            if (remaining <= 0) {
              try { BackgroundTimer.clearInterval(backgroundIntervalRef.current); } catch (e) {}
              backgroundIntervalRef.current = null;
            }
          }, 1000);
        }
      }

      // When app comes back to foreground, stop background interval and recalculate remaining time
      if (
        previousState.match(/inactive|background/) &&
        nextAppState === 'active' &&
        isActive &&
        startTimestampRef.current
      ) {
        // Clear background interval if we created one
        if (backgroundIntervalRef.current && BackgroundTimer && typeof BackgroundTimer.clearInterval === 'function') {
          try { BackgroundTimer.clearInterval(backgroundIntervalRef.current); } catch (e) {}
          backgroundIntervalRef.current = null;
        }

        console.log('⏰ [useBackgroundTimer] App returned to foreground, recalculating time');
        const remaining = calculateRemainingTime();
        setRemainingSeconds(remaining);

        // Fire onTimeUp when time is up. Always call here even if hasEndedRef
        // was set by a background interval, because React state updates made
        // while the app was in the background may not have rendered.
        if (remaining <= 0) {
          if (!hasEndedRef.current) {
            hasEndedRef.current = true;
          }
          console.log('⏰ [useBackgroundTimer] Time is up after returning from background');
          const callback = onTimeUpRef?.current || onTimeUp;
          callback?.();
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      // Clear any background interval on cleanup
      try {
        if (backgroundIntervalRef.current && BackgroundTimer && typeof BackgroundTimer.clearInterval === 'function') {
          BackgroundTimer.clearInterval(backgroundIntervalRef.current);
        }
      } catch (e) {}
      subscription.remove();
    };
  }, [isActive, calculateRemainingTime, onTimeUp, onTimeUpRef]);

  // Main timer logic
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!isActive) {
      // Reset when becoming inactive
      resetTimer();
      return;
    }

    // Initialize timer when becoming active
    if (!isInitialized) {
      startTimestampRef.current = Date.now();
      hasEndedRef.current = false;
      setIsInitialized(true);
      setRemainingSeconds(totalDuration);
      console.log('⏰ [useBackgroundTimer] Timer initialized with', totalDuration, 'seconds');
    }

    // Start interval to update UI (only runs when app is in foreground)
    intervalRef.current = setInterval(() => {
      const remaining = calculateRemainingTime();
      setRemainingSeconds(remaining);
      onTick?.(remaining);

      if (remaining <= 0 && !hasEndedRef.current) {
        hasEndedRef.current = true;
        console.log('⏰ [useBackgroundTimer] Time is up');
        
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        
        // Use the ref version if available, otherwise fall back to the prop
        const callback = onTimeUpRef?.current || onTimeUp;
        callback?.();
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, isInitialized, totalDuration, calculateRemainingTime, onTimeUp, onTimeUpRef, onTick, resetTimer]);

  // Calculate elapsed seconds
  const elapsedSeconds = totalDuration - remainingSeconds;

  // Format time as MM:SS
  const formattedTime = `${String(Math.floor(remainingSeconds / 60)).padStart(2, '0')}:${String(remainingSeconds % 60).padStart(2, '0')}`;

  return {
    remainingSeconds,
    elapsedSeconds,
    isInitialized,
    formattedTime,
    resetTimer,
    startTimestamp: startTimestampRef.current,
  };
}

export default useBackgroundTimer;
