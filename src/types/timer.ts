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
