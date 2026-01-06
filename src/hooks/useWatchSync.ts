/**
 * Hook for syncing timer state to Apple Watch
 */

import {useEffect} from 'react';
import {NativeModules, Platform} from 'react-native';

const {WatchConnectivityBridge} = NativeModules;

interface TimerState {
  currentLabel: string;
  remainingSeconds: number;
  progress: number;
  isCompleted: boolean;
}

/**
 * Syncs timer state to Apple Watch via WatchConnectivity
 * Only active on iOS platform
 */
export function useWatchSync(timerState: TimerState | null) {
  useEffect(() => {
    // Skip sync on non-iOS platforms
    if (Platform.OS !== 'ios') {
      return;
    }

    // Skip sync if no timer state available
    if (!timerState) {
      return;
    }

    // Skip sync if bridge module not available (older RN versions or build issues)
    if (!WatchConnectivityBridge) {
      return;
    }

    // Send state to watch
    WatchConnectivityBridge.sendTimerState(
      timerState.currentLabel,
      timerState.remainingSeconds,
      timerState.progress,
      timerState.isCompleted,
    );
  }, [timerState]);
}
