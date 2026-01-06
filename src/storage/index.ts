/**
 * Storage utilities for persisting data locally
 * 
 * This module provides functions for managing TimerSequence data
 * using AsyncStorage for persistence.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type {TimerSequence} from '../types';

const SEQUENCES_STORAGE_KEY = '@timer_sequences';

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
