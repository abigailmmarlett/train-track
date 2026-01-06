/**
 * Timer data models
 */

export type TimerBlock = {
  id: string;
  label: string;
  durationSeconds: number;
};

export type TimerSequence = {
  id: string;
  name: string;
  blocks: TimerBlock[];
};

/**
 * Validate if a timer sequence is valid and can be used
 * @param sequence The sequence to validate
 * @returns true if valid, false otherwise
 */
export function isValidTimerSequence(sequence: any): sequence is TimerSequence {
  return (
    sequence != null &&
    typeof sequence === 'object' &&
    typeof sequence.id === 'string' &&
    typeof sequence.name === 'string' &&
    Array.isArray(sequence.blocks) &&
    sequence.blocks.every(
      (block: any) =>
        block != null &&
        typeof block === 'object' &&
        typeof block.id === 'string' &&
        typeof block.label === 'string' &&
        typeof block.durationSeconds === 'number' &&
        block.durationSeconds > 0
    )
  );
}
