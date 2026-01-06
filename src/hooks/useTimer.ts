import {useState, useEffect, useRef, useCallback} from 'react';
import {AppState, AppStateStatus} from 'react-native';
import type {TimerSequence, TimerBlock} from '../types';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface TimerState {
  status: TimerStatus;
  currentBlockIndex: number;
  remainingSeconds: number;
  currentBlock: TimerBlock | null;
  totalElapsedSeconds: number;
  sequenceTotalSeconds: number;
}

export interface TimerControls {
  play: () => void;
  pause: () => void;
  resume: () => void;
  skip: () => void;
  reset: () => void;
}

export function useTimer(sequence: TimerSequence | null) {
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [totalElapsedSeconds, setTotalElapsedSeconds] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const backgroundTimeRef = useRef<number | null>(null);
  const appStateRef = useRef(AppState.currentState);

  // Calculate total sequence duration
  const sequenceTotalSeconds =
    sequence?.blocks.reduce((sum, block) => sum + block.durationSeconds, 0) ?? 0;

  // Get current block
  const currentBlock =
    sequence && currentBlockIndex < sequence.blocks.length
      ? sequence.blocks[currentBlockIndex]
      : null;

  // Initialize remaining seconds when sequence or block changes
  useEffect(() => {
    if (sequence && sequence.blocks.length > 0 && status === 'idle') {
      setRemainingSeconds(sequence.blocks[0].durationSeconds);
      setCurrentBlockIndex(0);
      setTotalElapsedSeconds(0);
    }
  }, [sequence, status]);

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Handle app backgrounding
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      // App going to background
      if (
        appStateRef.current.match(/active/) &&
        nextAppState.match(/inactive|background/)
      ) {
        if (status === 'running') {
          backgroundTimeRef.current = Date.now();
        }
      }

      // App coming to foreground
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        if (status === 'running' && backgroundTimeRef.current !== null) {
          const timeInBackground = Math.floor(
            (Date.now() - backgroundTimeRef.current) / 1000,
          );
          
          // Adjust timer for time spent in background
          let timeRemaining = timeInBackground;
          let adjustedRemaining = remainingSeconds - timeRemaining;
          let newBlockIndex = currentBlockIndex;
          let elapsedInBackground = 0;

          // Track time elapsed in current block before moving to next
          elapsedInBackground += Math.min(timeRemaining, remainingSeconds);

          // Handle multiple block transitions while in background
          while (adjustedRemaining <= 0 && sequence && newBlockIndex < sequence.blocks.length) {
            if (newBlockIndex === sequence.blocks.length - 1) {
              // Last block - sequence is complete
              break;
            }
            // Move to next block
            timeRemaining = Math.abs(adjustedRemaining);
            newBlockIndex++;
            adjustedRemaining = sequence.blocks[newBlockIndex].durationSeconds - timeRemaining;
            
            // Add elapsed time in this block
            elapsedInBackground += Math.min(timeRemaining, sequence.blocks[newBlockIndex].durationSeconds);
          }

          // Check if sequence completed while in background
          if (adjustedRemaining <= 0 && sequence && newBlockIndex === sequence.blocks.length - 1) {
            setStatus('completed');
            setRemainingSeconds(0);
            setCurrentBlockIndex(newBlockIndex);
            setTotalElapsedSeconds(sequenceTotalSeconds);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          } else {
            setRemainingSeconds(Math.max(0, adjustedRemaining));
            setCurrentBlockIndex(newBlockIndex);
            setTotalElapsedSeconds(Math.min(totalElapsedSeconds + elapsedInBackground, sequenceTotalSeconds));
          }

          backgroundTimeRef.current = null;
        }
      }

      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [status, remainingSeconds, currentBlockIndex, totalElapsedSeconds, sequence, sequenceTotalSeconds]);

  // Timer tick logic
  const tick = useCallback(() => {
    setRemainingSeconds(prev => {
      const newRemaining = prev - 1;

      if (newRemaining <= 0) {
        // Check if we should advance to next block
        if (sequence && currentBlockIndex < sequence.blocks.length - 1) {
          const nextIndex = currentBlockIndex + 1;
          setCurrentBlockIndex(nextIndex);
          setTotalElapsedSeconds(e => e + 1);
          return sequence.blocks[nextIndex].durationSeconds;
        } else {
          // Sequence completed
          setStatus('completed');
          setTotalElapsedSeconds(sequenceTotalSeconds);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 0;
        }
      }

      setTotalElapsedSeconds(e => e + 1);
      return newRemaining;
    });
  }, [sequence, currentBlockIndex, sequenceTotalSeconds]);

  // Start/stop interval based on status
  useEffect(() => {
    if (status === 'running') {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status, tick]);

  // Control functions
  const play = useCallback(() => {
    if (!sequence || sequence.blocks.length === 0) return;
    
    if (status === 'idle') {
      setStatus('running');
      setCurrentBlockIndex(0);
      setRemainingSeconds(sequence.blocks[0].durationSeconds);
      setTotalElapsedSeconds(0);
    }
  }, [sequence, status]);

  const pause = useCallback(() => {
    if (status === 'running') {
      setStatus('paused');
    }
  }, [status]);

  const resume = useCallback(() => {
    if (status === 'paused') {
      setStatus('running');
    }
  }, [status]);

  const skip = useCallback(() => {
    if (!sequence || currentBlockIndex >= sequence.blocks.length - 1) {
      setStatus('completed');
      setRemainingSeconds(0);
      setTotalElapsedSeconds(sequenceTotalSeconds);
      return;
    }

    const nextIndex = currentBlockIndex + 1;
    setCurrentBlockIndex(nextIndex);
    setRemainingSeconds(sequence.blocks[nextIndex].durationSeconds);
    
    // Update total elapsed to include skipped block
    setTotalElapsedSeconds(e => e + remainingSeconds);
  }, [sequence, currentBlockIndex, remainingSeconds, sequenceTotalSeconds]);

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setStatus('idle');
    setCurrentBlockIndex(0);
    setTotalElapsedSeconds(0);
    if (sequence && sequence.blocks.length > 0) {
      setRemainingSeconds(sequence.blocks[0].durationSeconds);
    } else {
      setRemainingSeconds(0);
    }
  }, [sequence]);

  const state: TimerState = {
    status,
    currentBlockIndex,
    remainingSeconds,
    currentBlock,
    totalElapsedSeconds,
    sequenceTotalSeconds,
  };

  const controls: TimerControls = {
    play,
    pause,
    resume,
    skip,
    reset,
  };

  return {
    ...state,
    ...controls,
  };
}
