import {useState, useEffect, useRef, useCallback} from 'react';
import {AppState, AppStateStatus} from 'react-native';
import type {TimerSequence, TimerBlock} from '../types';
import {saveActiveTimerState, clearActiveTimerState} from '../storage';

// Constants
const SECONDS_IN_DAY = 86400; // Maximum reasonable background time

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
  
  // Refs to track latest values without triggering effect re-runs
  const statusRef = useRef(status);
  const remainingSecondsRef = useRef(remainingSeconds);
  const currentBlockIndexRef = useRef(currentBlockIndex);
  const totalElapsedSecondsRef = useRef(totalElapsedSeconds);
  const sequenceRef = useRef(sequence);
  
  // Keep refs in sync
  useEffect(() => {
    statusRef.current = status;
    remainingSecondsRef.current = remainingSeconds;
    currentBlockIndexRef.current = currentBlockIndex;
    totalElapsedSecondsRef.current = totalElapsedSeconds;
    sequenceRef.current = sequence;
  }, [status, remainingSeconds, currentBlockIndex, totalElapsedSeconds, sequence]);

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
      try {
        // App going to background
        if (
          appStateRef.current.match(/active/) &&
          nextAppState.match(/inactive|background/)
        ) {
          if (statusRef.current === 'running') {
            backgroundTimeRef.current = Date.now();
          }
        }

        // App coming to foreground
        if (
          appStateRef.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          if (statusRef.current === 'running' && backgroundTimeRef.current !== null) {
            const now = Date.now();
            const timeInBackground = Math.max(0, Math.floor((now - backgroundTimeRef.current) / 1000));
            
            // Safeguard: if time appears negative or unreasonably large (clock changed), ignore
            if (timeInBackground < 0 || timeInBackground > SECONDS_IN_DAY) {
              console.warn('Invalid background time detected, ignoring:', timeInBackground);
              backgroundTimeRef.current = null;
              appStateRef.current = nextAppState;
              return;
            }
            
            // Adjust timer for time spent in background
            let timeLeftToProcess = timeInBackground;
            let timeProcessed = 0;
            let newBlockIndex = currentBlockIndexRef.current;
            let newRemainingSeconds = remainingSecondsRef.current;
            const seq = sequenceRef.current;

            // Process time through blocks
            while (timeLeftToProcess > 0 && seq && seq.blocks) {
              if (timeLeftToProcess >= newRemainingSeconds) {
                // This block will complete
                timeProcessed += newRemainingSeconds;
                timeLeftToProcess -= newRemainingSeconds;
                
                if (newBlockIndex >= seq.blocks.length - 1) {
                  // Last block - sequence complete
                  setStatus('completed');
                  setRemainingSeconds(0);
                  setCurrentBlockIndex(newBlockIndex);
                  setTotalElapsedSeconds(totalElapsedSecondsRef.current + timeProcessed);
                  if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                  }
                  backgroundTimeRef.current = null;
                  appStateRef.current = nextAppState;
                  return;
                }
                // Move to next block
                newBlockIndex++;
                newRemainingSeconds = seq.blocks[newBlockIndex].durationSeconds;
              } else {
                // Time runs out in this block
                timeProcessed += timeLeftToProcess;
                newRemainingSeconds -= timeLeftToProcess;
                timeLeftToProcess = 0;
              }
            }

            // Update state
            setRemainingSeconds(newRemainingSeconds);
            setCurrentBlockIndex(newBlockIndex);
            setTotalElapsedSeconds(totalElapsedSecondsRef.current + timeProcessed);
            backgroundTimeRef.current = null;
          }
        }

        appStateRef.current = nextAppState;
      } catch (error) {
        console.error('Error handling app state change:', error);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []); // Empty dependency array - handler uses refs for latest values

  // Timer tick logic with error handling
  const tick = useCallback(() => {
    try {
      setRemainingSeconds(prev => {
        const newRemaining = prev - 1;

        if (newRemaining <= 0) {
          // Check if we should advance to next block
          if (sequence && sequence.blocks && currentBlockIndex < sequence.blocks.length - 1) {
            const nextIndex = currentBlockIndex + 1;
            setCurrentBlockIndex(nextIndex);
            setTotalElapsedSeconds(prevElapsed => prevElapsed + 1);
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

        setTotalElapsedSeconds(prevElapsed => prevElapsed + 1);
        return newRemaining;
      });
    } catch (error) {
      console.error('Error in timer tick:', error);
      // Stop timer on error to prevent cascading issues
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setStatus('paused');
    }
  }, [sequence, currentBlockIndex, sequenceTotalSeconds]);

  // Start/stop interval based on status and persist state
  useEffect(() => {
    if (status === 'running') {
      intervalRef.current = setInterval(tick, 1000);
      
      // Persist active timer state
      if (sequence && sequence.id) {
        saveActiveTimerState({
          sequenceId: sequence.id,
          currentBlockIndex,
          remainingSeconds,
          totalElapsedSeconds,
          status: 'running',
          startTime: Date.now(),
        }).catch(err => console.error('Failed to persist timer state:', err));
      }
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      // Persist paused state or clear if idle/completed
      if (status === 'paused' && sequence && sequence.id) {
        saveActiveTimerState({
          sequenceId: sequence.id,
          currentBlockIndex,
          remainingSeconds,
          totalElapsedSeconds,
          status: 'paused',
          startTime: Date.now(),
        }).catch(err => console.error('Failed to persist timer state:', err));
      } else if (status === 'idle' || status === 'completed') {
        clearActiveTimerState().catch(err => console.error('Failed to clear timer state:', err));
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status, tick, sequence, currentBlockIndex, remainingSeconds, totalElapsedSeconds]);

  // Control functions with validation
  const play = useCallback(() => {
    try {
      if (!sequence || !sequence.blocks || sequence.blocks.length === 0) {
        console.warn('Cannot play: invalid sequence');
        return;
      }
      
      if (status === 'idle') {
        setStatus('running');
        setCurrentBlockIndex(0);
        setRemainingSeconds(sequence.blocks[0].durationSeconds);
        setTotalElapsedSeconds(0);
      }
    } catch (error) {
      console.error('Error in play:', error);
    }
  }, [sequence, status]);

  const pause = useCallback(() => {
    try {
      if (status === 'running') {
        setStatus('paused');
      }
    } catch (error) {
      console.error('Error in pause:', error);
    }
  }, [status]);

  const resume = useCallback(() => {
    try {
      if (status === 'paused') {
        setStatus('running');
      }
    } catch (error) {
      console.error('Error in resume:', error);
    }
  }, [status]);

  const skip = useCallback(() => {
    try {
      if (!sequence || !sequence.blocks) {
        console.warn('Cannot skip: invalid sequence');
        return;
      }
      
      if (currentBlockIndex >= sequence.blocks.length - 1) {
        setStatus('completed');
        setRemainingSeconds(0);
        setTotalElapsedSeconds(sequenceTotalSeconds);
        return;
      }
      
      const nextIndex = currentBlockIndex + 1;
      setCurrentBlockIndex(nextIndex);
      setRemainingSeconds(sequence.blocks[nextIndex].durationSeconds);
      
      // Update total elapsed to include the skipped time
      // prevElapsed already includes time spent in current block, so we add the remaining time
      setTotalElapsedSeconds(prevElapsed => prevElapsed + remainingSeconds);
    } catch (error) {
      console.error('Error in skip:', error);
    }
  }, [sequence, currentBlockIndex, remainingSeconds, sequenceTotalSeconds]);

  const reset = useCallback(() => {
    try {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setStatus('idle');
      setCurrentBlockIndex(0);
      setTotalElapsedSeconds(0);
      if (sequence && sequence.blocks && sequence.blocks.length > 0) {
        setRemainingSeconds(sequence.blocks[0].durationSeconds);
      } else {
        setRemainingSeconds(0);
      }
      // Clear persisted state
      clearActiveTimerState().catch(err => console.error('Failed to clear timer state:', err));
    } catch (error) {
      console.error('Error in reset:', error);
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
