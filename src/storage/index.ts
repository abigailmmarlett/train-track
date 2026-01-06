/**
 * Storage utilities for persisting data locally
 * 
 * This module provides functions for managing TimerSequence data
 * using AsyncStorage for persistence.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type {TimerSequence} from '../types';

const SEQUENCES_STORAGE_KEY = '@timer_sequences';
const ACTIVE_TIMER_STORAGE_KEY = '@active_timer_state';

export interface ActiveTimerState {
  sequenceId: string;
  currentBlockIndex: number;
  remainingSeconds: number;
  totalElapsedSeconds: number;
  status: 'running' | 'paused';
  startTime: number;
}

/**
 * Get all timer sequences from storage
 * @returns Promise<TimerSequence[]> Array of sequences, empty array if none exist
 */
export async function getSequences(): Promise<TimerSequence[]> {
  try {
    const jsonValue = await AsyncStorage.getItem(SEQUENCES_STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error reading sequences from storage:', error);
    return [];
  }
}

/**
 * Save all timer sequences to storage
 * @param sequences Array of TimerSequence to save
 * @returns Promise<void>
 */
export async function saveSequences(sequences: TimerSequence[]): Promise<void> {
  try {
    const jsonValue = JSON.stringify(sequences);
    await AsyncStorage.setItem(SEQUENCES_STORAGE_KEY, jsonValue);
  } catch (error) {
    console.error('Error saving sequences to storage:', error);
    throw error;
  }
}

/**
 * Add a new timer sequence
 * @param sequence TimerSequence to add
 * @returns Promise<void>
 */
export async function addSequence(sequence: TimerSequence): Promise<void> {
  try {
    const sequences = await getSequences();
    sequences.push(sequence);
    await saveSequences(sequences);
  } catch (error) {
    console.error('Error adding sequence:', error);
    throw error;
  }
}

/**
 * Update an existing timer sequence
 * @param sequence TimerSequence with updated data (matched by id)
 * @returns Promise<void>
 */
export async function updateSequence(sequence: TimerSequence): Promise<void> {
  try {
    const sequences = await getSequences();
    const index = sequences.findIndex(s => s.id === sequence.id);
    
    if (index === -1) {
      throw new Error(`Sequence with id ${sequence.id} not found`);
    }
    
    sequences[index] = sequence;
    await saveSequences(sequences);
  } catch (error) {
    console.error('Error updating sequence:', error);
    throw error;
  }
}

/**
 * Delete a timer sequence by id
 * @param id ID of the sequence to delete
 * @returns Promise<void>
 */
export async function deleteSequence(id: string): Promise<void> {
  try {
    const sequences = await getSequences();
    const filtered = sequences.filter(s => s.id !== id);
    await saveSequences(filtered);
  } catch (error) {
    console.error('Error deleting sequence:', error);
    throw error;
  }
}

/**
 * Save active timer state to storage
 * @param state Active timer state to persist
 * @returns Promise<void>
 */
export async function saveActiveTimerState(state: ActiveTimerState): Promise<void> {
  try {
    const jsonValue = JSON.stringify(state);
    await AsyncStorage.setItem(ACTIVE_TIMER_STORAGE_KEY, jsonValue);
  } catch (error) {
    console.error('Error saving active timer state:', error);
    // Don't throw - timer can continue without persistence
  }
}

/**
 * Get active timer state from storage
 * @returns Promise<ActiveTimerState | null> The saved state or null if none exists
 */
export async function getActiveTimerState(): Promise<ActiveTimerState | null> {
  try {
    const jsonValue = await AsyncStorage.getItem(ACTIVE_TIMER_STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error reading active timer state:', error);
    return null;
  }
}

/**
 * Clear active timer state from storage
 * @returns Promise<void>
 */
export async function clearActiveTimerState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ACTIVE_TIMER_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing active timer state:', error);
    // Don't throw - not critical
  }
}
