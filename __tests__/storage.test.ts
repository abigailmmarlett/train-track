/**
 * @format
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getSequences,
  saveSequences,
  addSequence,
  updateSequence,
  deleteSequence,
} from '../src/storage';
import type {TimerSequence} from '../src/types';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

describe('Storage Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSequences', () => {
    it('should return an empty array when no sequences exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await getSequences();

      expect(result).toEqual([]);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@timer_sequences');
    });

    it('should return parsed sequences when they exist', async () => {
      const mockSequences: TimerSequence[] = [
        {
          id: '1',
          name: 'Test Sequence',
          blocks: [
            {id: 'b1', label: 'Block 1', durationSeconds: 60},
          ],
        },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockSequences),
      );

      const result = await getSequences();

      expect(result).toEqual(mockSequences);
    });

    it('should return an empty array on error', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
        new Error('Storage error'),
      );
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await getSequences();

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('saveSequences', () => {
    it('should save sequences to storage', async () => {
      const mockSequences: TimerSequence[] = [
        {
          id: '1',
          name: 'Test Sequence',
          blocks: [],
        },
      ];
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await saveSequences(mockSequences);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@timer_sequences',
        JSON.stringify(mockSequences),
      );
    });

    it('should throw error when save fails', async () => {
      const mockSequences: TimerSequence[] = [];
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(
        new Error('Storage error'),
      );
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(saveSequences(mockSequences)).rejects.toThrow(
        'Storage error',
      );
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('addSequence', () => {
    it('should add a new sequence to existing sequences', async () => {
      const existingSequences: TimerSequence[] = [
        {
          id: '1',
          name: 'Existing Sequence',
          blocks: [],
        },
      ];
      const newSequence: TimerSequence = {
        id: '2',
        name: 'New Sequence',
        blocks: [
          {id: 'b1', label: 'Block 1', durationSeconds: 30},
        ],
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(existingSequences),
      );
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await addSequence(newSequence);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@timer_sequences',
        JSON.stringify([...existingSequences, newSequence]),
      );
    });

    it('should add sequence to empty storage', async () => {
      const newSequence: TimerSequence = {
        id: '1',
        name: 'First Sequence',
        blocks: [],
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await addSequence(newSequence);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@timer_sequences',
        JSON.stringify([newSequence]),
      );
    });
  });

  describe('updateSequence', () => {
    it('should update an existing sequence', async () => {
      const existingSequences: TimerSequence[] = [
        {
          id: '1',
          name: 'Original Name',
          blocks: [],
        },
        {
          id: '2',
          name: 'Second Sequence',
          blocks: [],
        },
      ];
      const updatedSequence: TimerSequence = {
        id: '1',
        name: 'Updated Name',
        blocks: [{id: 'b1', label: 'New Block', durationSeconds: 45}],
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(existingSequences),
      );
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await updateSequence(updatedSequence);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@timer_sequences',
        JSON.stringify([updatedSequence, existingSequences[1]]),
      );
    });

    it('should throw error when sequence not found', async () => {
      const existingSequences: TimerSequence[] = [
        {
          id: '1',
          name: 'Existing',
          blocks: [],
        },
      ];
      const nonExistentSequence: TimerSequence = {
        id: '999',
        name: 'Does Not Exist',
        blocks: [],
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(existingSequences),
      );
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(updateSequence(nonExistentSequence)).rejects.toThrow(
        'Sequence with id 999 not found',
      );
      consoleSpy.mockRestore();
    });
  });

  describe('deleteSequence', () => {
    it('should delete a sequence by id', async () => {
      const existingSequences: TimerSequence[] = [
        {
          id: '1',
          name: 'First',
          blocks: [],
        },
        {
          id: '2',
          name: 'Second',
          blocks: [],
        },
        {
          id: '3',
          name: 'Third',
          blocks: [],
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(existingSequences),
      );
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await deleteSequence('2');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@timer_sequences',
        JSON.stringify([existingSequences[0], existingSequences[2]]),
      );
    });

    it('should handle deleting non-existent sequence gracefully', async () => {
      const existingSequences: TimerSequence[] = [
        {
          id: '1',
          name: 'First',
          blocks: [],
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(existingSequences),
      );
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await deleteSequence('999');

      // Should save the same sequences (nothing deleted)
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@timer_sequences',
        JSON.stringify(existingSequences),
      );
    });
  });
});
