import React, {useState, useEffect, useRef} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useTheme, useTimer, useWatchSync} from '../hooks';
import {getSequences} from '../storage';
import type {RootStackParamList, TimerSequence} from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Timer'>;

/**
 * Format seconds into mm:ss format
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Circular progress component with smooth animation
 * 
 * Animation choice: Using Animated API with timing for smooth progress updates.
 * The circle animates in a counterclockwise direction to match countdown semantics.
 * High contrast stroke widths and colors ensure visibility in both light and dark modes.
 */
function CircularProgress({
  progress,
  size = 280,
  strokeWidth = 12,
  color,
  backgroundColor,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  backgroundColor: string;
}) {
  const animatedProgress = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Smooth animation with 300ms duration for responsive feel
    // Using non-native driver since we're animating rotation which affects transform
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress, animatedProgress]);

  return (
    <View style={styles.progressContainer}>
      <View style={[styles.progressCircle, {width: size, height: size}]}>
        {/* Background circle */}
        <View
          style={[
            styles.progressCircleBg,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: backgroundColor,
            },
          ]}
        />
        {/* Progress arc */}
        <Animated.View
          style={[
            styles.progressCircleFg,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: color,
              transform: [
                {rotate: '-90deg'},
                {
                  rotate: animatedProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        />
      </View>
    </View>
  );
}

export function TimerScreen({route}: Props) {
  const theme = useTheme();
  const {sequenceId} = route.params;
  const [sequence, setSequence] = useState<TimerSequence | null>(null);
  const [loading, setLoading] = useState(true);

  // Load sequence from storage
  useEffect(() => {
    async function loadSequence() {
      try {
        const sequences = await getSequences();
        const found = sequences.find(s => s.id === sequenceId);
        setSequence(found || null);
      } catch (error) {
        console.error('Error loading sequence:', error);
      } finally {
        setLoading(false);
      }
    }
    loadSequence();
  }, [sequenceId]);

  // Initialize timer hook
  const timer = useTimer(sequence);

  // Calculate progress (0 to 1)
  const progress = timer.currentBlock
    ? 1 - (timer.remainingSeconds / timer.currentBlock.durationSeconds)
    : 0;

  // Sync timer state to Apple Watch
  useWatchSync(
    timer.currentBlock || timer.status === 'completed'
      ? {
          currentLabel: timer.currentBlock?.label || 'Complete',
          remainingSeconds: timer.remainingSeconds,
          progress: progress,
          isCompleted: timer.status === 'completed',
        }
      : null,
  );

  // Auto-start on mount if idle
  const hasStarted = useRef(false);
  useEffect(() => {
    if (!loading && sequence && timer.status === 'idle' && !hasStarted.current) {
      hasStarted.current = true;
      timer.play();
    }
  }, [loading, sequence, timer]);

  if (loading) {
    return (
      <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!sequence) {
    return (
      <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
        <Text style={[styles.errorText, {color: theme.colors.error}]}>
          Sequence not found
        </Text>
      </View>
    );
  }

  const isRunning = timer.status === 'running';
  const isCompleted = timer.status === 'completed';

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      {/* Sequence name */}
      <View style={styles.header}>
        <Text
          style={[
            styles.sequenceName,
            {color: theme.colors.textSecondary},
            theme.typography.body,
          ]}>
          {sequence.name}
        </Text>
      </View>

      {/* Main timer display */}
      <View style={styles.timerContainer}>
        {/* Circular progress */}
        <View style={styles.circleWrapper}>
          <CircularProgress
            progress={progress}
            color={theme.colors.primary}
            backgroundColor={theme.colors.border}
          />
          
          {/* Time and label overlay */}
          <View style={styles.timerContent}>
            <Text
              style={[
                styles.timeText,
                {color: theme.colors.text},
              ]}>
              {formatTime(timer.remainingSeconds)}
            </Text>
            <Text
              style={[
                styles.blockLabel,
                {color: theme.colors.textSecondary},
                theme.typography.h3,
              ]}
              numberOfLines={2}>
              {timer.currentBlock?.label || 'Complete'}
            </Text>
          </View>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {!isCompleted && (
          <>
            {/* Play/Pause button */}
            <TouchableOpacity
              style={[
                styles.primaryButton,
                {backgroundColor: theme.colors.primary},
              ]}
              onPress={isRunning ? timer.pause : timer.resume}
              activeOpacity={0.8}>
              <Text style={[styles.primaryButtonText, theme.typography.h3]}>
                {isRunning ? 'Pause' : 'Resume'}
              </Text>
            </TouchableOpacity>

            {/* Skip button */}
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                },
              ]}
              onPress={timer.skip}
              activeOpacity={0.8}>
              <Text
                style={[
                  styles.secondaryButtonText,
                  {color: theme.colors.primary},
                  theme.typography.h3,
                ]}>
                Skip Section
              </Text>
            </TouchableOpacity>
          </>
        )}

        {isCompleted && (
          <TouchableOpacity
            style={[
              styles.primaryButton,
              {backgroundColor: theme.colors.success},
            ]}
            onPress={timer.reset}
            activeOpacity={0.8}>
            <Text style={[styles.primaryButtonText, theme.typography.h3]}>
              Restart
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  sequenceName: {
    textAlign: 'center',
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircle: {
    position: 'relative',
  },
  progressCircleBg: {
    position: 'absolute',
  },
  progressCircleFg: {
    position: 'absolute',
    borderLeftColor: 'transparent',
    borderTopColor: 'transparent',
  },
  timerContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: 200,
  },
  timeText: {
    fontSize: 56,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 2,
  },
  blockLabel: {
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  controls: {
    gap: 16,
  },
  primaryButton: {
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
  },
  secondaryButtonText: {
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
